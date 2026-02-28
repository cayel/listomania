# 📁 Structure de la documentation RankList

## Vue d'ensemble

La documentation de RankList est organisée en **4 catégories principales** pour faciliter la navigation et la maintenance.

```
docs/
├── README.md                    # 🏠 Hub central de navigation
├── FAQ.md                       # ❓ Questions fréquentes
├── MIGRATION-DOCS.md            # 📝 Récapitulatif de la réorganisation
├── guides/                      # 📚 Guides pour utilisateurs
│   ├── INSTALLATION.md          # Installation locale/production
│   ├── QUICK-START.md           # Démarrage rapide 5 minutes
│   └── USER-GUIDE.md            # Guide utilisateur complet
├── features/                    # ✨ Documentation fonctionnelle
│   ├── ALBUM-SEARCH.md          # Recherche Discogs
│   ├── EXPLORE-FILTERS.md       # Page Explorer
│   ├── IMAGE-EXPORT.md          # Export de mosaïques
│   ├── IMPORT-ALBUMS.md         # Import CSV/JSON/Apple Music
│   ├── LISTS-MANAGEMENT.md      # Gestion de listes
│   ├── PLAYLIST-EXPORT.md       # Export M3U8 et CSV
│   ├── REPORTS.md               # Rapports multi-listes
│   ├── SHARING.md               # Partage de listes
│   └── STATISTICS.md            # Page statistiques
├── technical/                   # 🛠️ Documentation technique
│   ├── PERFORMANCE.md           # Optimisations et cache
│   └── TESTING.md               # Tests et couverture
└── reference/                   # 📖 Références API et config
    ├── DISCOGS-API.md           # API Discogs détaillée
    └── SEO.md                   # Référencement
```

**Total** : 19 fichiers Markdown

## 📂 Description des dossiers

### 📚 guides/

**Pour qui** : Utilisateurs débutants et avancés

**Contenu** :
- Installation et déploiement
- Guide de démarrage rapide
- Manuel utilisateur complet

**Quand utiliser** :
- Première installation
- Découverte de l'application
- Référence fonctionnelle complète

### ✨ features/

**Pour qui** : Utilisateurs cherchant une fonctionnalité spécifique

**Contenu** :
- Documentation détaillée de chaque fonctionnalité
- Guides d'utilisation
- Cas d'usage pratiques
- Architecture technique de la feature

**Quand utiliser** :
- Comprendre une fonctionnalité précise
- Cas d'usage avancés
- Résolution de problèmes

### 🛠️ technical/

**Pour qui** : Développeurs et contributeurs

**Contenu** :
- Optimisations et performance
- Tests et couverture
- Détails d'implémentation

**Quand utiliser** :
- Contribuer au projet
- Comprendre les optimisations
- Écrire des tests

### 📖 reference/

**Pour qui** : Développeurs et administrateurs

**Contenu** :
- Documentation API externe (Discogs)
- Configuration et référencement
- Références techniques

**Quand utiliser** :
- Intégration API
- Configuration avancée
- Optimisation SEO

## 🗺️ Navigation recommandée

### Pour un nouvel utilisateur

```
1. docs/README.md
   ↓
2. guides/QUICK-START.md (5 minutes)
   ↓
3. guides/USER-GUIDE.md (référence complète)
   ↓
4. FAQ.md (si questions)
```

### Pour une fonctionnalité spécifique

```
1. docs/README.md
   ↓
2. Trouver la fonctionnalité dans le tableau
   ↓
3. features/[FEATURE].md
   ↓
4. Cas d'usage et exemples
```

### Pour un développeur

```
1. README.md (racine du projet)
   ↓
2. ARCHITECTURE.md
   ↓
3. guides/INSTALLATION.md
   ↓
4. CONTRIBUTING.md
   ↓
5. technical/ et reference/
```

### Pour un contributeur

```
1. CONTRIBUTING.md
   ↓
2. ARCHITECTURE.md
   ↓
3. technical/TESTING.md
   ↓
4. features/ (feature à modifier)
```

## 📊 Statistiques

### Par dossier

