# Fonctionnalité : Export de Playlists Universelles

## 📅 Date d'implémentation
21 janvier 2026

## 🎯 Objectif
Permettre aux utilisateurs d'exporter leurs listes d'albums sous forme de playlists universelles (M3U8 ou CSV) contenant les tracklists complètes de tous les albums, pour importation dans des services de streaming musical (Spotify, Apple Music, Deezer, etc.).

## ✨ Fonctionnalités

### Export M3U8
- Format standard de playlist compatible avec la majorité des lecteurs
- Inclut les métadonnées : artiste, titre, durée
- Commentaires pour indiquer les albums et positions
- Format texte simple et éditable

### Export CSV
- Format tabulaire détaillé
- Colonnes : Position, Artist, Album, Year, Track Position, Track Title, Duration
- Idéal pour analyse ou traitement personnalisé
- Compatible avec Excel, Google Sheets

### Intégration Discogs
- Récupération automatique des tracklists via l'API Discogs
- Support des masters et releases
- Respect du rate limiting (1,1s entre requêtes)
- Gestion des erreurs et albums sans tracklist

## 🏗️ Architecture

### Nouveaux fichiers créés

#### 1. API Route
`/app/api/lists/[id]/export-playlist/route.ts`
- Endpoint GET avec paramètre `format` (m3u8 ou csv)
- Récupère la liste et ses albums depuis la base
- Appelle l'API Discogs pour chaque album
- Génère et retourne le fichier au format demandé

#### 2. Documentation
- `/docs/PLAYLIST-EXPORT.md` : Guide utilisateur complet
- `/docs/PLAYLIST-FEATURE.md` : Documentation technique (ce fichier)

#### 3. Tests
`/lib/__tests__/discogs-tracklist.test.ts`
- 5 tests pour la fonction `getDiscogsAlbumWithTracks`
- Tests de masters, releases, tracklists vides, erreurs, rate limiting
- ✅ Tous les tests passent

### Modifications de fichiers existants

#### 1. `/lib/discogs.ts`
```typescript
// Nouvelles interfaces
export interface DiscogsTrack {
  position: string
  title: string
  duration: string
}

export interface DiscogsAlbumWithTracks extends DiscogsAlbumDetails {
  tracklist: DiscogsTrack[]
}

// Nouvelle fonction
export async function getDiscogsAlbumWithTracks(
  discogsId: string, 
  type: 'master' | 'release'
): Promise<DiscogsAlbumWithTracks>
```

**Fonctionnement :**
- Appelle l'endpoint Discogs approprié (/masters ou /releases)
- Extrait toutes les données incluant la tracklist
- Respecte le rate limiting existant
- Retourne un objet complet avec album + tracks

#### 2. `/app/lists/[id]/page.tsx`
```typescript
// Nouvelle fonction handler
const handleExportPlaylist = async (format: 'm3u8' | 'csv') => {
  // Appelle l'API, télécharge le fichier
  // Affiche notifications de succès/erreur
}
```

**Modifications UI :**
- Ajout de 2 nouveaux boutons dans le menu Export
  - "Playlist M3U8" avec sous-titre "Format universel"
  - "Playlist CSV" avec sous-titre "Avec tracklist complète"
- Notifications pendant la génération
- Gestion des erreurs utilisateur

#### 3. `/README.md`
- Ajout de "Export de playlists universelles" dans les fonctionnalités
- Section détaillée sur l'export de playlists
- Instructions pour utiliser Soundiiz, TuneMyMusic, FreeYourMusic
- Conseils et limitations

## 🔄 Workflow utilisateur

1. **Utilisateur clique sur "Exporter"** dans une liste
2. **Sélectionne "Playlist M3U8" ou "Playlist CSV"**
3. **Backend :**
   - Récupère la liste et albums depuis Prisma
   - Pour chaque album :
     - Détermine le type (master/release)
     - Appelle `getDiscogsAlbumWithTracks()`
     - Collecte les tracklists
   - Génère le fichier au format demandé
4. **Frontend :**
   - Télécharge automatiquement le fichier
   - Affiche notification de succès
5. **Utilisateur peut :**
   - Importer dans Soundiiz/TuneMyMusic
   - Ouvrir dans un lecteur audio
   - Analyser dans Excel/Sheets

## 📊 Format des fichiers exportés

### Exemple M3U8
```m3u
#EXTM3U
#PLAYLIST:Mes Albums Préférés
#DESCRIPTION:Ma collection d'albums de tous les temps

# Album 1: Pink Floyd - The Dark Side of the Moon (1973)
#EXTINF:68,Pink Floyd - Speak to Me
# 1 - Speak to Me
#EXTINF:163,Pink Floyd - Breathe
# 2 - Breathe
#EXTINF:210,Pink Floyd - On the Run
# 3 - On the Run

# Album 2: The Beatles - Abbey Road (1969)
#EXTINF:260,The Beatles - Come Together
# A1 - Come Together
```

