# 📖 Guide utilisateur complet

Guide complet pour utiliser toutes les fonctionnalités de RankList.

## 📑 Table des matières

1. [Compte et authentification](#compte-et-authentification)
2. [Gestion des listes](#gestion-des-listes)
3. [Recherche et ajout d'albums](#recherche-et-ajout-dalbums)
4. [Organisation et tri](#organisation-et-tri)
5. [Import et export](#import-et-export)
6. [Rapports et statistiques](#rapports-et-statistiques)
7. [Partage et collaboration](#partage-et-collaboration)
8. [Personnalisation](#personnalisation)

---

## Compte et authentification

### Créer un compte

1. Cliquer sur "S'inscrire"
2. Renseigner email, nom d'utilisateur, mot de passe
3. Valider → Connexion automatique

### Se connecter

- Email + mot de passe
- Session persistante (cookie)

### Gérer son profil

**Page Profil** (`/profile`) :
- Avatar (optionnel)
- Nom d'utilisateur
- Email
- Modifier mot de passe
- Supprimer le compte

---

## Gestion des listes

### Créer une liste

**Depuis "Mes Listes"** :
1. Cliquer sur "+" ou "Nouvelle Liste"
2. Renseigner :
   - **Titre** (requis) : "Ma collection Rock"
   - **Description** (optionnel) : Contexte de la liste
   - **Période** (optionnel) : "2024", "1980s", custom
   - **Catégories** (optionnel) : Rock, Jazz, etc.
   - **Visibilité** : Publique ou Privée
3. Créer

### Modifier une liste

**Depuis la page de la liste** :
1. Menu "..." → "Paramètres"
2. Modifier titre, description, période
3. Sauvegarder

### Supprimer une liste

⚠️ **Action irréversible**

1. Page de la liste → Menu "..."
2. "Supprimer la liste"
3. Confirmer

Tous les albums de cette liste seront supprimés.

### Organiser ses listes

**Page "Mes Listes"** :
- **Rechercher** : Barre de recherche
- **Filtrer** :
  - Par visibilité (publiques/privées)
  - Par période
  - Par catégorie
- **Trier** :
  - Par titre (A-Z)
  - Par date de modification
  - Par nombre d'albums
  - Par période

---

## Recherche et ajout d'albums

### Recherche Discogs

**Depuis une liste** :
1. Cliquer sur "Ajouter un album"
2. Taper : "Artiste Titre"
   - Ex: "Pink Floyd Dark Side"
3. Résultats en temps réel
4. Sélectionner l'album
5. Album ajouté automatiquement

**Conseils** :
- ✅ Soyez spécifique
- ✅ Ajoutez l'année si besoin
- ✅ Vérifiez l'artiste pour homonymes

### Ajouter depuis l'Explorer

**Depuis `/explore`** :
1. Trouver une liste intéressante
2. Ouvrir la liste
3. Survoler un album
4. Cliquer sur "Ajouter à mes listes"
5. Choisir la liste de destination

### Détails Discogs

**Consulter les infos complètes** :
1. Survoler un album
2. Cliquer sur l'icône "i"
3. Modal s'ouvre avec :
   - Type (Album, EP, etc.)
   - Labels
   - Genres et styles
   - Pays de publication
   - Formats disponibles
   - Tracklist complète
   - Lien Discogs
   - Bouton Apple Music

### Apple Music

**Écouter directement** :
1. Modale détails → Bouton "Apple Music"
2. Recherche pré-remplie dans Apple Music
3. Écouter ou ajouter à sa bibliothèque

---

## Organisation et tri

### Glisser-déposer

**Mode Édition** (automatique lors de l'ajout) :
1. Cliquer et maintenir sur un album
2. Glisser vers la position souhaitée
3. Relâcher
4. Position mise à jour automatiquement

**Vue Liste** : Drag & drop vertical  
**Vue Grille** : Drag & drop dans la grille

### Numérotation automatique

- Si la liste a un ordre : #1, #2, #3...
- Positions mises à jour en temps réel
- Sauvegarde automatique

### Vues disponibles

**Vue Liste** (par défaut) :
- Albums empilés verticalement
- Pochette + infos à côté
- Drag & drop facile
- Boutons d'action visibles

**Vue Grille** :
- Pochettes en grille
- Responsive (3-5 colonnes)
- Overlay au survol
- Drag & drop dans la grille

Basculer avec le bouton en haut de la liste.

### Supprimer un album

**Mode Édition** :
1. Icône poubelle sur l'album
2. Confirmer
3. Album supprimé

---

## Import et export

### Import CSV

**Format** :
```csv
Artiste,Titre,Année
Pink Floyd,The Dark Side of the Moon,1973
Led Zeppelin,Led Zeppelin IV,1971
```

**Procédure** :
1. Page liste → Menu "..." → "Importer"
2. Choisir "CSV"
3. Sélectionner fichier
4. Valider
5. Albums ajoutés automatiquement

### Import JSON

**Format** :
```json
[
  {
    "artist": "Pink Floyd",
    "title": "The Dark Side of the Moon",
    "year": 1973,
    "discogsId": "123456"
  }
]
```

**Avantages** :
- Métadonnées complètes conservées
- Import direct avec IDs Discogs
- Plus rapide (pas de recherche)

### Export CSV

**Pour analyse Excel** :
1. Menu liste → "Exporter" → "CSV"
2. Fichier téléchargé
3. Ouvrir dans Excel/Sheets

**Format** :
```csv
Position,Artiste,Titre,Année
1,Pink Floyd,The Dark Side of the Moon,1973
2,Led Zeppelin,Led Zeppelin IV,1971
```

### Export JSON

**Pour backup ou transfert** :
1. Menu liste → "Exporter" → "JSON"
2. Fichier téléchargé

**Contient** :
- Métadonnées liste
- Tous les albums avec détails
- IDs Discogs
- Positions

### Export playlist M3U8

**Pour lecteurs audio** :
1. Menu liste → "Exporter" → "Playlist M3U8"
2. Fichier téléchargé
3. Importer dans :
   - iTunes/Apple Music
   - Spotify (via Soundiiz)
   - VLC
   - Autres lecteurs

**Voir** : [Export de playlists](../features/PLAYLIST-EXPORT.md)

### Export image (mosaïque)

**Pour réseaux sociaux** :
1. Menu liste → "Exporter" → "Image"
2. Choisir style :
   - Grid : Grille régulière
   - Collage : Artistique
   - Compact : Dense
3. Générer
4. PNG téléchargé

**Voir** : [Export d'images](../features/IMAGE-EXPORT.md)

---

## Rapports et statistiques

### Générer un rapport

**Depuis `/reports`** :
1. Filtrer vos listes (optionnel)
2. Sélectionner les listes à inclure
3. Cliquer sur "Générer le rapport"
4. Choisir le format :
   - **HTML** : Design avec pochettes + stats
   - **CSV** : Excel avec stats
   - **TXT** : Texte avec stats

**Contenu** :
- Toutes les listes sélectionnées
- Grilles de pochettes (HTML)
- Détails complets des albums
- **Statistiques** :
  - Top 10 artistes
  - Top 10 années

**Voir** : [Génération de rapports](../features/REPORTS.md)

### Consulter ses statistiques

**Page `/stats`** :

**Albums par décennie** :
- Graphique en barres
- Répartition temporelle
- Identifie vos périodes favorites

**Top artistes** :
- Classement par nombre d'albums
- Top 10
- Vos artistes dominants

**Albums favoris** :
- Albums présents dans plusieurs listes
- Vos vrais incontournables

**Statistiques globales** :
- Nombre total de listes
- Nombre d'albums uniques
- Nombre d'artistes différents
- Période couverte

**Voir** : [Statistiques](../features/STATISTICS.md)

---

## Partage et collaboration

### Rendre une liste publique

**Depuis paramètres de la liste** :
1. Activer "Liste publique"
2. Sauvegarder

**Conséquences** :
- Visible sur `/explore`
- Indexable par moteurs de recherche
- URL : `/lists/[id]`

### Générer un lien de partage

**Pour listes privées** :
1. Page liste → "Partager"
2. "Générer un lien"
3. Token unique créé
4. Copier le lien
5. Partager

**Format** : `https://ranklist.app/shared/[token]`

**Avantages** :
- Fonctionne même si liste privée
- Pas besoin de compte pour consulter
- Révocable à tout moment

### Révoquer un lien

1. Page liste → "Partager"
2. "Révoquer le lien"
3. Ancien lien ne fonctionne plus

### Explorer les listes publiques

**Page `/explore`** :
- Toutes les listes publiques
- Recherche textuelle
- Filtres (période)
- Tri (récentes, titre, albums, période)

**Voir** : [Page Explorer](../features/EXPLORE-FILTERS.md)

---

## Personnalisation

### Thème clair/sombre

**Bouton dans le menu** :
- Cliquer sur l'icône soleil/lune
- Bascule instantanée
- Préférence sauvegardée

### Langue

Actuellement : Français uniquement  
À venir : Anglais, Espagnol

### Avatar

**Page profil** :
1. Cliquer sur l'avatar
2. Uploader une image
3. Sauvegarder

### Notifications (à venir)

- Nouveau follower
- Liste partagée
- Commentaire

---

## 💡 Astuces avancées

### Workflow efficace

**Pour créer une grosse collection** :
1. Créer des listes thématiques
2. Importer en CSV/JSON (plus rapide)
3. Générer rapports périodiques
4. Partager les meilleures

**Pour découvrir de la musique** :
1. Explorer les listes publiques
2. Filtrer par période/genre
3. Ajouter albums intéressants à vos listes
4. Écouter sur Apple Music

**Pour analyser sa collection** :
1. Consulter statistiques régulièrement
2. Générer rapports CSV pour Excel
3. Créer graphiques personnalisés
4. Identifier trous dans la collection

### Raccourcis clavier (à venir)

- `Ctrl+N` : Nouvelle liste
- `Ctrl+F` : Rechercher
- `Ctrl+S` : Sauvegarder
- `Ctrl+E` : Exporter

### Organisation optimale

**Structure recommandée** :
```
📁 Par genre
  - Rock classique
  - Jazz moderne
  - Hip-Hop 2020s

📁 Par période
  - Années 70
  - Années 80
  - Années 90

📁 Par usage
  - Albums à écouter
  - Découvertes récentes
  - Favoris absolus
  - Wishlist
```

---

## 🐛 Problèmes courants

### Recherche ne trouve rien

**Solutions** :
- Vérifier l'orthographe
- Essayer variations
- Ajouter l'année
- Chercher sur discogs.com d'abord

### Pochettes manquantes

**Cause** : Pas d'image sur Discogs

**Solution** : Normal, image peut être ajoutée sur Discogs

### Export playlist vide

**Cause** : Pas de tracklist sur Discogs

**Solution** : Certains albums n'ont pas de tracklist complète

### Statistiques incorrectes

**Cause** : Cache ou calcul en cours

**Solution** : Recharger la page

---

## 📚 Ressources

### Documentation complète

- [Gestion de listes](../features/LISTS-MANAGEMENT.md)
- [Recherche d'albums](../features/ALBUM-SEARCH.md)
- [Génération de rapports](../features/REPORTS.md)
- [Export de playlists](../features/PLAYLIST-EXPORT.md)
- [Statistiques](../features/STATISTICS.md)

### Support

- 🐛 **Bugs** : GitHub Issues
- 💬 **Discussions** : GitHub Discussions
- 📧 **Contact** : support@ranklist.app

---

**Version** : 1.8.0  
**Dernière mise à jour** : Janvier 2025
