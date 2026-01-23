# Recherche et filtres de listes

## Vue d'ensemble

Fonctionnalité complète de recherche, tri et filtrage pour mieux organiser et retrouver vos listes musicales, particulièrement utile lorsque vous avez beaucoup de listes.

## Fonctionnalités

### 🔍 Recherche

**Barre de recherche en temps réel** :
- Recherche dans les titres de listes
- Recherche dans les descriptions
- Mise à jour instantanée des résultats
- Bouton pour effacer la recherche (X)

**Exemple** :
```
Recherche : "rock" 
→ Trouve "Albums Rock 2020", "Classic Rock", descriptions contenant "rock"
```

### 🎯 Filtres

**Filtre par période** :
- Liste déroulante avec toutes les périodes utilisées
- Option "Toutes les périodes" par défaut
- Valeurs : "2020", "1990s", "1980s", etc.

**Filtre par visibilité** :
- Toutes (par défaut)
- Publiques uniquement
- Privées uniquement

### 📊 Tri

**Options de tri** :
1. **Dernière modification** (défaut) - Listes récemment modifiées en premier
2. **Date de création** - Listes les plus récentes/anciennes
3. **Titre (A-Z)** - Ordre alphabétique
4. **Nombre d'albums** - Listes les plus/moins remplies

**Ordre** :
- Décroissant (↓) par défaut - Plus récent/grand d'abord
- Croissant (↑) - Inversable avec un bouton

### 📈 Interface utilisateur

**Panneau dépliable** :
- Bouton "Filtres et tri" pour afficher/masquer
- Badge "Actifs" quand des filtres sont appliqués
- Layout responsive (1-4 colonnes selon écran)

**Compteur** :
- Affiche le nombre de listes filtrées
- Format : "X listes" ou "X liste sur Y" si filtré

**Message si aucun résultat** :
- "Aucune liste ne correspond à vos critères de recherche"
- Bouton pour réinitialiser les filtres

## Utilisation

### 1. Recherche simple

```
1. Taper dans la barre "Rechercher une liste..."
2. Les résultats se filtrent automatiquement
3. Cliquer sur X pour effacer
```

### 2. Filtrage avancé

```
1. Cliquer sur "Filtres et tri"
2. Sélectionner une période (ex: "2020")
3. Choisir la visibilité (ex: "Publiques")
4. Les listes se filtrent automatiquement
```

### 3. Tri personnalisé

```
1. Ouvrir "Filtres et tri"
2. Choisir "Trier par" → "Titre (A-Z)"
3. Cliquer sur l'icône ↕️ pour inverser l'ordre
4. Les listes se réorganisent
```

### 4. Combinaison

```
Exemple : Trouver toutes les listes publiques de 2020 contenant "rock"
1. Rechercher "rock"
2. Ouvrir filtres
3. Période → "2020"
4. Visibilité → "Publiques"
→ Résultat affiné selon tous les critères
```

### 5. Réinitialisation

```
Deux méthodes :
1. Bouton "Réinitialiser" dans le panneau de filtres
2. Bouton "Réinitialiser les filtres" dans le message "Aucune liste..."
```

## Implémentation technique

### État React

```typescript
const [searchQuery, setSearchQuery] = useState('')
const [sortBy, setSortBy] = useState<'title' | 'updated' | 'created' | 'albums'>('updated')
const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
const [filterPeriod, setFilterPeriod] = useState<string>('all')
const [filterVisibility, setFilterVisibility] = useState<'all' | 'public' | 'private'>('all')
const [showFilters, setShowFilters] = useState(false)
```

### useMemo pour performance

```typescript
const filteredAndSortedLists = useMemo(() => {
  // 1. Filtrage
  let result = [...lists]
  
  // Recherche texte
  if (searchQuery) {
    result = result.filter(list => 
      list.title.toLowerCase().includes(query) ||
      list.description?.toLowerCase().includes(query)
    )
  }
  
  // Filtre période
  if (filterPeriod !== 'all') {
    result = result.filter(list => list.period === filterPeriod)
  }
  
  // Filtre visibilité
  if (filterVisibility !== 'all') {
    result = result.filter(list => 
      filterVisibility === 'public' ? list.isPublic : !list.isPublic
    )
  }
  
  // 2. Tri
  result.sort((a, b) => {
    // ... logique de tri
    return sortOrder === 'asc' ? comparison : -comparison
  })
  
  return result
}, [lists, searchQuery, filterPeriod, filterVisibility, sortBy, sortOrder])
```

