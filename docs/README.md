# Documentation Ranklist

Bienvenue dans la documentation de Ranklist ! Cette page regroupe tous les guides et ressources disponibles.

## 📖 Pour commencer

### Utilisateurs

- **[README.md](../README.md)** - Guide utilisateur complet
  - Installation et configuration
  - Fonctionnalités principales
  - Utilisation de l'application
  - Import/Export de listes

### Développeurs

- **[CONTRIBUTING.md](../CONTRIBUTING.md)** - Guide de contribution
  - Configuration environnement de développement
  - Conventions de code
  - Git workflow
  - Comment proposer une Pull Request

## 🏗️ Architecture

- **[ARCHITECTURE.md](../ARCHITECTURE.md)** - Documentation technique complète
  - Schéma de base de données
  - Architecture des routes (API + pages)
  - Flows d'authentification et partage
  - Système d'import/export
  - Intégration Discogs
  - Sécurité et performance

## 📜 Historique

- **[CHANGELOG.md](../CHANGELOG.md)** - Historique des versions
  - Versions publiées avec dates
  - Nouvelles fonctionnalités
  - Corrections de bugs
  - Changements techniques

## 🎵 Fonctionnalités spécifiques

### Export de playlists

- **[PLAYLIST-EXPORT.md](PLAYLIST-EXPORT.md)** - Guide utilisateur export playlists
  - Formats disponibles (M3U8, CSV)
  - Comment importer dans services de streaming
  - Outils recommandés (Soundiiz, TuneMyMusic)
  - Limitations et conseils

- **[PLAYLIST-FEATURE.md](PLAYLIST-FEATURE.md)** - Documentation technique playlists
  - Architecture et implémentation
  - API Discogs pour tracklists
  - Génération des fichiers M3U8/CSV
  - Tests unitaires

### Performance

- **[PERFORMANCE-OPTIMIZATIONS.md](PERFORMANCE-OPTIMIZATIONS.md)** - Optimisations v1.6.0 ⚡
  - Cache des tracklists Discogs (30 jours)
  - Traitement parallèle (5 albums simultanés)
  - Résultats de performance (80-97% plus rapide)
  - Configuration et monitoring

- **[PLAYLIST-FEATURE.md](PLAYLIST-FEATURE.md)** - Documentation technique playlists
  - Architecture de la fonctionnalité
  - Workflow export
  - Format des fichiers générés
  - API et fonctions Discogs
  - Tests et déploiement

## 🧪 Tests

- **[__tests__/README.md](../__tests__/README.md)** - Documentation des tests
  - Structure des tests
  - Commandes de test
  - Types de tests (unitaires, composants, intégration)
  - Mocks configurés

## 🔍 Index des fonctionnalités

