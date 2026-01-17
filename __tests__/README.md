# Tests

Ce répertoire contient les tests de l'application Ranklist.

## Structure

```
__tests__/
├── components/          # Tests des composants React
├── lib/                 # Tests des fonctions utilitaires
└── app/api/            # Tests des routes API
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

### Tests unitaires
Tests des fonctions utilitaires et helpers isolés :
- `lib/__tests__/discogs.test.ts` - Fonctions d'extraction et nettoyage
- `lib/__tests__/periods.test.ts` - Gestion des périodes

### Tests de composants
Tests des composants React avec React Testing Library :
- `components/__tests__/album-grid-item.test.tsx`
- `components/__tests__/period-selector.test.tsx`

### Tests d'intégration
Tests des routes API et interactions avec la base de données :
- `app/api/lists/__tests__/route.test.ts`
- `lib/__tests__/discogs-integration.test.ts`

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

Objectifs de couverture :
- Statements: > 80%
- Branches: > 75%
- Functions: > 80%
- Lines: > 80%

Fichiers exclus du coverage :
- `*.d.ts` - Fichiers de types TypeScript
- `node_modules/`
- `.next/`
