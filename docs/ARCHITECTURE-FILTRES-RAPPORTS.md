# Architecture des filtres et du tri - Rapports

## Vue d'ensemble

Le système de filtrage et de tri des rapports est conçu pour être performant, intuitif et extensible. Il utilise des techniques modernes de React pour optimiser les performances et offrir une expérience utilisateur fluide.

## Architecture technique

### 1. Gestion d'état

```typescript
// États pour les données
const [allLists, setAllLists] = useState<List[]>([])           // Toutes les listes
const [selectedLists, setSelectedLists] = useState<Set<string>>(new Set())

// États pour les filtres
const [filterVisibility, setFilterVisibility] = useState<'all' | 'public' | 'private'>('all')
const [filterCategory, setFilterCategory] = useState<string>('all')
const [filterPeriod, setFilterPeriod] = useState<string>('all')

// États pour le tri
const [sortBy, setSortBy] = useState<'title' | 'updated' | 'albums' | 'period'>('title')
const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

// État UI
const [showFilters, setShowFilters] = useState(false)
```

### 2. Extraction des options de filtrage

Les catégories et périodes sont extraites dynamiquement des listes :

```typescript
const categories = useMemo(() => {
  const cats = new Set<string>()
  allLists.forEach(list => {
    list.categories?.forEach(lc => cats.add(lc.category.name))
  })
  return Array.from(cats).sort()
}, [allLists])

const periods = useMemo(() => {
  const pers = new Set<string>()
  allLists.forEach(list => {
    if (list.period) pers.add(list.period)
  })
  return Array.from(pers).sort()
}, [allLists])
```

**Avantages:**
- Pas de liste statique à maintenir
- Les options correspondent toujours aux données réelles
- Utilisation de `useMemo` pour éviter les recalculs inutiles

### 3. Application des filtres et du tri

Tout le filtrage et le tri est fait côté client avec `useMemo` :

```typescript
const lists = useMemo(() => {
  let filtered = [...allLists]
  
  // 1. Filtrer par visibilité
  if (filterVisibility === 'public') {
    filtered = filtered.filter(l => l.isPublic)
  } else if (filterVisibility === 'private') {
    filtered = filtered.filter(l => !l.isPublic)
  }
  
  // 2. Filtrer par catégorie
  if (filterCategory !== 'all') {
    filtered = filtered.filter(l => 
      l.categories?.some(lc => lc.category.name === filterCategory)
    )
  }
  
  // 3. Filtrer par période
  if (filterPeriod !== 'all') {
    filtered = filtered.filter(l => l.period === filterPeriod)
  }
  
  // 4. Trier
  filtered.sort((a, b) => {
    let comparison = 0
    
    switch (sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title)
        break
      case 'updated':
        comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        break
      case 'albums':
        comparison = a._count.listAlbums - b._count.listAlbums
        break
      case 'period':
        comparison = (a.period || '').localeCompare(b.period || '')
        break
    }
    
    return sortOrder === 'asc' ? comparison : -comparison
  })
  
  return filtered
}, [allLists, filterVisibility, filterCategory, filterPeriod, sortBy, sortOrder])
```

### 4. Détection des filtres actifs

```typescript
const hasActiveFilters = () => {
  return filterVisibility !== 'all' || 
         filterCategory !== 'all' || 
         filterPeriod !== 'all'
}
```

### 5. Réinitialisation des filtres

```typescript
const resetFilters = () => {
  setFilterVisibility('all')
  setFilterCategory('all')
  setFilterPeriod('all')
  setSortBy('title')
  setSortOrder('asc')
}
```

## Optimisations de performance

### 1. useMemo pour éviter les recalculs

Chaque calcul coûteux utilise `useMemo` avec des dépendances précises :

- **Extraction catégories/périodes:** Recalculé uniquement si `allLists` change
- **Filtrage/tri:** Recalculé uniquement si les critères ou les données changent

### 2. Filtrage côté client

**Avantages:**
- Pas de requête serveur à chaque changement de filtre
- Réponse instantanée pour l'utilisateur
- Réduit la charge serveur

**Quand c'est approprié:**
- Collections de taille moyenne (< 1000 listes)
- Données déjà chargées
- Filtres simples sans logique complexe

### 3. Set pour les sélections

Utilisation de `Set<string>` pour les listes sélectionnées :

```typescript
const [selectedLists, setSelectedLists] = useState<Set<string>>(new Set())
```

**Avantages:**
- Opérations O(1) pour ajout/suppression
- Pas de doublons
- Vérification rapide avec `has()`

## Interface utilisateur

### 1. Panneau de filtres pliable

