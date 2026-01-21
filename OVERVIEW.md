# Ranklist - Vue d'ensemble

## 📊 Statistiques du projet

- **Version actuelle** : 1.3.0
- **Date de création** : Janvier 2026
- **Langage principal** : TypeScript
- **Framework** : Next.js 16.1.1
- **Tests** : 75+ tests passants
- **Documentation** : 10 fichiers Markdown

## 🎯 Résumé

Ranklist est une application web moderne permettant de créer, organiser et partager des classements d'albums musicaux. L'application s'appuie sur l'API Discogs (14M+ albums) et offre des fonctionnalités avancées d'import/export, incluant la génération de playlists universelles pour services de streaming.

## ✨ Fonctionnalités clés

### 🔐 Authentification & Permissions
- Inscription/Connexion sécurisée
- 2 rôles : user, admin
- Page d'administration complète

### 📝 Gestion de listes
- CRUD complet
- Classification par période
- Listes publiques/privées
- Partage sécurisé par token

### 🔍 Recherche & Organisation
- Recherche Discogs optimisée
- Déduplication intelligente
- Drag & drop pour réorganisation
- Consultation détails albums

### 📦 Import/Export
- **4 formats d'export** :
  - CSV (albums)
  - JSON (complet avec métadonnées)
  - PNG (image mosaïque)
  - M3U8/CSV (playlists avec tracklists)
- **2 formats d'import** :
  - CSV (ajouter albums)
  - JSON (créer liste complète)

### 🎵 Playlists
- Génération automatique tracklists
- Compatible Spotify, Apple Music, Deezer
- Outils : Soundiiz, TuneMyMusic, FreeYourMusic

## 🛠️ Stack technique

```
Frontend:
├── Next.js 16.1.1 (App Router)
├── React 18
├── TypeScript 5
├── Tailwind CSS 3
├── @dnd-kit (drag & drop)
└── html2canvas (export PNG)

Backend:
├── Next.js API Routes
├── NextAuth.js v4 (auth)
├── Prisma ORM
├── PostgreSQL 14+
└── Discogs API

Testing:
├── Jest
├── React Testing Library
└── 75+ tests unitaires
```

## 📁 Structure du projet

```
ranklist/
├── app/                    # Pages et API Routes (Next.js App Router)
│   ├── api/               # Backend API
│   ├── lists/             # Pages gestion listes
│   ├── auth/              # Authentification
│   ├── admin/             # Administration
│   └── explore/           # Exploration listes publiques
├── components/            # Composants React réutilisables
├── lib/                   # Bibliothèques et utilitaires
│   ├── discogs.ts        # Service API Discogs
│   ├── auth.ts           # Configuration NextAuth
│   └── utils/            # Helpers
├── prisma/               # Schéma BDD et migrations
├── types/                # Types TypeScript
├── docs/                 # Documentation complète
├── __tests__/            # Tests Jest
└── public/               # Assets statiques
```

## 🚀 Démarrage rapide

```bash
# Installation
npm install

# Configuration
cp .env.example .env
# Éditer .env avec vos valeurs

# Base de données
npx prisma migrate dev
npx prisma generate

# Lancement
npm run dev
# → http://localhost:3000
```

## 📚 Documentation

| Fichier | Description |
|---------|-------------|
| [README.md](README.md) | Guide utilisateur complet |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Documentation technique |
| [CHANGELOG.md](CHANGELOG.md) | Historique des versions |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Guide de contribution |
| [docs/README.md](docs/README.md) | Index de la documentation |
| [docs/PLAYLIST-EXPORT.md](docs/PLAYLIST-EXPORT.md) | Guide export playlists |
| [docs/PLAYLIST-FEATURE.md](docs/PLAYLIST-FEATURE.md) | Doc technique playlists |

## 🧪 Tests

```bash
# Tous les tests
npm test

# Avec coverage
npm test -- --coverage

# Mode watch
npm test -- --watch
```

**Coverage** : 75+ tests couvrant :
- Fonctions Discogs (déduplication, tracklists)
- Composants React (recherche, modal, export)
- Gestion des périodes
- Export d'images

## 🎯 Cas d'usage principaux

### Pour les mélomanes
1. Créer des classements d'albums par période
2. Organiser sa collection musicale
3. Partager ses goûts avec des amis
4. Exporter vers Spotify/Apple Music

### Pour les curateurs
1. Créer des listes thématiques
2. Publier des découvertes
3. Générer des mosaïques visuelles
4. Exporter en playlists écoute

### Pour les développeurs
1. Intégrer l'API Discogs
2. Système d'auth avec rôles
3. Export/Import de données
4. Tests complets et documentés

## 🔮 Roadmap

### Court terme (Q1 2026)
- [ ] Pagination listes explore
- [ ] Filtres par genre/période
- [ ] Cache tracklists Discogs
- [ ] Optimisation grandes playlists

### Moyen terme (Q2-Q3 2026)
- [ ] Statistiques utilisateur
- [ ] Likes et commentaires
- [ ] Intégrations Spotify/Apple Music directes
- [ ] Tags personnalisés

### Long terme (2026+)
- [ ] Recommandations IA
- [ ] Collaboration temps réel
- [ ] Mobile app
- [ ] Format XSPF

## 📊 Métriques projet

| Métrique | Valeur |
|----------|--------|
| Lignes de code | ~10,000 |
| Fichiers TypeScript | 50+ |
| Composants React | 15+ |
| Routes API | 20+ |
| Tests | 75+ |
| Fonctionnalités | 25+ |
| Documentation | 10 fichiers |

## 🏆 Points forts

✅ **Architecture moderne** - Next.js 16 App Router, TypeScript strict  
✅ **Fonctionnalités riches** - 4 formats export, playlists universelles  
✅ **Bien testé** - 75+ tests avec bon coverage  
✅ **Documentation complète** - 10 fichiers Markdown détaillés  
✅ **UX soignée** - Drag & drop, thèmes, responsive  
✅ **Sécurisé** - Auth robuste, validation Zod, protection CSRF  
✅ **Performant** - Indexation BDD, déduplication optimisée  
✅ **Extensible** - Architecture claire, types stricts  

## 🤝 Contribution

Le projet est ouvert aux contributions ! Voir [CONTRIBUTING.md](CONTRIBUTING.md) pour :
- Configuration environnement dev
- Conventions de code
- Workflow Git
- Comment proposer une PR

## 📄 Licence

MIT - Voir fichier LICENSE

## 👤 Auteur

**Christophe Ayel**
- GitHub: [@christopheayel](https://github.com/christopheayel)

## 🙏 Remerciements

- [Discogs](https://www.discogs.com) pour l'API musicale complète
- [Vercel](https://vercel.com) pour le hosting Next.js
- Communauté Open Source pour les packages utilisés

---

**Ranklist** - Créez, organisez, partagez vos classements musicaux 🎵

*Dernière mise à jour : 21 janvier 2026 - Version 1.3.0*
