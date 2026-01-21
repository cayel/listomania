# Guide de contribution

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+
- PostgreSQL 14+
- Token API Discogs ([obtenir ici](https://www.discogs.com/settings/developers))

### Installation

```bash
# Cloner le repo
git clone https://github.com/your-username/ranklist.git
cd ranklist

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# Initialiser la base de données
npx prisma migrate dev
npx prisma generate

# Lancer en dev
npm run dev
```

## 🏗️ Structure du projet

Voir [ARCHITECTURE.md](ARCHITECTURE.md) pour la documentation complète.

## 🧪 Tests

### Lancer les tests

```bash
# Tous les tests
npm test

# Mode watch
npm test -- --watch

# Avec coverage
npm test -- --coverage
```

### Écrire des tests

- **Tests unitaires** : `lib/__tests__/`
- **Tests composants** : `components/__tests__/`
- **Tests API** : `app/api/**/__tests__/`

Utiliser Jest + React Testing Library.

## 📝 Conventions de code

### TypeScript

- Toujours typer les paramètres et retours de fonction
- Utiliser les interfaces pour les objets complexes
- Éviter `any`, préférer `unknown` si nécessaire

### React

- Composants fonctionnels avec hooks
- Props typées avec TypeScript interfaces
- Utiliser `'use client'` uniquement quand nécessaire

### Nommage

- **Fichiers** : kebab-case (`album-grid-item.tsx`)
- **Composants** : PascalCase (`AlbumGridItem`)
- **Fonctions** : camelCase (`handleExportPlaylist`)
- **Constantes** : SCREAMING_SNAKE_CASE (`RATE_LIMIT_DELAY`)

### Imports

```typescript
// Ordre des imports :
import { type1 } from 'react'           // 1. React
import { type2 } from 'next/...'        // 2. Next.js
import { type3 } from '@/components'    // 3. Composants
import { type4 } from '@/lib'           // 4. Libs
import { type5 } from '@/types'         // 5. Types
```

## 🌳 Git workflow

### Branches

- `main` : Production, toujours stable
- `dev` : Développement, intégration
- `feature/nom-feature` : Nouvelles fonctionnalités
- `fix/nom-bug` : Corrections de bugs

### Commits

Format : `type(scope): message`

Types :
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage, lint
- `refactor`: Refactoring
- `test`: Ajout/modification tests
- `chore`: Tâches de maintenance

Exemples :
```
feat(export): add M3U8 playlist export
fix(search): deduplicate album results
docs(readme): update installation guide
```

## 📦 Proposer une Pull Request

1. **Fork** le projet
2. **Créer une branche** : `git checkout -b feature/ma-feature`
3. **Commiter** : `git commit -m 'feat(scope): description'`
4. **Pousser** : `git push origin feature/ma-feature`
5. **Ouvrir une PR** sur GitHub

### Checklist PR

- [ ] Tests ajoutés/mis à jour
- [ ] Tests passent (`npm test`)
- [ ] Build réussit (`npm run build`)
- [ ] Pas d'erreurs TypeScript
- [ ] Documentation mise à jour si nécessaire
- [ ] Commits bien formatés

## 🐛 Reporter un bug

Ouvrir une issue avec :

1. **Titre clair** : "Bug: Export playlist fails with 50+ albums"
2. **Description** : Contexte, comportement attendu vs obtenu
3. **Reproduction** : Étapes pour reproduire
4. **Environnement** : OS, navigateur, versions
5. **Logs** : Erreurs console/serveur si disponibles

## 💡 Proposer une fonctionnalité

Ouvrir une issue avec :

1. **Titre** : "Feature: Add Spotify direct integration"
2. **Motivation** : Pourquoi cette fonctionnalité ?
3. **Description** : Comment devrait-elle fonctionner ?
4. **Alternatives** : Autres approches envisagées

## 🔍 Code Review

### Pour les reviewers

- Vérifier la logique et les edge cases
- Tester localement si possible
- Commenter de manière constructive
- Approuver seulement si tests passent

### Pour les contributeurs

- Répondre aux commentaires rapidement
- Ne pas prendre les critiques personnellement
- Faire les modifications demandées
- Re-demander une review après changements

## 📚 Ressources

- [Documentation Next.js](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Discogs API](https://www.discogs.com/developers)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## ❓ Questions

Pour toute question, ouvrir une [discussion GitHub](https://github.com/your-username/ranklist/discussions) ou contacter [@christopheayel](https://github.com/christopheayel).

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.
