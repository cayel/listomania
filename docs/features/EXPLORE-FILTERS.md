# 🔍 Page Explorer - Recherche et filtres

## Vue d'ensemble

La page **Explorer** (`/explore`) permet de découvrir les listes publiques créées par la communauté. Elle dispose d'un système avancé de recherche et de filtrage pour trouver rapidement les listes qui vous intéressent.

**Accès** : Menu principal → "Explorer" ou directement à `/explore`

## ✨ Fonctionnalités

### 🔍 Recherche textuelle en temps réel

**Recherche multi-critères simultanés** :
- Titre de la liste
- Description
- Nom de l'auteur
- Période/année

**Caractéristiques** :
- Filtrage instantané lors de la saisie
- Insensible à la casse
- Bouton X pour effacer rapidement
- Résultats mis à jour en temps réel

**Exemple** :
```
Recherche : "jazz"
→ Trouve :
   • "Best of Jazz 1970"
   • "Modern Jazz Collection"
   • Liste créée par "JazzLover42"
   • Liste avec description "Albums de jazz fusion"
```

### 📊 Options de tri

Quatre critères de tri disponibles :

1. **Plus récentes** (par défaut)
   - Dernières listes créées ou modifiées
   - Ordre : décroissant

2. **Titre (A-Z)**
   - Ordre alphabétique
   - Inversable : A→Z ou Z→A

3. **Nombre d'albums**
   - Trie par quantité d'albums
   - Par défaut : listes les plus fournies d'abord

4. **Période/Année**
   - Ordre chronologique des périodes
   - Ex: "1960s" → "1970s" → "2020"

### 🔄 Inversion d'ordre

- Bouton avec icône `ArrowUpDown` (↕️)
- Bascule entre croissant et décroissant
- Fonctionne pour tous les types de tri

### 🏷️ Filtre par période

- **Extraction automatique** des périodes uniques
- Menu déroulant avec toutes les périodes utilisées
- Option "Toutes les périodes" par défaut
- Affiche uniquement les listes de la période sélectionnée

**Périodes typiques** :
- Années spécifiques : "2024", "2023"
- Décennies : "1980s", "1990s", "2000s"
- Périodes personnalisées : "Années 70-80", "2010-2020"

### 📈 Interface panneau de filtres

- **Collapsible** : Cliquez sur "Filtres" pour ouvrir/fermer
- **Badge de notification** : Point bleu quand filtres actifs
- **Layout responsive** : Grille adaptative selon taille d'écran
- **Compteur intelligent** :
  - Format standard : "X listes"
  - Format filtré : "X listes sur Y" (Y = total sans filtres)

## 📖 Guide d'utilisation

### Scénario 1 : Trouver des listes des années 70

```
Objectif : Voir toutes les listes consacrées aux années 70

Étapes :
1. Aller sur /explore
2. Cliquer sur "Filtres"
3. Période/Année → Sélectionner "1970s"
4. Les résultats affichent uniquement les listes de cette période

Résultat : Liste filtrée de toutes les collections années 70
```

### Scénario 2 : Chercher des listes de Jazz

```
Objectif : Trouver toutes les listes liées au Jazz

Étapes :
1. Taper "Jazz" dans la barre de recherche
2. La recherche filtre automatiquement :
   - Titres contenant "Jazz"
   - Descriptions mentionnant le Jazz
   - Listes créées par des utilisateurs avec "Jazz" dans leur nom
   - Périodes contenant "Jazz"

Résultat : Toutes les listes en rapport avec le Jazz
```

### Scénario 3 : Voir les plus grandes collections

```
Objectif : Découvrir les listes les plus complètes

Étapes :
1. Cliquer sur "Filtres"
2. Trier par → "Nombre d'albums"
3. S'assurer que l'ordre est décroissant (↓)

Résultat : Listes triées par taille, plus grande en premier
```

### Scénario 4 : Listes Rock des années 80 par ordre alphabétique

```
Objectif : Combiner recherche, période et tri

Étapes :
1. Rechercher "Rock" dans la barre
2. Ouvrir les filtres
3. Période → Sélectionner "1980s"
4. Trier par → "Titre (A-Z)"
5. Ordre → Croissant

Résultat : Listes Rock années 80 triées de A à Z
```

### Scénario 5 : Découvrir les dernières listes ajoutées

```
Objectif : Voir les nouveautés de la communauté

Étapes :
1. Aller sur /explore
2. Par défaut : tri "Plus récentes"
3. Parcourir les premières listes

Résultat : Dernières listes créées/modifiées en premier
```

### Scénario 6 : Réinitialiser tous les filtres

```
Objectif : Revenir à la vue complète

Méthode 1 :
- Cliquer sur X dans la barre de recherche
- Remettre période sur "Toutes"

Méthode 2 :
- Recharger la page

Résultat : Vue complète sans filtres
```

## 🛠️ Architecture technique

### État du composant

```typescript
const [searchQuery, setSearchQuery] = useState('')
const [sortBy, setSortBy] = useState<'updated' | 'title' | 'albums' | 'period'>('updated')
const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
const [filterPeriod, setFilterPeriod] = useState<string>('')
const [showFilters, setShowFilters] = useState(false)
```

### Extraction des périodes uniques

```typescript
const uniquePeriods = useMemo(() => {
  const periods = new Set<string>()
  lists.forEach(list => {
    if (list.period) {
      periods.add(list.period)
    }
  })
  return Array.from(periods).sort()
}, [lists])
```

