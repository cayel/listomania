# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [Non publié]

### En cours
- Optimisation export playlists pour grandes listes (50+ albums)
- Cache des tracklists Discogs

## [1.3.0] - 2026-01-21

### Ajouté
- 🎵 Export de playlists universelles (M3U8 et CSV)
- 📀 Récupération automatique des tracklists via Discogs
- 🔄 Guide d'import dans services de streaming (Soundiiz, TuneMyMusic)
- 📖 Documentation complète des playlists (PLAYLIST-EXPORT.md, PLAYLIST-FEATURE.md)
- ✅ Tests unitaires pour `getDiscogsAlbumWithTracks` (5 tests)

### Modifié
- 📚 Consolidation de la documentation (suppression fichiers obsolètes)
- 📝 Mise à jour README avec fonctionnalité playlists
- 🏗️ ARCHITECTURE.md amélioré avec nouvelles fonctionnalités
- ➕ Ajout CONTRIBUTING.md pour développeurs

## [1.2.0] - 2026-01-15

### Ajouté
- ℹ️ Modal de détails d'albums Discogs (type, labels, genres, styles, pays)
- 🔗 Lien direct vers page Discogs depuis le modal
- ⚙️ Interface compacte sans scrollbar
- ✅ Tests complets du modal (23 tests)

### Modifié
- 🎨 Bouton Info élégant avec gradient et effets hover
- 🔍 Recherche optimisée : requête unique pour masters + releases
- 🧹 Déduplication intelligente des résultats de recherche
- 🔘 Recherche manuelle par bouton/Entrée (au lieu de recherche automatique)
- ✅ Tests de recherche d'albums (17 tests)

## [1.1.0] - 2026-01-14

### Ajouté
- 🖼️ Export d'images PNG des listes (mosaïques de pochettes)
- 🎨 3 styles visuels : Cadre doré, Fond clair, Fond noir
- ✏️ Option d'inclusion/exclusion du texte
- 📐 Export haute résolution (scale x2)
- 🔒 Proxy serveur pour images Discogs (contournement CORS)
- ✅ Tests complets export image (17 tests)

### Modifié
- 🖱️ Menu Export réorganisé avec descriptions
- 📱 Interface responsive pour export PNG

## [1.0.0] - 2026-01-12

### Ajouté
- 🔐 Authentification complète (inscription/connexion)
- 👥 Système de rôles (user/admin)
- 📊 Page d'administration avec gestion utilisateurs
- 📝 CRUD complet des listes d'albums
- 🔍 Recherche d'albums via API Discogs (14M+ albums)
- 🎯 Gestion des artistes homonymes (discogsArtistId)
- ↕️ Réorganisation par glisser-déposer
- 🌍 Listes publiques et privées
- 🔗 Partage sécurisé par token
- 📅 Classification par période (année, décennie, custom)
- 🎨 Thèmes clair et sombre
- 📱 Interface responsive
- 📥 Import CSV (albums)
- 📤 Export CSV (albums)
- 📦 Import/Export JSON complet (métadonnées + albums)
- 🔖 URL de source pour listes importées
- ✅ Tests unitaires Discogs (13 tests)

### Infrastructure
- ⚡ Next.js 16.1.1 avec App Router
- 🗄️ PostgreSQL + Prisma ORM
- 🔑 NextAuth.js v4
- 🎨 Tailwind CSS v3
- 🖱️ @dnd-kit pour drag & drop
- 📸 html2canvas pour export PNG
- 🧪 Jest + React Testing Library

## Format

- **[Version]** - Date
  - **Ajouté** : Nouvelles fonctionnalités
  - **Modifié** : Changements de fonctionnalités existantes
  - **Déprécié** : Fonctionnalités qui seront supprimées
  - **Supprimé** : Fonctionnalités supprimées
  - **Corrigé** : Corrections de bugs
  - **Sécurité** : Corrections de vulnérabilités

[Non publié]: https://github.com/your-username/ranklist/compare/v1.3.0...HEAD
[1.3.0]: https://github.com/your-username/ranklist/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/your-username/ranklist/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/your-username/ranklist/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/your-username/ranklist/releases/tag/v1.0.0
