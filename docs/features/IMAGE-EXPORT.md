# 🖼️ Export d'images (Mosaïques)

## Vue d'ensemble

La fonctionnalité d'export d'images permet de créer des mosaïques visuelles de vos listes d'albums. Idéal pour partager sur les réseaux sociaux ou créer des affiches visuelles de votre collection.

**Disponible depuis** : Version 1.5.0

## ✨ Fonctionnalités

### Trois styles visuels

1. **Style Grid (Grille)**
   - Disposition en grille régulière
   - Toutes les pochettes à taille égale
   - Espacement uniforme
   - Look classique et épuré

2. **Style Collage**
   - Disposition variée et dynamique
   - Tailles de pochettes différentes
   - Rotation légère des éléments
   - Effet créatif et artistique

3. **Style Compact**
   - Grille serrée sans espacement
   - Maximise le nombre de pochettes visibles
   - Parfait pour grandes collections
   - Look dense et impactant

### Formats d'export

- **Format** : PNG (haute qualité)
- **Résolution** : Optimisée pour partage web et impression
- **Transparence** : Fond transparent ou personnalisable
- **Dimensions** : Adaptées au nombre d'albums

## 📖 Guide d'utilisation

### 1. Accéder à l'export d'images

Depuis la page de votre liste :
1. Ouvrir le menu "Actions" ou "Exporter"
2. Sélectionner "Exporter en image"
3. La modale d'export s'ouvre

### 2. Choisir le style

**Grid (Grille)** :
- Recommandé pour : Collections organisées, look professionnel
- Avantages : Lisible, équilibré, classique
- Idéal pour : 9-25 albums

**Collage** :
- Recommandé pour : Effet artistique, originalité
- Avantages : Créatif, dynamique, unique
- Idéal pour : 6-20 albums

**Compact** :
- Recommandé pour : Grandes collections, maximiser l'espace
- Avantages : Nombreuses pochettes visibles, impact visuel
- Idéal pour : 20+ albums

### 3. Générer l'image

1. Cliquer sur "Générer l'image"
2. Le système charge toutes les pochettes
3. La mosaïque s'affiche en prévisualisation
4. Téléchargement automatique du PNG

### 4. Utiliser l'image

**Sur les réseaux sociaux** :
- Instagram : Story ou post
- Twitter/X : Tweet avec image
- Facebook : Post visuel
- Reddit : Post dans communautés musicales

**Autres usages** :
- Fond d'écran personnalisé
- Affiche imprimée
- Portfolio musical
- Blog ou site web

## 🎨 Exemples visuels

### Grid (9 albums, 3x3)
```
┌──────┐ ┌──────┐ ┌──────┐
│Album1│ │Album2│ │Album3│
└──────┘ └──────┘ └──────┘

┌──────┐ ┌──────┐ ┌──────┐
│Album4│ │Album5│ │Album6│
└──────┘ └──────┘ └──────┘

┌──────┐ ┌──────┐ ┌──────┐
│Album7│ │Album8│ │Album9│
└──────┘ └──────┘ └──────┘
```

### Collage (9 albums, disposition variée)
```
    ┌────┐
    │ A1 │     ┌──────┐
    └────┘     │  A2  │
┌──────┐       └──────┘
│  A3  │  ┌────┐
└──────┘  │ A4 │  ┌──────┐
    ┌────┐└────┘  │  A5  │
    │ A6 │        └──────┘
    └────┘  ┌────┐
┌──────┐    │ A7 │
│  A8  │    └────┘
└──────┘    ┌──────┐
            │  A9  │
            └──────┘
```

### Compact (16 albums, 4x4, pas d'espacement)
```
┌────┬────┬────┬────┐
│ A1 │ A2 │ A3 │ A4 │
├────┼────┼────┼────┤
│ A5 │ A6 │ A7 │ A8 │
├────┼────┼────┼────┤
│ A9 │A10 │A11 │A12 │
├────┼────┼────┼────┤
│A13 │A14 │A15 │A16 │
└────┴────┴────┴────┘
```

## 🛠️ Architecture technique

### Bibliothèque utilisée

**html2canvas** : Convertit DOM en canvas, puis en image PNG

