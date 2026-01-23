# Filtres et recherche - Page Explore

## 📋 Vue d'ensemble

La page **Explore** permet de découvrir les listes publiques créées par la communauté avec un système avancé de recherche et de filtrage pour trouver rapidement les listes qui vous intéressent.

## ✨ Fonctionnalités

### 🔍 Recherche textuelle
- **Champ de recherche en temps réel** : Filtrage instantané lors de la saisie
- **Recherche multi-critères** :
  - Titre de la liste
  - Description
  - Nom de l'auteur
  - Période/année

### 📊 Tri des résultats
Triez les listes selon 4 critères différents :
1. **Plus récentes** (par défaut) - Dernières listes créées/modifiées
2. **Titre (A-Z)** - Ordre alphabétique
3. **Nombre d'albums** - Du plus au moins fourni
4. **Période/Année** - Ordre chronologique des périodes

### 🔄 Ordre inversable
- Basculez entre ordre **croissant** et **décroissant**
- Bouton avec icône `ArrowUpDown` pour inverser le tri

### 🏷️ Filtre par période
- **Extraction automatique** des périodes uniques présentes dans les listes
- Sélection dans un menu déroulant
- Affiche uniquement les listes de la période sélectionnée

### 📈 Panneau de filtres
- **Collapsible** : Cliquez sur "Filtres" pour ouvrir/fermer
- **Badge de notification** : Point bleu quand des filtres sont actifs
- **Layout responsive** : Grille adaptative selon la taille d'écran

## 🎯 Cas d'usage

### Exemple 1 : Trouver des listes des années 70
```
1. Cliquer sur "Filtres"
2. Sélectionner "Période/Année" → "1970s"
3. Les résultats affichent uniquement les listes de cette période
```

### Exemple 2 : Chercher des listes de Jazz
```
1. Taper "Jazz" dans la barre de recherche
2. La recherche filtre les listes contenant "Jazz" dans :
   - Le titre
   - La description
   - La période
   - Le nom de l'auteur
```

### Exemple 3 : Voir les plus grandes listes d'abord
```
1. Cliquer sur "Filtres"
2. Choisir "Nombre d'albums" dans "Trier par"
3. Par défaut en ordre décroissant (plus grand en premier)
```

### Exemple 4 : Combiner recherche et filtre
```
1. Rechercher "Rock" dans la barre de recherche
2. Ouvrir les filtres
3. Sélectionner période "1980s"
4. Trier par "Titre (A-Z)"
→ Affiche toutes les listes Rock des années 80 par ordre alphabétique
```

## 🛠️ Implémentation technique

### État du composant
```typescript
const [searchQuery, setSearchQuery] = useState('')
const [sortBy, setSortBy] = useState<'updated' | 'title' | 'albums' | 'period'>('updated')
const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
const [filterPeriod, setFilterPeriod] = useState<string>('')
const [showFilters, setShowFilters] = useState(false)
```