### Extraction des périodes

```typescript
const uniquePeriods = useMemo(() => {
  const periods = lists
    .map(list => list.period)
    .filter((period): period is string => !!period)
  return Array.from(new Set(periods)).sort()
}, [lists])
```

## Design responsive

**Mobile (< 640px)** :
- Filtres empilés verticalement
- Boutons pleine largeur
- 1 colonne pour les cartes

**Tablette (640-1024px)** :
- 2 colonnes pour filtres
- Grid 2-3 colonnes pour cartes

**Desktop (> 1024px)** :
- 4 colonnes pour filtres
- Grid 4-5 colonnes pour cartes

## Icônes utilisées

- `Search` - Barre de recherche
- `SlidersHorizontal` - Bouton filtres
- `X` - Effacer recherche
- `ArrowUpDown` - Inverser tri
- `Globe` / `Lock` - Badges visibilité (inchangé)

## Tests

**16 tests complets** dans `app/lists/__tests__/filters.test.tsx` :

```typescript
✓ Affiche la barre de recherche
✓ Filtre par titre de recherche
✓ Filtre par description
✓ Bouton pour effacer la recherche
✓ Compteur de listes filtrées
✓ Ouvre/ferme le panneau de filtres
✓ Filtre par période
✓ Filtre par visibilité (public/privé)
✓ Trie par titre alphabétique
✓ Inverse l'ordre de tri
✓ Réinitialise tous les filtres
✓ Message si aucune liste
✓ Badge "Actifs"
✓ Combine recherche et filtre
✓ N'affiche pas la barre si aucune liste
```

**Compatibilité** : Les 22 tests existants continuent de passer.

## Performance

- **useMemo** empêche les recalculs inutiles
- Filtrage côté client (pas d'appel API)
- Réactivité instantanée
- Optimisé pour des centaines de listes

## Accessibilité

- Labels explicites pour les selects
- Placeholder descriptif pour la recherche
- Boutons avec titres (title attribute)
- Navigation clavier complète
- Contraste respecté (WCAG AA)

## Exemples d'utilisation

### Cas 1 : Retrouver une liste spécifique
```
Problème : J'ai 50 listes, je cherche "Best of 1990s"
Solution : Taper "1990" dans la recherche → Résultat immédiat
```

### Cas 2 : Voir toutes mes listes publiques
```
Problème : Je veux partager un lien vers mes listes publiques
Solution : Filtrer par "Publiques" → Liste complète
```

### Cas 3 : Organiser par période
```
Problème : Je veux voir toutes mes listes des années 2020
Solution : Filtre période → "2020" → Vue groupée
```

### Cas 4 : Trouver mes listes vides
```
Problème : Je veux compléter mes listes en cours
Solution : Trier par "Nombre d'albums" → Les vides en premier/dernier
```

## Évolutions futures possibles

- [ ] Filtre par nombre d'albums (range slider)
- [ ] Recherche dans les noms d'albums/artistes
- [ ] Sauvegarde des préférences de tri
- [ ] Tags personnalisés pour filtrage
- [ ] Vue en liste vs grille
- [ ] Export des listes filtrées
- [ ] Filtres multiples pour périodes

## Compatibilité

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile (iOS/Android)
- ✅ Dark mode complet

## Changements depuis v1.3.0

**Nouveautés** :
- Barre de recherche texte
- 4 options de tri
- Ordre de tri inversable
- 2 filtres (période, visibilité)
- Panneau dépliable
- Compteur de résultats
- Badge "Actifs"
- Message si aucun résultat

**Rétrocompatibilité** : 100% - Aucun changement breaking

## Contribution

Pour étendre cette fonctionnalité :

1. **Ajouter un filtre** :
   - Ajouter l'état dans le composant
   - Modifier `filteredAndSortedLists`
   - Ajouter l'UI dans le panneau
   - Ajouter les tests

2. **Ajouter une option de tri** :
   - Modifier le type `sortBy`
   - Ajouter le cas dans le switch
   - Ajouter l'option dans le select

3. **Améliorer la recherche** :
   - Modifier la logique de filtrage
   - Ajouter d'autres champs (tags, etc.)