```typescript
import html2canvas from 'html2canvas'

const exportToImage = async (style: 'grid' | 'collage' | 'compact') => {
  const element = document.getElementById('mosaic-container')
  const canvas = await html2canvas(element, {
    backgroundColor: null,
    scale: 2, // Haute résolution
    useCORS: true, // Pour charger images Discogs
  })
  
  const dataUrl = canvas.toDataURL('image/png')
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = `liste-${listId}-${style}.png`
  link.click()
}
```

### Styles CSS par type

**Grid** :
```css
.mosaic-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  padding: 20px;
}

.album-cover {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
}
```

**Collage** :
```css
.mosaic-collage {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 20px;
}

.album-cover {
  width: calc(25% - 12px);
  transform: rotate(var(--random-rotation));
}

.album-cover:nth-child(odd) {
  width: calc(30% - 12px);
}
```

**Compact** :
```css
.mosaic-compact {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0;
}

.album-cover {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
}
```

### Gestion du chargement des images

```typescript
const loadAllImages = async (albums: Album[]) => {
  const promises = albums.map(album => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous' // CORS Discogs
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = album.coverUrl || '/placeholder.png'
    })
  })
  
  await Promise.all(promises)
}
```

## 💡 Conseils et astuces

### Pour des images de qualité

✅ **Nombre d'albums optimal** :
- Grid : 9, 16, 25 (carrés parfaits)
- Collage : 6-20 albums
- Compact : 20+ albums

✅ **Qualité des pochettes** :
- Attendre que toutes les images soient chargées
- Éviter les connexions lentes lors de l'export
- Discogs fournit des images haute qualité

✅ **Résolution** :
- scale: 2 dans html2canvas = 2x la résolution
- Images nettes pour impression et écrans haute densité

### Pour le partage

✅ **Réseaux sociaux** :
- Instagram : Format carré idéal (Grid 3x3)
- Twitter : Format horizontal (Grid 4x3)
- Stories : Format vertical (Grid 2x4)

✅ **Texte et branding** :
- Ajouter le titre de la liste en overlay
- Ajouter votre nom d'utilisateur
- Logo RankList en coin (optionnel)

## 🐛 Dépannage

### Les images ne se chargent pas

**Cause** : Problème CORS avec Discogs

**Solution** :
```typescript
// Dans html2canvas options
{
  useCORS: true,
  allowTaint: false
}

// Dans le tag img
<img crossOrigin="anonymous" src={coverUrl} />
```

### L'image est floue

**Cause** : Scale trop faible

**Solution** :
```typescript
html2canvas(element, { scale: 2 }) // ou scale: 3
```

### Le téléchargement ne fonctionne pas

**Cause** : Bloqueur de popups

**Solution** :
- Autoriser les téléchargements pour le site
- Utiliser un navigateur compatible
- Vérifier les permissions

### Certaines pochettes manquent

**Cause** : Images non chargées avant export

**Solution** :
```typescript
// Attendre le chargement complet
await loadAllImages(albums)
await new Promise(resolve => setTimeout(resolve, 1000))
// Puis exporter
```

## 🔮 Évolutions futures

### Fonctionnalités planifiées

- [ ] Personnalisation des couleurs de fond
- [ ] Ajout de texte (titre, date, auteur)
- [ ] Filtres et effets (sépia, noir et blanc)
- [ ] Formats d'export supplémentaires (JPEG, SVG)
- [ ] Tailles prédéfinies (Instagram, Twitter, etc.)
- [ ] Templates de design prédéfinis
- [ ] Export multi-listes (mosaïque combinée)

### Améliorations techniques

- [ ] Utiliser Canvas API directement (plus de contrôle)
- [ ] Caching des images converties
- [ ] Workers pour génération en arrière-plan
- [ ] Prévisualisation temps réel

## 📚 Voir aussi

- [Génération de rapports](REPORTS.md) - Exporter en HTML/CSV/TXT
- [Export de playlists](PLAYLIST-EXPORT.md) - Exporter en M3U8
- [Partage de listes](SHARING.md) - Partager publiquement
- [Gestion de listes](LISTS-MANAGEMENT.md) - Créer et modifier

---

**Bibliothèque** : html2canvas  
**Version** : 1.5.0+  
**Dernière mise à jour** : Janvier 2025