| Dossier | Fichiers | Lignes approx. | Usage |
|---------|----------|----------------|-------|
| guides/ | 3 | 800 | Débutants → Avancés |
| features/ | 9 | 3200 | Fonctionnalités spécifiques |
| technical/ | 2 | 600 | Développeurs |
| reference/ | 2 | 800 | API et config |
| Racine | 3 | 600 | Navigation et FAQ |

**Total** : 19 fichiers, ~6000 lignes

### Par type de contenu

- **Guides utilisateur** : 4 fichiers (21%)
- **Documentation fonctionnelle** : 9 fichiers (47%)
- **Documentation technique** : 4 fichiers (21%)
- **Référence** : 2 fichiers (11%)

## 🔗 Liens entre documents

### Liens internes fréquents

```
README.md → guides/QUICK-START.md
USER-GUIDE.md → features/*.md
REPORTS.md → STATISTICS.md
ALBUM-SEARCH.md → DISCOGS-API.md
PLAYLIST-EXPORT.md → PERFORMANCE.md
```

### Liens vers la racine

```
docs/*.md → ../README.md
docs/*.md → ../ARCHITECTURE.md
docs/*.md → ../CONTRIBUTING.md
docs/*.md → ../CHANGELOG.md
```

## 🎯 Conventions

### Nommage des fichiers

- **UPPERCASE** : Fichiers importants de référence
- **kebab-case** : Non utilisé (préférence UPPERCASE)
- **Extension** : `.md` uniquement

### Structure Markdown

Tous les documents suivent cette structure :

```markdown
# Titre principal

## Vue d'ensemble
- Description courte
- Objectif du document

## Fonctionnalités / Contenu principal
- Détails
- Exemples
- Code samples

## Guide d'utilisation
- Étapes pratiques
- Cas d'usage

## Architecture technique (si applicable)
- Implémentation
- Code

## Conseils et astuces
- Tips pratiques
- Bonnes pratiques

## Dépannage
- Problèmes courants
- Solutions

## Voir aussi
- Liens vers docs connexes

---
Métadonnées (version, date, etc.)
```

### Liens relatifs

Tous les liens internes utilisent des chemins relatifs :

```markdown
<!-- Depuis docs/ vers racine -->
[Architecture](../ARCHITECTURE.md)

<!-- Depuis docs/ vers sous-dossier -->
[Rapports](features/REPORTS.md)

<!-- Depuis sous-dossier vers racine -->
[README](../../README.md)

<!-- Entre sous-dossiers -->
[Performance](../technical/PERFORMANCE.md)
```

## ✅ Checklist de maintenance

### Lors de l'ajout d'une nouvelle fonctionnalité

- [ ] Créer `features/[FEATURE].md`
- [ ] Ajouter dans `docs/README.md` (table de référence)
- [ ] Mettre à jour `guides/USER-GUIDE.md` si majeur
- [ ] Ajouter cas d'usage dans FAQ si nécessaire
- [ ] Mettre à jour `CHANGELOG.md` à la racine
- [ ] Mettre à jour version dans `README.md` principal

### Lors d'une mise à jour majeure

- [ ] Mettre à jour version dans tous les docs
- [ ] Vérifier tous les liens internes
- [ ] Mettre à jour captures d'écran si présentes
- [ ] Mettre à jour `MIGRATION-DOCS.md`
- [ ] Ajouter entrée dans `CHANGELOG.md`

### Revue périodique

- [ ] Vérifier pertinence de tous les documents
- [ ] Supprimer contenus obsolètes
- [ ] Consolider si nouvelles redondances
- [ ] Mettre à jour statistiques
- [ ] Vérifier tous les liens externes

## 📝 Notes

### Points forts de cette structure

✅ **Navigation intuitive** : Hub central clair  
✅ **Organisation logique** : Par type de contenu  
✅ **Évolutivité** : Facile d'ajouter de nouveaux docs  
✅ **Maintenabilité** : Structure claire et cohérente  
✅ **Accessibilité** : Plusieurs points d'entrée

### Améliorations futures possibles

- [ ] Ajouter captures d'écran
- [ ] Créer diagrammes d'architecture
- [ ] Traduire en anglais
- [ ] Générer site statique (Docusaurus, VitePress)
- [ ] Ajouter recherche full-text
- [ ] Versioning de la documentation

---

**Structure créée** : Janvier 2025  
**Version** : 1.8.0  
**Fichiers** : 19  
**Maintenance** : En cours