### Logique de filtrage
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

  // 3. Tri selon le critère choisi
  result.sort((a, b) => {
    let comparison = 0
    switch (sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title)
        break
      case 'albums':
        comparison = a._count.listAlbums - b._count.listAlbums
        break
      case 'period':
        comparison = (a.period || '').localeCompare(b.period || '')
        break
      case 'updated':
      default:
        comparison = 0 // API order
        break
    }
    return sortOrder === 'asc' ? comparison : -comparison
  })

  return result
}, [lists, searchQuery, filterPeriod, sortBy, sortOrder])
```

### Extraction des périodes uniques
```typescript
const uniquePeriods = useMemo(() => {
  const periods = lists
    .map(list => list.period)
    .filter((period): period is string => !!period)
  return Array.from(new Set(periods)).sort()
}, [lists])
```

## 📱 Design responsive

La page s'adapte automatiquement à la taille de l'écran :

| Breakpoint | Colonnes | Description |
|------------|----------|-------------|
| Mobile (< 640px) | 1-2 | Affichage compact |
| Tablet (640-1024px) | 2-3 | Vue intermédiaire |
| Desktop (1024-1280px) | 4 | Grille standard |
| Large (> 1280px) | 5 | Affichage étendu |

Le panneau de filtres passe de 1 colonne (mobile) à 4 colonnes (desktop).

## 🎨 Interface utilisateur

### Éléments visuels
- **Barre de recherche** : Icône 🔍 + input + bouton clear (×)
- **Bouton Filtres** : Icône sliders + texte + badge notification
- **Compteur** : "X listes" ou "X liste sur Y" si filtré
- **Badge "Filtres actifs"** : Indicateur visuel bleu
- **Message vide** : "Aucune liste ne correspond..." avec bouton reset

### Icônes utilisées
- `Search` : Barre de recherche
- `X` : Effacer la recherche
- `SlidersHorizontal` : Bouton filtres
- `ArrowUpDown` : Inverser l'ordre de tri
- `Calendar` : Affichage des périodes dans les cartes
- `User` : Affichage des auteurs
- `Globe` : Badge "Public"

## ✅ Tests

16 tests couvrent toutes les fonctionnalités :

1. ✅ Affichage barre de recherche
2. ✅ Filtrage par texte
3. ✅ Bouton clear recherche
4. ✅ Effacement avec bouton X
5. ✅ Compteur de résultats
6. ✅ Ouverture/fermeture panneau filtres
7. ✅ Filtre par période
8. ✅ Tri alphabétique
9. ✅ Inversion ordre de tri
10. ✅ Tri par nombre d'albums
11. ✅ Tri par période/année
12. ✅ Réinitialisation filtres
13. ✅ Message aucun résultat
14. ✅ Badge "Filtres actifs"
15. ✅ Combinaison recherche + filtre
16. ✅ Masquage si aucune liste

## ⚡ Performance

### Optimisations
- **useMemo** pour `filteredAndSortedLists` : Recalcul uniquement si dépendances changent
- **useMemo** pour `uniquePeriods` : Évite extraction à chaque render
- **useCallback** pour les handlers : Évite recréation de fonctions

### Dépendances
```typescript
// filteredAndSortedLists recalculé seulement si :
[lists, searchQuery, filterPeriod, sortBy, sortOrder]

// uniquePeriods recalculé seulement si :
[lists]
```

## ♿ Accessibilité

- **Labels explicites** : `htmlFor` sur tous les labels
- **Navigation clavier** : Tab entre les éléments
- **Focus visible** : Border bleue sur focus
- **ARIA** : Rôles appropriés (combobox, button)
- **Placeholder descriptif** : Guide l'utilisateur
- **Messages informatifs** : États vides clairs

## 🔄 Synchronisation avec "Mes Listes"

Le système de filtres est **cohérent** entre les deux pages :

| Fonctionnalité | Mes Listes | Explore |
|----------------|------------|---------|
| Recherche texte | ✅ | ✅ |
| Tri par titre | ✅ | ✅ |
| Tri par albums | ✅ | ✅ |
| Tri par période | ✅ | ✅ |
| Filtre période | ✅ | ✅ |
| Filtre visibilité | ✅ | ❌ (toutes publiques) |
| Tri par date modif | ✅ | ✅ |
| Tri par date création | ✅ | ❌ |

## 🚀 Évolutions futures

Améliorations possibles :
- Filtre par nombre d'albums (range slider)
- Recherche dans les noms d'artistes/albums
- Filtres multi-sélection (plusieurs périodes)
- Sauvegarde des préférences de tri
- Tags personnalisés pour filtrage avancé
- Vue grille vs liste
- Export des résultats filtrés
- Pagination pour grandes quantités

## 📚 Ressources

- [Code source](../app/explore/page.tsx)
- [Tests](../app/explore/__tests__/filters.test.tsx)
- [Système de filtres "Mes Listes"](./FILTERS-SEARCH.md)
- [Changelog v1.5.0](../CHANGELOG.md#150---2026-01-23)