### Exemple CSV
```csv
Position,Artist,Album,Year,Track Position,Track Title,Duration
1,"Pink Floyd","The Dark Side of the Moon",1973,"1","Speak to Me","1:08"
1,"Pink Floyd","The Dark Side of the Moon",1973,"2","Breathe","2:43"
1,"Pink Floyd","The Dark Side of the Moon",1973,"3","On the Run","3:30"
2,"The Beatles","Abbey Road",1969,"A1","Come Together","4:20"
2,"The Beatles","Abbey Road",1969,"A2","Something","3:03"
```

## ⚠️ Limitations et contraintes

### 1. Albums sans Discogs ID valide
- Les albums avec `discogsId.startsWith('unknown-')` sont ignorés
- Message d'erreur si aucun album valide dans la liste

### 2. Rate Limiting Discogs
- 60 requêtes/minute maximum
- Délai de 1,1 seconde entre chaque requête
- Pour une liste de 50 albums : ~55 secondes minimum

### 3. Tracklists incomplètes
- Certains albums Discogs n'ont pas de tracklist
- Dans ce cas, l'album est sauté avec un log d'erreur
- Le processus continue avec les albums suivants

### 4. Permissions
- Vérifie que l'utilisateur a accès à la liste (publique ou propriétaire)
- Même logique que les autres endpoints d'export

### 5. Taille des listes
- Pas de limite technique
- Mais export long pour grandes listes (100+ albums = ~2 minutes)
- Considérer un système de queue/background job si problème

## 🧪 Tests

### Tests unitaires
✅ `lib/__tests__/discogs-tracklist.test.ts` (5 tests)
- Récupération master avec tracklist
- Récupération release avec labels et formats
- Gestion tracklists vides
- Gestion erreurs API
- Respect du rate limiting

### Tests manuels recommandés
1. Exporter liste avec 3-5 albums variés
2. Vérifier contenu M3U8 et CSV
3. Tester import dans Soundiiz
4. Tester avec albums sans tracklist
5. Tester permissions (liste privée, publique)

## 🔮 Améliorations futures possibles

### 1. Export asynchrone
- Pour grandes listes (>50 albums)
- Job en arrière-plan avec notification email
- Progress bar en temps réel

### 2. Cache des tracklists
- Stocker les tracklists en base de données
- Éviter requêtes répétées pour mêmes albums
- Mise à jour périodique

### 3. Intégrations directes
- API Spotify pour créer playlists directement
- API Apple Music avec MusicKit
- Liens Deezer/YouTube Music

### 4. Enrichissement métadonnées
- ISRC codes pour matching exact
- Spotify URIs pré-résolus
- Tags de genres/moods

### 5. Format XSPF
- Alternative à M3U8 plus moderne
- Support métadonnées enrichies
- Standard W3C

## 📈 Métriques à suivre

- Nombre d'exports de playlists par jour
- Format préféré (M3U8 vs CSV)
- Taux d'erreur (albums sans tracklist)
- Temps moyen d'export par taille de liste
- Feedback utilisateurs sur imports streaming

## 🔗 Dépendances

### Packages NPM
- Aucun nouveau package nécessaire
- Utilise fetch natif pour Discogs API

### Services externes
- **Discogs API** : requis pour tracklists
  - Token dans variables d'environnement
  - Rate limit : 60 req/min
  
### Services tiers recommandés
- **Soundiiz** : conversion playlists
- **TuneMyMusic** : transfert entre plateformes
- **FreeYourMusic** : app desktop

## 🚀 Déploiement

### Variables d'environnement
Aucune nouvelle variable requise.
Utilise `DISCOGS_TOKEN` existant.

### Base de données
Aucun changement de schéma.
Utilise champ `discogsType` existant.

### Build
```bash
# Aucune étape supplémentaire
npm run build
```

### Tests pré-déploiement
```bash
# Tester la nouvelle fonctionnalité
npm test -- discogs-tracklist

# Tester tous les tests
npm test
```

## 📝 Checklist de déploiement

- ✅ Code implémenté et testé
- ✅ Tests unitaires créés (5/5 passent)
- ✅ Documentation utilisateur créée
- ✅ Documentation technique créée (ce fichier)
- ✅ README.md mis à jour
- ✅ Interface utilisateur ajoutée
- ✅ Gestion d'erreurs implémentée
- ✅ Rate limiting respecté
- ⏳ Tests manuels dans l'app
- ⏳ Test d'import dans Soundiiz/TuneMyMusic
- ⏳ Vérification performance grandes listes

## 🎉 Résultat

Cette fonctionnalité transforme Ranklist d'un simple gestionnaire de listes d'albums en un véritable pont vers les services de streaming musical. Les utilisateurs peuvent maintenant :

1. **Créer** leurs listes d'albums préférés
2. **Organiser** et classer leurs découvertes
3. **Partager** leurs goûts avec des amis
4. **Exporter** vers leurs plateformes de streaming
5. **Écouter** facilement leur collection

C'est une valeur ajoutée majeure qui rend l'application beaucoup plus utile et intégrée dans l'écosystème musical moderne ! 🎵