```tsx
<button onClick={() => setShowFilters(!showFilters)}>
  <SlidersHorizontal />
  Filtres
  {hasActiveFilters() && <Badge>{count}</Badge>}
</button>
```

**UX:**
- Badge pour indiquer les filtres actifs
- Panneau pliable pour économiser l'espace
- Animation smooth pour l'ouverture/fermeture

### 2. Sélecteurs intuitifs

```tsx
<select value={filterVisibility} onChange={...}>
  <option value="all">Toutes</option>
  <option value="public">Publiques</option>
  <option value="private">Privées</option>
</select>
```

### 3. Bouton de tri avec icône

```tsx
<button onClick={() => setSortOrder(order === 'asc' ? 'desc' : 'asc')}>
  <ArrowUpDown />
  {sortOrder === 'asc' ? 'Croissant (A→Z)' : 'Décroissant (Z→A)'}
</button>
```

### 4. Compteur dynamique

```tsx
<h2>
  Mes Listes ({lists.length}
  {allLists.length !== lists.length && ` sur ${allLists.length}`})
</h2>
```

## API et transmission des paramètres

Les paramètres de tri sont transmis à l'API :

```typescript
const res = await fetch('/api/reports/generate', {
  method: 'POST',
  body: JSON.stringify({
    listIds: Array.from(selectedLists),
    sortBy,
    sortOrder
  })
})
```

Côté serveur, l'API applique le même tri :

```typescript
lists.sort((a: any, b: any) => {
  let comparison = 0
  
  switch (sortBy) {
    case 'title':
      comparison = a.title.localeCompare(b.title)
      break
    // ... autres cas
  }
  
  return sortOrder === 'asc' ? comparison : -comparison
})
```

**Pourquoi dupliquer le tri ?**
- Le tri côté client affecte l'affichage
- Le tri côté serveur garantit l'ordre dans le rapport exporté
- Les deux utilisent la même logique pour cohérence

## Tests

Les tests couvrent :

1. **Filtrage unitaire:** Chaque filtre individuellement
2. **Tri unitaire:** Chaque option de tri dans les deux sens
3. **Combinaisons:** Filtres combinés
4. **Extraction:** Catégories et périodes uniques
5. **Comptage:** Nombre de filtres actifs

Voir `__tests__/reports-filters.test.ts` pour les détails.

## Extensibilité

### Ajouter un nouveau filtre

1. Ajouter l'état :
```typescript
const [filterNewField, setFilterNewField] = useState<string>('all')
```

2. Ajouter la logique de filtrage dans `useMemo` :
```typescript
if (filterNewField !== 'all') {
  filtered = filtered.filter(l => l.newField === filterNewField)
}
```

3. Ajouter le sélecteur dans l'UI :
```tsx
<select value={filterNewField} onChange={...}>
  <option value="all">Tous</option>
  {/* options */}
</select>
```

4. Mettre à jour `hasActiveFilters()` :
```typescript
return filterVisibility !== 'all' || 
       filterCategory !== 'all' || 
       filterPeriod !== 'all' ||
       filterNewField !== 'all'
```

### Ajouter une nouvelle option de tri

1. Ajouter le type :
```typescript
const [sortBy, setSortBy] = useState<'title' | 'updated' | 'albums' | 'period' | 'newField'>('title')
```

2. Ajouter le cas dans le switch :
```typescript
case 'newField':
  comparison = a.newField.localeCompare(b.newField)
  break
```

3. Ajouter l'option dans le sélecteur :
```tsx
<option value="newField">Nouveau champ</option>
```

## Limitations et considérations

### Limite de performance

**Côté client:**
- Filtrage/tri rapide jusqu'à ~1000 listes
- Au-delà, envisager le filtrage côté serveur avec pagination

### Persistance

**Actuellement:**
- Les filtres ne sont pas sauvegardés entre les sessions
- Les préférences sont réinitialisées à chaque visite

**Amélioration possible:**
- Sauvegarder les préférences dans localStorage
- Restaurer les filtres au chargement

### Synchronisation

**Important:**
- Le tri côté client et serveur doit rester synchronisé
- Tout changement de logique de tri doit être fait aux deux endroits

## Bonnes pratiques

1. **Toujours utiliser `useMemo`** pour les calculs coûteux
2. **Dépendances précises** dans useMemo pour éviter les recalculs
3. **Badge visuel** pour indiquer les filtres actifs
4. **Bouton reset** facilement accessible
5. **Tests unitaires** pour chaque combinaison de filtres
6. **Documentation** des options de filtrage/tri

## Ressources

- [React useMemo](https://react.dev/reference/react/useMemo)
- [Set en JavaScript](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Set)
- [Array.sort()](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
- [String.localeCompare()](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare)