### Authentification
- Inscription/Connexion - [README](../README.md#-utilisation)
- Système de rôles (user/admin) - [ARCHITECTURE](../ARCHITECTURE.md#système-dadministration)
- Protection des routes - [ARCHITECTURE](../ARCHITECTURE.md#flow-dauthentification)

### Gestion de listes
- Création de listes - [README](../README.md#créer-une-liste)
- Classification par période - [README](../README.md#créer-une-liste)
- Listes publiques/privées - [ARCHITECTURE](../ARCHITECTURE.md#schéma-de-base-de-données)
- Partage par token - [ARCHITECTURE](../ARCHITECTURE.md#flow-de-partage-avec-token)

### Recherche d'albums
- Recherche Discogs optimisée - [README](../README.md#-intégration-discogs)
- Déduplication intelligente - [ARCHITECTURE](../ARCHITECTURE.md#optimisations)
- Recherche manuelle - [README](../README.md#ajouter-des-albums)
- Gestion homonymes - [ARCHITECTURE](../ARCHITECTURE.md#gestion-des-homonymes)

### Organisation
- Drag & Drop - [README](../README.md#réorganiser)
- Positionnement automatique - [ARCHITECTURE](../ARCHITECTURE.md#schéma-de-base-de-données)

### Consultation
- Modal détails Discogs - [README](../README.md#consulter-les-détails-discogs)
- Affichage type/labels/genres - [CHANGELOG](../CHANGELOG.md#120---2026-01-15)

### Export
- CSV (albums) - [README](../README.md#importexport)
- JSON (complet) - [README](../README.md#importexport)
- PNG (image) - [README](../README.md#importexport)
- Playlists M3U8/CSV - [PLAYLIST-EXPORT](PLAYLIST-EXPORT.md)

### Import
- CSV (ajouter albums) - [README](../README.md#importexport)
- JSON (créer liste) - [README](../README.md#importexport)

### Administration
- Page admin - [ARCHITECTURE](../ARCHITECTURE.md#système-dadministration)
- Gestion utilisateurs - [ARCHITECTURE](../ARCHITECTURE.md#page-administration-admin)
- Modification des rôles - [ARCHITECTURE](../ARCHITECTURE.md#api-admin)

## 🛠️ Ressources externes

### APIs et Services
- [Discogs API Documentation](https://www.discogs.com/developers)
- [Discogs Developer Settings](https://www.discogs.com/settings/developers)
- [Soundiiz](https://soundiiz.com) - Conversion playlists
- [TuneMyMusic](https://tunemymusic.com) - Transfert entre plateformes
- [FreeYourMusic](https://freeyourmusic.com) - App desktop

### Technologies
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

## 💡 Cas d'usage courants

### Je veux créer ma première liste
1. Lire [README - Utilisation](../README.md#-utilisation)
2. Suivre [Créer une liste](../README.md#créer-une-liste)
3. Consulter [Ajouter des albums](../README.md#ajouter-des-albums)

### Je veux exporter vers Spotify/Apple Music
1. Lire [Guide export playlists](PLAYLIST-EXPORT.md)
2. Suivre [Export en playlist](../README.md#exporter-en-playlist-pour-streaming)
3. Utiliser [Soundiiz](https://soundiiz.com) ou [TuneMyMusic](https://tunemymusic.com)

### Je veux contribuer au projet
1. Lire [CONTRIBUTING.md](../CONTRIBUTING.md)
2. Consulter [ARCHITECTURE.md](../ARCHITECTURE.md) pour comprendre le code
3. Vérifier [Tests](../__tests__/README.md) pour les tests existants

### Je veux déployer en production
1. Suivre [README - Déploiement](../README.md#-déploiement)
2. Vérifier [ARCHITECTURE - Déploiement](../ARCHITECTURE.md#déploiement)
3. Consulter [ARCHITECTURE - Checklist](../ARCHITECTURE.md#checklist-pré-déploiement)

## ❓ Questions fréquentes

### Fonctionnalités

**Q: Puis-je partager une liste privée ?**  
R: Oui, via le système de token de partage. Voir [Partage sécurisé](../README.md#partager).

**Q: Mes playlists exportées fonctionnent-elles sur tous les services ?**  
R: Les formats M3U8 et CSV sont universels, mais nécessitent des outils de conversion. Voir [PLAYLIST-EXPORT](PLAYLIST-EXPORT.md).

**Q: Comment différencier les artistes homonymes ?**  
R: L'app utilise les IDs Discogs artistes. Voir [Gestion homonymes](../ARCHITECTURE.md#gestion-des-homonymes).

### Technique

**Q: Comment obtenir un token Discogs ?**  
R: Voir [README - Obtenir un token](../README.md#obtenir-un-token-discogs).

**Q: Quelle base de données utiliser ?**  
R: PostgreSQL 14+. Voir [Configuration BDD](../README.md#configuration-de-la-base-de-données-postgresql).

**Q: Comment lancer les tests ?**  
R: `npm test`. Voir [Documentation tests](../__tests__/README.md).

## 📬 Support

- **Issues** : [GitHub Issues](https://github.com/your-username/ranklist/issues)
- **Discussions** : [GitHub Discussions](https://github.com/your-username/ranklist/discussions)
- **Email** : contact@ranklist.com (si applicable)

## 🔄 Mise à jour de cette documentation

Cette documentation est maintenue avec le projet. Pour toute correction ou amélioration :

1. Éditer les fichiers Markdown concernés
2. Suivre le guide [CONTRIBUTING.md](../CONTRIBUTING.md)
3. Proposer une Pull Request

---

Dernière mise à jour : 21 janvier 2026
