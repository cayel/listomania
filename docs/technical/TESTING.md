# Tests de la fonctionnalité Statistiques

## Vue d'ensemble

32 nouveaux tests ont été ajoutés pour couvrir complètement la fonctionnalité de statistiques, portant le total de tests de l'application de 168 à 200.

## Tests API (`app/api/user/stats/__tests__/route.test.ts`)

**12 tests** pour l'endpoint `/api/user/stats`

### Tests de sécurité
- ✅ Retourne 401 si utilisateur non authentifié
- ✅ Gère les erreurs serveur (500)

### Tests de calculs statistiques
- ✅ Retourne les statistiques de base (listes, albums, moyenne)
- ✅ Calcule correctement les albums uniques (avec Set de discogsIds)
- ✅ Calcule la moyenne d'albums par liste
- ✅ Identifie la liste la plus longue (reduce)

### Tests de groupement temporel
- ✅ Calcule correctement les albums par décennie (Math.floor)
- ✅ Regroupe correctement les listes par période

### Tests de classements
- ✅ Identifie correctement le top artistes (par nombre d'albums)
- ✅ Identifie les albums favoris (présents dans plusieurs listes)
- ✅ Limite le top artistes à 10

### Tests cas limites
- ✅ Retourne des statistiques vides pour un utilisateur sans listes

## Tests de la page (`app/stats/__tests__/page.test.tsx`)

**20 tests** pour la page de statistiques

### Tests d'authentification
- ✅ Redirige vers signin si non authentifié
- ✅ Affiche un loader pendant le chargement

### Tests de structure
- ✅ Affiche la navbar
- ✅ Affiche le titre de la page
- ✅ Appelle l'API stats au montage

### Tests d'affichage des données
- ✅ Affiche les statistiques de base (4 cartes)
- ✅ Affiche le nombre de listes publiques et privées
- ✅ Affiche la période couverte (range d'années)
- ✅ Affiche les albums par décennie (avec barres de progression)
- ✅ Affiche les listes par période (avec badges)
- ✅ Affiche le top 10 artistes (liste classée)
- ✅ Affiche les albums favoris (avec multiplicateur)
- ✅ Affiche le record de la liste la plus longue

### Tests de cas limites
- ✅ Affiche un message si aucune statistique disponible
- ✅ Affiche un message si aucune donnée pour les décennies
- ✅ Affiche un message si aucune période définie
- ✅ Affiche un message si aucun album dans plusieurs listes
- ✅ N'affiche pas le record si aucune liste

### Tests de rendu
- ✅ Calcule correctement la largeur des barres de progression
- ✅ Gère les erreurs de l'API

## Configuration des tests

### Environnement
- **API tests** : `@jest-environment node` (pour NextResponse, Prisma)
- **Page tests** : `@jest-environment jsdom` (par défaut pour React)

### Mocks utilisés

#### Tests API
```typescript
jest.mock('next-auth')
jest.mock('@/lib/auth')
jest.mock('@/lib/prisma')
```

#### Tests Page
```typescript
jest.mock('next-auth/react')
jest.mock('next/navigation')
jest.mock('@/components/navbar')
```

## Couverture

### Fonctionnalités testées
- ✅ Authentification et autorisation
- ✅ Agrégation de données Prisma
- ✅ Calculs statistiques (moyenne, max, groupement)
- ✅ Tri et limitation (top 10)
- ✅ Gestion des cas limites (données vides)
- ✅ Rendu React (composants, états, erreurs)
- ✅ Interactions API (fetch, loading, errors)

### Pas encore testé
- ⏳ Tests E2E de la page statistiques
- ⏳ Tests de performance avec grandes quantités de données
- ⏳ Tests d'accessibilité (a11y)

## Commandes

```bash
# Tests de l'API uniquement
npm test -- app/api/user/stats/__tests__/route.test.ts

# Tests de la page uniquement
npm test -- app/stats/__tests__/page.test.tsx

# Tous les tests de statistiques
npm test -- stats

# Tous les tests de l'application
npm test
```

## Métriques

| Métrique | Valeur |
|----------|--------|
| Tests API | 12 |
| Tests Page | 20 |
| **Total** | **32** |
| Temps d'exécution | ~1.5s |
| Lignes de code tests | ~500 |

## Intégration continue

Les tests statistiques sont inclus dans la suite de tests complète et s'exécutent :
- ✅ Avant chaque commit (si pre-commit hook configuré)
- ✅ Dans les pipelines CI/CD
- ✅ Avec `npm test`

## Exemples de données mockées

### Mock statistiques complètes
```typescript
const mockStats = {
  overview: {
    totalLists: 5,
    totalAlbums: 42,
    uniqueAlbums: 38,
    publicLists: 3,
    privateLists: 2,
    avgAlbumsPerList: 8,
    longestList: { title: 'Ma Grande Liste', length: 20 },
    oldestYear: 1960,
    newestYear: 2024
  },
  albumsByDecade: {
    '1960s': 5,
    '1970s': 10,
    '1980s': 15
  },
  topArtists: [
    { artist: 'Pink Floyd', count: 5 },
    { artist: 'The Beatles', count: 4 }
  ]
}
```

### Mock listes Prisma
```typescript
const mockLists = [
  {
    id: 'list1',
    title: 'Ma Liste',
    period: '2020',
    isPublic: true,
    listAlbums: [
      {
        album: {
          discogsId: '12345',
          artist: 'Pink Floyd',
          title: 'The Wall',
          year: 1979
        }
      }
    ]
  }
]
```

## Maintenance

Pour maintenir ces tests :
1. Mettre à jour les mocks si le schéma Prisma change
2. Ajouter des tests pour de nouvelles métriques
3. Vérifier la couverture avec `npm test -- --coverage`
4. Documenter les nouveaux cas limites découverts

## Références

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Next.js Testing](https://nextjs.org/docs/app/building-your-application/testing/jest)
