# Tests

Ce répertoire contient les tests de l'application Ranklist.

## 📊 État actuel

- **Total tests** : 200 tests passants ✅
- **Fichiers de tests** : 14 fichiers
- **Coverage global** : ~34% (composants testés à 100%)

## Structure

```
__tests__/
├── lib/                        # Tests fonctions utilitaires
│   ├── discogs-api.test.ts    # API Discogs (13 tests)
│   ├── discogs-tracklist.test.ts # Tracklists (5 tests)
│   ├── discogs.test.ts        # Helpers Discogs
│   └── periods.test.ts        # Gestion périodes
├── components/                 # Tests composants React
│   ├── album-search.test.tsx  # Recherche albums (17 tests)
│   ├── album-details-modal.test.tsx # Modal détails (23 tests)
│   ├── navbar.test.tsx        # Navigation
│   └── theme-toggle.test.tsx  # Thème clair/sombre
└── app/                        # Tests pages et API
    ├── explore/__tests__/
    ├── lists/__tests__/
    └── lists/[id]/__tests__/
        ├── export-image.test.tsx # Export PNG (17 tests)
        └── page.test.tsx
```

## Commandes

```bash
# Lancer tous les tests
npm test

# Lancer les tests en mode watch
npm test -- --watch

# Lancer les tests avec coverage
npm test -- --coverage

# Lancer un fichier de test spécifique
npm test -- discogs.test.ts
```

## Types de tests

### Tests unitaires (lib/)

**Discogs API** (`discogs-api.test.ts`) - 13 tests
- Extraction artiste/titre depuis format "Artiste - Album"
- Nettoyage noms d'artistes (suppression numéros homonymes)
- Déduplication des résultats de recherche
- Priorité masters sur releases
- Validation des types d'albums

**Tracklists Discogs** (`discogs-tracklist.test.ts`) - 5 tests
- Récupération tracklist d'un master
- Récupération tracklist d'une release avec labels
- Gestion tracklists vides
- Gestion erreurs API
- Respect du rate limiting

**Périodes** (`periods.test.ts`)
- Parsing et validation des périodes
- Formatage d'affichage

### Tests de composants (components/)

**Recherche d'albums** (`album-search.test.tsx`) - 17 tests
- Affichage du champ de recherche
- Recherche déclenchée par bouton ou Enter
- Désactivation bouton si < 2 caractères
- Affichage résultats avec compteur
- Fermeture résultats (X, Escape, clic extérieur)
- Sélection d'un album
- États loading et erreurs

**Modal détails** (`album-details-modal.test.tsx`) - 23 tests
- Affichage du titre et loader
- Appel API avec bon albumId
- Affichage couverture, type, année, pays
- Affichage genres, styles, labels
- Masquage sections vides
- Type badges (Master/Release)
- Messages d'erreur
- Fermeture (X, backdrop, pas sur contenu)
- Gestion données manquantes

**Navigation** (`navbar.test.tsx`)
- Affichage liens de navigation
- États authentifié/non authentifié
- Menu mobile responsive

**Thème** (`theme-toggle.test.tsx`)
- Bascule clair/sombre
- Persistance localStorage

### Tests de pages et fonctionnalités (app/)

**Export PNG** (`export-image.test.tsx`) - 17 tests
- Modal export avec options
- 3 styles visuels (golden, light, dark)
- Option inclusion/exclusion texte
- Sélection nombre de colonnes
- Validation avant export
- Génération et téléchargement PNG
- Gestion erreurs

**Pages lists**
- Affichage listes utilisateur
- Création nouvelle liste
- Détail d'une liste
- Explore listes publiques

## Mocks

Les mocks suivants sont configurés automatiquement :
- `next/image` - Remplacé par `<img>` en tests
- `next-auth` - Session mockée pour tests d'authentification
- `@/lib/prisma` - Base de données mockée
- Variables d'environnement (dans `jest.setup.ts`)

## Bonnes pratiques

1. **Isoler les tests** - Chaque test doit être indépendant
2. **Nettoyer les mocks** - Utiliser `beforeEach` pour reset les mocks
3. **Tester les cas limites** - Données invalides, erreurs, etc.
4. **Nommer clairement** - Utiliser des descriptions explicites
5. **Éviter les snapshots** - Préférer des assertions spécifiques

## Coverage

État actuel :
- **Statements**: 34.12%
- **Branches**: 69.64%
- **Functions**: 35.46%
- **Lines**: 34.12%

Composants et fonctions testés : ~100% de coverage
Routes API et pages : À améliorer

Objectifs futurs :
- Statements: > 80%
- Branches: > 75%
- Functions: > 80%
- Lines: > 80%

Fichiers exclus du coverage :
- `*.d.ts` - Fichiers de types TypeScript
- `node_modules/`
- `.next/`

## Tests manquants suggérés

### Priorité haute
- [ ] Tests API `/api/lists/[id]/export-playlist` (playlists)
- [ ] Tests API `/api/albums/[id]/discogs-details` (détails)
- [ ] Tests API `/api/lists/[id]/export-full` (JSON complet)
- [ ] Tests API `/api/admin/users` (gestion admin)

### Priorité moyenne
- [ ] Tests intégration complète (create → search → add → reorder)
- [ ] Tests auth (register, login, session)
- [ ] Tests import CSV/JSON
- [ ] Tests partage par token

### Priorité basse
- [ ] Tests E2E avec Playwright
- [ ] Tests performance (grandes listes)
- [ ] Tests accessibilité

## Lancer des tests spécifiques

```bash
# Tests Discogs
npm test -- discogs

# Tests composants
npm test -- components

# Tests export
npm test -- export

# Un fichier précis
npm test -- album-search.test.tsx

# Mode watch sur un pattern
npm test -- --watch album
```
