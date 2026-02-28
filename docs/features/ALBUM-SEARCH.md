# 🔍 Recherche d'albums (Discogs)

## Vue d'ensemble

Le système de recherche d'albums utilise l'API Discogs pour accéder à plus de 14 millions d'albums. La recherche est optimisée pour trouver rapidement les albums que vous cherchez, avec gestion des homonymes et des releases multiples.

**Base de données** : Discogs (14M+ albums)  
**API** : Discogs API v2

## ✨ Fonctionnalités

### 🔍 Recherche intelligente

- **Recherche par artiste + titre**
- **Autocomplétion** temps réel
- **Déduplication** automatique des résultats
- **Priorisation** des masters sur releases
- **Gestion des homonymes** (via ID artiste Discogs)
- **Fallback** sur releases si master indisponible

### 🎯 Sélection précise

- **Aperçu de la pochette**
- **Informations complètes** (artiste, titre, année, label, formats)
- **Lien Discogs** pour plus de détails
- **Bouton Apple Music** pour écouter

### 💾 Détails Discogs

Modal avec informations complètes :
- **Type** : Album, EP, Single, Compilation
- **Labels** : Maisons de disques
- **Genres** : Rock, Jazz, Electronic, etc.
- **Styles** : Plus précis que genres
- **Pays** : Pays de publication
- **Formats** : Vinyl, CD, Cassette, Digital
- **Tracklist** : Liste complète des pistes

## 📖 Guide d'utilisation

### Recherche basique

```
1. Aller sur une liste
2. Cliquer sur "Ajouter un album"
3. Taper : "Pink Floyd Dark Side"
4. Sélectionner le résultat
5. Album ajouté à la liste
```

### Recherche avec homonymes

**Problème** : Plusieurs artistes portent le même nom

**Exemple** : "John Williams"
- John Williams (compositeur de films)
- John Williams (guitariste classique)

**Solution** :
```
1. Rechercher "John Williams"
2. Les résultats montrent les différents artistes
3. Sélectionner celui avec l'ID Discogs correct
4. Ou affiner avec plus de contexte : "John Williams Star Wars"
```

### Recherche d'albums obscurs

**Tips pour albums rares** :
```
✅ Utiliser le nom exact de l'artiste
✅ Ajouter l'année si connue : "Artist Album 1973"
✅ Essayer différentes orthographes
✅ Chercher le label : "Artist Label Records"
```

### Consultation détails Discogs

```
1. Survoler un album dans la liste
2. Cliquer sur l'icône "i" (info)
3. Modal s'ouvre avec détails complets
4. Lien "Voir sur Discogs" pour page complète
```

### Lien Apple Music

```
1. Dans le modal d'infos
2. Cliquer sur le bouton "Apple Music" (icône rose)
3. S'ouvre dans Apple Music avec recherche pré-remplie
4. Écouter ou ajouter à votre bibliothèque
```

## 🛠️ Architecture technique

### API Discogs

**Endpoint de recherche** :
```typescript
const searchAlbums = async (query: string) => {
  const response = await fetch(
    `https://api.discogs.com/database/search?q=${encodeURIComponent(query)}&type=master,release&per_page=20`,
    {
      headers: {
        'Authorization': `Discogs token=${process.env.DISCOGS_TOKEN}`,
        'User-Agent': 'RankList/1.0'
      }
    }
  )
  return response.json()
}
```

**Endpoint détails album** :
```typescript
const getAlbumDetails = async (discogsId: string, type: 'master' | 'release') => {
  const endpoint = type === 'master' 
    ? `https://api.discogs.com/masters/${discogsId}`
    : `https://api.discogs.com/releases/${discogsId}`
  
  const response = await fetch(endpoint, {
    headers: {
      'Authorization': `Discogs token=${process.env.DISCOGS_TOKEN}`,
      'User-Agent': 'RankList/1.0'
    }
  })
  return response.json()
}
```

### Déduplication des résultats

```typescript
const deduplicateResults = (results: DiscogsResult[]) => {
  const seen = new Map()
  
  return results.filter(result => {
    const key = `${result.artist}-${result.title}`
    
    if (seen.has(key)) {
      // Garder le master si on a déjà une release
      const existing = seen.get(key)
      if (result.type === 'master' && existing.type === 'release') {
        seen.set(key, result)
        return true
      }
      return false
    }
    
    seen.set(key, result)
    return true
  })
}
```

### Priorisation master/release

```typescript
// 1. Chercher le master
const master = await getAlbumDetails(discogsId, 'master')
if (master) return master

// 2. Fallback sur release si master indisponible
const release = await getAlbumDetails(discogsId, 'release')
return release
```

### Gestion des homonymes

```typescript
// Stocker l'ID artiste Discogs
const album = {
  discogsId: '123456',
  discogsArtistId: '789', // Identifie l'artiste unique
  artist: 'John Williams',
  title: 'Star Wars'
}

