# Export de Playlists Universelles

## 📝 Formats disponibles

### 🎵 M3U8 (Extended M3U)

Format de playlist universel compatible avec la plupart des lecteurs et services.

**Structure du fichier :**
```m3u
#EXTM3U
#PLAYLIST:Nom de la liste
#DESCRIPTION:Description de la liste

# Album 1: Artiste - Titre Album (Année)
#EXTINF:240,Artiste - Titre du morceau
# Position - Titre du morceau

# Album 2: Artiste - Titre Album (Année)
#EXTINF:180,Artiste - Titre du morceau
# Position - Titre du morceau
```

**Utilisation :**
- Compatible avec VLC, iTunes, Winamp, et la plupart des lecteurs audio
- Peut être utilisé avec des outils de conversion (Soundiiz, TuneMyMusic)
- Format texte simple, facilement éditable

### 📊 CSV (Tracklist complète)

Format tabulaire avec toutes les métadonnées des pistes.

**Structure du fichier :**
```csv
Position,Artist,Album,Year,Track Position,Track Title,Duration
1,"Pink Floyd","The Dark Side of the Moon",1973,"1","Speak to Me","1:08"
1,"Pink Floyd","The Dark Side of the Moon",1973,"2","Breathe","2:43"
2,"The Beatles","Abbey Road",1969,"1","Come Together","4:20"
```

**Colonnes :**
- `Position` : Position de l'album dans la liste
- `Artist` : Nom de l'artiste
- `Album` : Titre de l'album
- `Year` : Année de sortie
- `Track Position` : Position du morceau dans l'album
- `Track Title` : Titre du morceau
- `Duration` : Durée du morceau (format MM:SS)

**Utilisation :**
- Import dans Excel, Google Sheets pour analyse
- Traitement avec des scripts personnalisés
- Compatible avec certains outils de conversion

## 🔄 Importer dans des services de streaming

### Méthodes recommandées

#### 1. Soundiiz (soundiiz.com)
✅ Supporte : Spotify, Apple Music, Deezer, YouTube Music, Tidal, Amazon Music, etc.

**Étapes :**
1. Créer un compte sur Soundiiz
2. Utiliser "Import Playlist" → "From file"
3. Uploader votre fichier M3U8 ou CSV
4. Sélectionner la plateforme cible
5. Lancer la conversion

**Limites :**
- Version gratuite : 200 morceaux par playlist
- Version premium : illimitée

#### 2. TuneMyMusic (tunemymusic.com)
✅ Supporte : Spotify, Apple Music, YouTube, Deezer, etc.

**Étapes :**
1. Aller sur tunemymusic.com
2. Choisir "File" comme source
3. Uploader votre fichier
4. Sélectionner la plateforme destination
5. Lancer le transfert

**Limites :**
- Version gratuite : 500 morceaux
- Version premium : illimitée

#### 3. FreeYourMusic (freeyourmusic.com)
✅ Application desktop pour conversions avancées

**Avantages :**
- Plus fiable pour grandes playlists
- Support de nombreux formats
- Gestion des doublons

**Limites :**
- Application payante (essai gratuit)

### Import manuel

Pour des listes courtes ou des albums spécifiques, vous pouvez :

1. **Utiliser le CSV comme référence** :
   - Ouvrir le fichier dans Excel/Google Sheets
   - Rechercher manuellement chaque album sur votre plateforme
   - Ajouter à une playlist

2. **Script personnalisé** :
   - Utiliser les APIs des plateformes (Spotify, Apple Music)
   - Parser le CSV et automatiser l'ajout
   - Nécessite des connaissances en programmation

## ⚠️ Limitations

### Albums introuvables
Certains albums de votre liste peuvent ne pas être disponibles sur les services de streaming :
- Éditions vinyles rares
- Pressages limités
- Albums épuisés
- Artistes indépendants non distribués

Dans ces cas, les outils de conversion sauteront ces albums ou proposeront des alternatives.

### Tracklists incomplètes
Certains albums sur Discogs peuvent avoir des tracklists incomplètes :
- Durées manquantes
- Positions non numérotées
- Bonus tracks non listés

### Rate limiting
L'export de grandes listes (50+ albums) peut prendre plusieurs minutes en raison des limites de l'API Discogs (60 requêtes/minute).

## 💡 Conseils

1. **Vérifiez avant d'importer** : Ouvrez le fichier M3U8 ou CSV pour vérifier que les tracklists sont complètes

2. **Divisez les grandes listes** : Si vous avez plus de 100 albums, envisagez de créer plusieurs playlists plus petites

3. **Utilisez le CSV pour analyse** : Le format CSV est idéal pour voir le nombre total de morceaux, la durée totale, etc.

4. **Gardez une copie** : Les fichiers exportés peuvent servir d'archive de vos goûts musicaux à un moment donné

## 🔗 Ressources

- [Spécification M3U8](https://en.wikipedia.org/wiki/M3U)
- [API Discogs](https://www.discogs.com/developers)
- [Soundiiz Help](https://soundiiz.com/help)
- [TuneMyMusic Guide](https://www.tunemymusic.com/transfer)

## 📧 Support

Si vous rencontrez des problèmes lors de l'export ou de l'import de playlists, vérifiez que :
- Les albums ont des IDs Discogs valides
- Vous n'exportez pas d'albums "inconnus" (ajoutés manuellement sans Discogs)
- Votre liste contient au moins un album avec une tracklist disponible
