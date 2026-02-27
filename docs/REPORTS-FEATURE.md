# Génération de Rapports - Documentation

## Vue d'ensemble

La fonctionnalité de génération de rapports permet aux utilisateurs de créer des documents de qualité regroupant plusieurs listes d'albums. Cette fonctionnalité est accessible via le menu "Rapports" dans la barre de navigation.

## Accès à la fonctionnalité

- **URL**: `/reports`
- **Authentification**: Requise
- **Permissions**: Utilisateur doit être propriétaire des listes

## Fonctionnalités

### 1. Filtrage et tri des listes

Avant la sélection, les utilisateurs peuvent filtrer et trier leurs listes :

**Filtres disponibles:**
- **Visibilité:** Toutes / Publiques / Privées
- **Catégorie:** Filtrage par catégorie assignée aux listes
- **Période:** Filtrage par période définie (années, décennies, etc.)

**Options de tri:**
- **Titre:** Ordre alphabétique
- **Dernière modification:** Par date de mise à jour
- **Nombre d'albums:** Par quantité d'albums
- **Période:** Ordre chronologique

**Ordre:** Croissant (A→Z) ou Décroissant (Z→A)

Les filtres sont appliqués côté client avec `useMemo` pour des performances optimales. Un badge indique le nombre de filtres actifs, et un bouton permet de réinitialiser tous les filtres.

### 2. Sélection de listes

- Interface de sélection intuitive avec cases à cocher
- Possibilité de sélectionner/désélectionner toutes les listes en un clic
- Affichage du nombre d'albums par liste
- Indication de la période et des catégories associées
- Le compteur affiche "X sur Y" lorsque des filtres sont actifs

### 3. Génération du rapport

Une fois les listes sélectionnées, cliquez sur "Générer le rapport" pour créer un rapport structuré contenant:

- Titre et description de chaque liste
- Période associée (si définie)
- Liste complète des albums avec:
  - Position (si liste classée)
  - Nom de l'artiste
  - Titre de l'album
  - Année de sortie

**Important:** Le rapport respecte l'ordre de tri choisi dans les filtres (titre, période, etc.)

### 4. Formats d'export

Le rapport peut être exporté dans plusieurs formats:

#### HTML (Impression)
- Format web optimisé pour l'impression
- Design professionnel avec en-têtes colorés
- **Grille visuelle des pochettes d'albums**
- Cartes d'albums avec position, titre, artiste, année
- Layout responsive (grille adaptative)
- Compatible avec tous les navigateurs
- Peut être imprimé directement ou converti en PDF via l'impression navigateur
- Fallback élégant si les images ne sont pas disponibles

#### CSV (Excel)
- Format tabulaire compatible Excel/Sheets
- Colonnes: Liste, Artiste, Titre, Année
- Encodage UTF-8 pour les caractères spéciaux
- Facile à analyser et à traiter

#### Texte (.txt)
- Format texte brut universel
- Design ASCII avec séparateurs visuels
- Compatible avec tous les éditeurs de texte
- Idéal pour l'archivage ou les systèmes legacy

## Architecture technique

### Frontend

**Page**: `app/reports/page.tsx`
- Interface utilisateur pour la sélection et l'export
- Gestion de l'état local avec React hooks
- Génération des exports côté client
- Filtrage et tri côté client avec `useMemo` pour performance
- Extraction dynamique des catégories et périodes uniques
- Badge de notification pour filtres actifs

### Backend

**API Generate**: `app/api/reports/generate/route.ts`
- Récupération des listes et albums depuis la base de données
- Validation des permissions utilisateur
- Formatage des données pour le rapport
- Support des paramètres de tri (`sortBy`, `sortOrder`)
- Tri serveur des listes selon les critères

**API Export PDF**: `app/api/reports/export-pdf/route.ts`
- Endpoint de préparation des données pour export PDF
- (Note: La génération PDF actuelle se fait côté client)

### Sécurité

- Authentification NextAuth requise
- Vérification que l'utilisateur est propriétaire des listes
- Validation des IDs de liste fournis
- Protection contre l'accès non autorisé

## Utilisation

### Étape 1: Accéder à la page

Depuis la barre de navigation, cliquez sur "Rapports" ou accédez directement à `/reports`.

### Étape 2: Filtrer et trier (optionnel)

- Cliquez sur "Filtres" pour ouvrir le panneau
- Sélectionnez vos critères (visibilité, catégorie, période)
- Choisissez l'ordre de tri
- Observez le compteur qui s'ajuste en temps réel

### Étape 3: Sélectionner les listes

- Cochez les listes que vous souhaitez inclure dans le rapport
- Utilisez "Tout sélectionner" pour une sélection rapide
- Le compteur affiche le nombre de listes sélectionnées

### Étape 4: Générer le rapport

Cliquez sur "Générer le rapport". Le système récupère toutes les données et affiche:
- Le nombre total d'albums
- Le nombre de listes incluses

**Note:** Les listes dans le rapport seront ordonnées selon votre choix de tri.

### Étape 5: Exporter

Choisissez le format d'export souhaité:
- **HTML**: Pour une présentation professionnelle ou une impression
- **CSV**: Pour une analyse dans Excel/Sheets
- **Texte**: Pour un format universel et léger

Le fichier est téléchargé automatiquement avec un nom contenant la date du jour.

## Exemples de cas d'usage

### 1. Rapport annuel
Sélectionnez toutes vos listes de l'année et générez un rapport HTML pour créer un document récapitulatif élégant.

### 2. Rapport par catégorie
Utilisez le filtre "Catégorie" pour sélectionner uniquement vos listes Rock, puis exportez en PDF.

### 3. Analyse chronologique
Triez vos listes par période en ordre croissant, sélectionnez-les toutes, et exportez pour voir l'évolution de vos goûts dans le temps.

### 4. Analyse de collection
Exportez en CSV pour analyser vos albums dans Excel (statistiques par année, par artiste, etc.).

### 3. Partage physique
Générez un rapport HTML, imprimez-le en PDF, et partagez-le par email ou imprimez-le physiquement.

### 4. Backup textuel
Exportez en .txt pour archiver vos listes dans un format léger et pérenne.

## Limitations actuelles

- Maximum de listes: Illimité (mais performances peuvent varier avec de très grandes collections)
- Export PDF: Utilise l'impression navigateur (pas de génération PDF serveur native)
- Images: ✅ **Les couvertures d'albums sont maintenant incluses dans l'export HTML**
  - Affichage en grille visuelle
  - Chargement lazy pour performance
  - Fallback automatique si image indisponible

## Améliorations futures possibles

1. **Export PDF natif avec couvertures**: Génération PDF côté serveur avec images des albums (actuellement via impression navigateur)
2. **Export Word/DOCX**: Format éditable pour personnalisation avec images
3. **Templates personnalisables**: Choix de différents styles de rapport (grille, liste, mixte)
4. **Envoi par email**: Option d'envoyer le rapport directement par email avec images
5. **Planification**: Génération automatique de rapports périodiques
6. **Statistiques avancées**: Graphiques et analyses dans le rapport
7. **Choix du format d'affichage**: Option pour basculer entre grille visuelle et tableau

## Support

Pour toute question ou problème avec la fonctionnalité de rapports, contactez le support ou ouvrez une issue sur le dépôt GitHub.