// Filtrer par artiste spécifique
const filterByArtist = (albums, artistId) => {
  return albums.filter(a => a.discogsArtistId === artistId)
}
```

### Recherche optimisée

```typescript
// Debounce pour éviter trop de requêtes
const debouncedSearch = useMemo(
  () => debounce((query: string) => {
    if (query.length < 3) return
    searchAlbums(query)
  }, 300),
  []
)

// Utilisation
<input 
  onChange={(e) => debouncedSearch(e.target.value)}
  placeholder="Rechercher un album..."
/>
```

## 💾 Cache Discogs

### Système de cache

- **TracklistCache** : Cache des tracklists (30 jours)
- **Réduit** les appels API
- **Améliore** les performances de 80-97%

**Voir** : [Performance](../technical/PERFORMANCE.md)

### Structure du cache

```typescript
model TracklistCache {
  id          String   @id @default(cuid())
  discogsId   String   @unique
  type        String   // 'master' ou 'release'
  tracklist   Json     // Données complètes
  createdAt   DateTime @default(now())
  expiresAt   DateTime // 30 jours après création
}
```

### Utilisation du cache

```typescript
// 1. Vérifier le cache
const cached = await prisma.tracklistCache.findUnique({
  where: { discogsId }
})

if (cached && cached.expiresAt > new Date()) {
  return cached.tracklist
}

// 2. Sinon, fetch et cache
const data = await fetchFromDiscogs(discogsId)
await prisma.tracklistCache.create({
  data: {
    discogsId,
    type,
    tracklist: data,
    expiresAt: addDays(new Date(), 30)
  }
})

return data
```

## 🎯 Cas d'usage avancés

### Recherche par label

```
Objectif : Trouver tous les albums Blue Note

Méthode :
1. Rechercher "Blue Note"
2. Filtrer les résultats par label
3. Ou chercher "Artist Blue Note"
```

### Recherche par année

```
Objectif : Albums de 1973

Méthode :
1. Rechercher "Artist 1973"
2. Discogs filtre par année
3. Résultats de cette année uniquement
```

### Recherche par format

```
Objectif : Trouver uniquement les vinyls

Méthode :
1. Rechercher l'album
2. Consulter les détails Discogs
3. Vérifier les formats disponibles
```

## 💡 Conseils et astuces

### Pour des recherches efficaces

✅ **Soyez spécifique**
- "Beatles Abbey Road" mieux que "Beatles"
- Ajoutez l'année si vous la connaissez

✅ **Orthographe correcte**
- Discogs est sensible à l'orthographe
- Essayez variations si pas de résultats

✅ **Homonymes**
- Ajoutez du contexte : "John Williams Star Wars"
- Vérifiez l'ID artiste Discogs

✅ **Masters prioritaires**
- RankList priorise les masters
- Plus de métadonnées que releases simples

### Pour les imports massifs

✅ **Utilisez l'import CSV**
- Plus rapide pour nombreux albums
- Format : "Artiste, Titre, Année"

✅ **Import JSON**
- Pour conserver toutes les métadonnées
- Exportez d'une liste, modifiez, réimportez

## 🐛 Dépannage

### Aucun résultat

**Causes possibles** :
- Orthographe incorrecte
- Album pas dans Discogs (rare)
- Problème de connexion API

**Solutions** :
1. Vérifier l'orthographe
2. Essayer variations
3. Chercher sur discogs.com directement
4. Ajouter manuellement avec ID Discogs

### Mauvais album retourné

**Cause** : Homonyme ou titre similaire

**Solution** :
1. Affiner la recherche avec plus de contexte
2. Vérifier l'année dans les résultats
3. Consulter les détails avant d'ajouter

### Pochette manquante

**Cause** : Pas d'image sur Discogs

**Solution** :
- Normal pour certains albums rares
- Fallback sur image placeholder
- Image peut être ajoutée sur Discogs

### Recherche lente

**Cause** : API Discogs rate limit

**Solution** :
- Rate limit : 60 requêtes/minute
- Attendre quelques secondes
- Utiliser debounce (déjà implémenté)

## 📚 Voir aussi

- [Gestion de listes](LISTS-MANAGEMENT.md) - Créer et organiser
- [Import d'albums](IMPORT-ALBUMS.md) - Import CSV/JSON
- [Performance](../technical/PERFORMANCE.md) - Cache et optimisations
- [API Discogs](../reference/DISCOGS-API.md) - Détails techniques

---

**API** : Discogs API v2  
**Cache** : 30 jours  
**Rate limit** : 60 req/min  
**Dernière mise à jour** : Janvier 2025