### Logique de filtrage et tri

```typescript
const filteredAndSortedLists = useMemo(() => {
  let result = [...lists]

  // 1. Filtre recherche textuelle
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase()
    result = result.filter(list => 
      list.title.toLowerCase().includes(query) ||
      list.description?.toLowerCase().includes(query) ||
      list.user.name?.toLowerCase().includes(query) ||
      list.period?.toLowerCase().includes(query)
    )
  }

  // 2. Filtre par période
  if (filterPeriod) {
    result = result.filter(list => list.period === filterPeriod)
  }

  // 3. Tri
  result.sort((a, b) => {
    let comparison = 0
    
    switch (sortBy) {
      case 'updated':
        comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        break
      case 'title':
        comparison = a.title.localeCompare(b.title)
        break
      case 'albums':
        comparison = (b._count?.albums || 0) - (a._count?.albums || 0)
        break
      case 'period':
        comparison = (a.period || '').localeCompare(b.period || '')
        break
    }
    
    return sortOrder === 'asc' ? comparison : -comparison
  })

  return result
}, [lists, searchQuery, sortBy, sortOrder, filterPeriod])
```

### Badge de filtres actifs

```typescript
const hasActiveFilters = useMemo(() => {
  return searchQuery.trim() !== '' || filterPeriod !== ''
}, [searchQuery, filterPeriod])
```

### Compteur intelligent

```typescript
<div className="text-sm text-gray-600 dark:text-gray-400">
  {filteredAndSortedLists.length === lists.length
    ? `${lists.length} liste${lists.length !== 1 ? 's' : ''}`
    : `${filteredAndSortedLists.length} liste${filteredAndSortedLists.length !== 1 ? 's' : ''} sur ${lists.length}`
  }
</div>
```

## 📱 Design responsive

### Layout adaptatif

- **Desktop (> 1200px)** : 4 colonnes de filtres
- **Tablette (768-1200px)** : 2 colonnes
- **Mobile (< 768px)** : 1 colonne, filtres empilés

### Optimisations mobile

- Barre de recherche full-width
- Boutons plus grands pour touch
- Panneau de filtres dépliable pour économiser l'espace

## 🎨 Expérience utilisateur

### Retours visuels

- **Badge bleu** : Indication de filtres actifs
- **Compteur dynamique** : Nombre de résultats en temps réel
- **Animation** : Ouverture/fermeture fluide du panneau
- **Message vide** : Si aucun résultat, message explicatif

### Performance

- **useMemo** pour éviter recalculs inutiles
- Filtrage côté client pour réactivité instantanée
- Extraction des périodes cachée (calculée 1 fois)

### Accessibilité

- Labels explicites sur tous les contrôles
- Navigation clavier supportée
- Contraste suffisant pour lisibilité
- Focus visible sur éléments interactifs

## 💡 Conseils et astuces

### Pour les utilisateurs

✅ **Recherche large puis affinage**
- Commencez par une recherche large
- Affinez avec les filtres si trop de résultats

✅ **Combinaison puissante**
- Combinez recherche + période + tri pour résultats précis
- Ex: "rock" + "1980s" + tri par titre

✅ **Badge de notification**
- Le point bleu indique des filtres actifs
- Réinitialisez si vous ne trouvez rien

✅ **Tri par albums**
- Utile pour trouver les collections les plus complètes
- Ou les plus légères si vous inversez l'ordre

### Pour les développeurs

✅ **Extensibilité**
- Structure modulaire facile à étendre
- Ajout de nouveaux filtres simple :
  ```typescript
  const [filterGenre, setFilterGenre] = useState<string>('')
  
  if (filterGenre) {
    result = result.filter(list => 
      list.categories?.some(c => c.category.name === filterGenre)
    )
  }
  ```

✅ **Performance**
- Toujours wrapper dans `useMemo`
- Éviter recalculs à chaque render

✅ **Tests**
- Tester avec datasets variés
- Cas limites : 0 résultats, recherche vide, caractères spéciaux

## 🐛 Dépannage

### Aucune liste ne s'affiche

**Cause** : Filtres trop restrictifs

**Solution** :
1. Vérifier le badge "Actifs"
2. Effacer la recherche (X)
3. Remettre période sur "Toutes"

### Le tri ne fonctionne pas

**Cause** : Ordre inversé par erreur

**Solution** :
1. Vérifier l'icône de direction (↑/↓)
2. Cliquer sur l'icône pour inverser

### Les périodes sont vides

**Cause** : Aucune liste n'a de période définie

**Solution** :
- Normal si communauté n'utilise pas les périodes
- Filtre sera vide ou masqué

### Performances lentes

**Cause** : Trop de listes à filtrer côté client

**Solution future** :
- Paginer les résultats
- Filtrage côté serveur si > 1000 listes

## 📚 Voir aussi

- [Génération de rapports](REPORTS.md) - Rapports avec filtres similaires
- [Gestion de listes](LISTS-MANAGEMENT.md) - Créer et modifier des listes
- [Partage](SHARING.md) - Partager vos listes publiques
- [Statistiques](STATISTICS.md) - Analyser vos collections

---

**Fichier** : [app/explore/page.tsx](../../app/explore/page.tsx)  
**Version** : 1.3.0+  
**Dernière mise à jour** : Janvier 2025
