# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [Non publié]

### En cours
- (Rien en cours actuellement)

## [1.7.0] - 2026-01-30

### Ajouté
- 📋 Page de consultation des listes contenant un album spécifique
- 🔗 Nouvelle route API `/api/albums/[id]/lists` pour récupérer les listes
- 🎯 Boutons "Voir les listes" dans la modal détails, grille et liste d'albums
- ✅ 14 tests unitaires pour la nouvelle page albums
- 🔒 Filtrage automatique : listes publiques + listes privées de l'utilisateur

### Interface
- **Modal détails Discogs** : Bouton vert "Voir les listes" avec icône List
- **Grille d'albums** : Bouton List vert au hover de la carte
- **Liste d'albums** : Icône List cliquable dans chaque item
- **Page /albums/[id]** :
  - En-tête avec pochette, titre, artiste, année
  - Compteur de listes ("X liste(s)")
  - Grille responsive (1-3 colonnes) des listes
  - Badges de visibilité (Public/Privé)
  - Navigation vers chaque liste
  - Bouton retour
  - Message si aucune liste (avec invitation à se connecter)

## [1.6.0] - 2026-01-30

### Ajouté
- 🚀 Cache des tracklists Discogs en base de données (30 jours)
- ⚡ Traitement parallèle des exports playlists (5 albums simultanés)
- 💾 Nouveau modèle `AlbumTracklist` pour persistance du cache
- 📦 Système intelligent de gestion du cache (get, set, clear)
- ✅ 10 tests unitaires pour le cache de tracklists

### Modifié
- 🎯 Export playlist optimisé : 80% plus rapide (première fois)
- 🔥 Export playlist avec cache : 95% plus rapide (exports répétés)
- ⏱️ Cache Next.js étendu de 24h à 30 jours pour les tracklists
- 🔄 `getDiscogsAlbumWithTracks` utilise maintenant le cache automatiquement
- 📊 Filtrage des albums invalides avant traitement des tracklists

### Performance
- **50 albums (sans cache)** : ~55s → ~11s ⚡ **80% plus rapide**
- **50 albums (avec cache)** : ~55s → ~2-3s ⚡ **95% plus rapide**
- **100 albums (sans cache)** : ~110s → ~22s ⚡ **80% plus rapide**
- **100 albums (avec cache)** : ~110s → ~3-5s ⚡ **97% plus rapide**

## [1.5.0] - 2026-01-23

### Ajouté
- 🔎 Système de recherche et tri sur la page Explore (listes publiques)
- 📅 Tri par période/année sur page "Mes Listes"
- 🔍 Recherche par titre, description, auteur et période sur Explore
- 📊 Tri par 4 critères sur Explore (récentes, titre, albums, période/année)
- 🔄 Ordre de tri inversable (croissant/décroissant)
- 🏷️ Filtre par période (extraction automatique des périodes uniques)
- 📈 Panneau de filtres dépliable avec badge de notification
- 📱 Interface responsive et cohérente entre Explore et Mes Listes
- ⚡ Performance optimisée avec useMemo
- ✅ 16 tests pour la page Explore + 1 test pour tri par période
- 📖 Synchronisation des systèmes de filtres

### Modifié
- 🎨 Interface page Explore améliorée avec filtres avancés
- ♿ Accessibilité renforcée (labels avec htmlFor, navigation clavier)
- 🔧 Type de sortBy étendu avec 'period' sur les deux pages

## [1.4.0] - 2026-01-23

### Ajouté
- 🔎 Système complet de recherche et filtres pour les listes
- 🔍 Barre de recherche en temps réel (titre et description)
- 📊 Tri par 4 critères (dernière modification, date création, titre, nombre d'albums)
- 🔄 Ordre de tri inversable (croissant/décroissant)
- 🏷️ Filtre par période (extraction automatique des périodes uniques)
- 👁️ Filtre par visibilité (toutes/publiques/privées)
- 📈 Panneau de filtres dépliable avec badge "Actifs"
- 📱 Interface responsive (1-4 colonnes selon écran)
- 🔢 Compteur de résultats filtrés
- ⚡ Performance optimisée avec useMemo
- ✅ 16 tests complets pour les filtres
- 📖 Documentation (FILTERS-SEARCH.md)

### Modifié
- 🎨 Interface page "Mes Listes" améliorée
- ♿ Accessibilité renforcée (labels, navigation clavier)

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
