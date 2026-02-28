# 📚 Documentation RankList

Bienvenue dans la documentation complète de RankList, votre application de gestion de listes d'albums musicaux.

**Version actuelle : 1.8.0** | [Changelog](../CHANGELOG.md) | [Architecture](../ARCHITECTURE.md)

---

## 🚀 Démarrage rapide

- **[Guide d'installation](guides/INSTALLATION.md)** - Installation et configuration complète
- **[Premier pas](guides/QUICK-START.md)** - Débuter avec RankList en 5 minutes
- **[Tutoriel complet](guides/USER-GUIDE.md)** - Guide utilisateur complet

## 📖 Guides fonctionnels

### 🎵 Gestion des listes et albums
- **[Création de listes](features/LISTS-MANAGEMENT.md)** - Créer et organiser vos listes
- **[Recherche d'albums](features/ALBUM-SEARCH.md)** - Rechercher via Discogs
- **[Import d'albums](features/IMPORT-ALBUMS.md)** - Import CSV, JSON, Apple Music

### 🔍 Exploration et analyse
- **[Page Explorer](features/EXPLORE-FILTERS.md)** - Filtrer et trier vos listes
- **[Statistiques](features/STATISTICS.md)** - Comprendre vos statistiques

### 📊 Export et rapports
- **[Génération de rapports](features/REPORTS.md)** - Rapports HTML/CSV/TXT avec statistiques
- **[Export de playlists](features/PLAYLIST-EXPORT.md)** - Exporter en M3U8 et CSV
- **[Export d'images](features/IMAGE-EXPORT.md)** - Créer des mosaïques visuelles
- **[Partage de listes](features/SHARING.md)** - Partager vos listes publiquement

## 🛠️ Documentation technique

### Architecture et code
- **[Vue d'ensemble](../ARCHITECTURE.md)** - Architecture globale de l'application
- **[Tests](technical/TESTING.md)** - Guide de testing et couverture
- **[Performance](technical/PERFORMANCE.md)** - Optimisations et cache

### Développement
- **[Guide de contribution](../CONTRIBUTING.md)** - Contribuer au projet
- **[API Discogs](reference/DISCOGS-API.md)** - Intégration Discogs et cache

## 📋 Référence rapide

| Fonctionnalité | Documentation | Version |
|---------------|---------------|---------|
| 🎯 Rapports multi-listes | [REPORTS.md](features/REPORTS.md) | 1.8.0 |
| 🎵 Playlists M3U8/CSV | [PLAYLIST-EXPORT.md](features/PLAYLIST-EXPORT.md) | 1.6.0 |
| 🖼️ Export images PNG | [IMAGE-EXPORT.md](features/IMAGE-EXPORT.md) | 1.5.0 |
| 📊 Statistiques | [STATISTICS.md](features/STATISTICS.md) | 1.4.0 |
| 🔍 Explorer et filtres | [EXPLORE-FILTERS.md](features/EXPLORE-FILTERS.md) | 1.3.0 |

## ❓ Questions fréquentes

- **[FAQ](FAQ.md)** - Réponses aux questions courantes
  - Général, compte, listes, albums
  - Recherche, import/export
  - Rapports, statistiques, partage
  - Performance et technique

## 📝 Nouveautés version 1.8.0

✨ **Système de rapports complet**
- Export HTML avec grille de pochettes (design geek sobre)
- Statistiques avancées (Top 10 artistes et années)
- Filtres et tri complets (visibilité, catégorie, période)
- Export CSV et TXT avec statistiques

🎵 **Intégration Apple Music**
- Liens de recherche Apple Music pour chaque album
- Disponible dans les modales, vues liste et grille
- Encodage URL optimal pour recherches précises

Voir le [Changelog complet](../CHANGELOG.md) pour tous les détails.

## 🆘 Besoin d'aide ?

- 🐛 **Bugs** : Ouvrir une issue sur GitHub
- 💡 **Suggestions** : Utiliser les discussions GitHub
- 📧 **Contact** : Voir le [README principal](../README.md)

---

**Navigation** : [Accueil](../README.md) • [Architecture](../ARCHITECTURE.md) • [Contribuer](../CONTRIBUTING.md) • [Changelog](../CHANGELOG.md)
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
- Rapports multi-listes - [REPORTS-FEATURE](REPORTS-FEATURE.md)

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

### Je veux générer un rapport de mes listes
1. Accéder à la page [Rapports](/reports)
2. Sélectionner les listes à inclure
3. Générer et exporter dans le format souhaité (HTML, CSV, TXT)
4. Lire [REPORTS-FEATURE](REPORTS-FEATURE.md) pour plus de détails

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

Dernière mise à jour : 26 février 2026
