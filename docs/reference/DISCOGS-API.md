# 🎵 API Discogs - Référence

## Vue d'ensemble

RankList utilise l'API Discogs pour accéder à une base de données de plus de 14 millions d'albums. Ce document détaille l'intégration, le cache et les bonnes pratiques.

**API** : Discogs API v2  
**Base de données** : 14M+ albums  
**Rate limit** : 60 requêtes/minute (authentifié)

## 🔑 Configuration

### Variables d'environnement

```bash
# .env.local
DISCOGS_TOKEN=your_discogs_personal_access_token
```

### Obtenir un token Discogs

1. Créer un compte sur [discogs.com](https://www.discogs.com)
2. Aller dans **Settings → Developers**
3. Cliquer sur **Generate new token**
4. Copier le token
5. Ajouter dans `.env.local`

**Note** : Token personnel = 60 req/min. OAuth = 60 req/min par utilisateur.

## 📡 Endpoints utilisés

### 1. Recherche d'albums

**Endpoint** : `GET /database/search`

```typescript
const searchAlbums = async (query: string) => {
  const url = new URL('https://api.discogs.com/database/search')
  url.searchParams.append('q', query)
  url.searchParams.append('type', 'master,release')
  url.searchParams.append('per_page', '20')
  
  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Discogs token=${process.env.DISCOGS_TOKEN}`,
      'User-Agent': 'RankList/1.0 +https://ranklist.app'
    }
  })
  
  return response.json()
}
```

**Paramètres** :
- `q` : Requête de recherche
- `type` : Types de résultats (`master`, `release`, `artist`, `label`)
- `per_page` : Nombre de résultats (max 100)
- `page` : Page de résultats

**Réponse** :
```json
{
  "results": [
    {
      "id": 123456,
      "type": "master",
      "title": "The Dark Side of the Moon",
      "year": "1973",
      "thumb": "https://...",
      "cover_image": "https://...",
      "resource_url": "https://api.discogs.com/masters/123456"
    }
  ],
  "pagination": {
    "items": 1000,
    "page": 1,
    "pages": 50,
    "per_page": 20
  }
}
```

### 2. Détails Master

**Endpoint** : `GET /masters/{id}`

```typescript
const getMasterDetails = async (masterId: string) => {
  const response = await fetch(
    `https://api.discogs.com/masters/${masterId}`,
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

**Réponse** :
```json
{
  "id": 123456,
  "title": "The Dark Side of the Moon",
  "year": 1973,
  "artists": [{
    "id": 45,
    "name": "Pink Floyd"
  }],
  "genres": ["Rock"],
  "styles": ["Prog Rock", "Psychedelic Rock"],
  "tracklist": [
    {
      "position": "1",
      "title": "Speak To Me",
      "duration": "1:13"
    }
  ],
  "images": [{
    "type": "primary",
    "uri": "https://...",
    "width": 600,
    "height": 600
  }]
}
```

### 3. Détails Release

**Endpoint** : `GET /releases/{id}`

```typescript
const getReleaseDetails = async (releaseId: string) => {
  const response = await fetch(
    `https://api.discogs.com/releases/${releaseId}`,
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

**Réponse** : Similaire au master avec infos supplémentaires :
```json
{
  "id": 789,
  "master_id": 123456,
  "title": "The Dark Side of the Moon",
  "labels": [{
    "name": "Harvest",
    "catno": "SHVL 804"
  }],
  "formats": [{
    "name": "Vinyl",
    "qty": "1",
    "descriptions": ["LP", "Album"]
  }],
  "country": "UK",
  "released": "1973-03-01"
}
```

## 💾 Système de cache

### Architecture

```prisma
model TracklistCache {
  id          String   @id @default(cuid())
  discogsId   String   @unique
  type        String   // 'master' ou 'release'
  tracklist   Json     // Données complètes
  createdAt   DateTime @default(now())
  expiresAt   DateTime // 30 jours après création
}
```

### Implémentation

**Fichier** : [lib/discogs-cache.ts](../../lib/discogs-cache.ts)

```typescript
export const getCachedTracklist = async (
  discogsId: string,
  type: 'master' | 'release'
) => {
  // 1. Vérifier le cache
  const cached = await prisma.tracklistCache.findUnique({
    where: { discogsId }
  })
  
  // 2. Si cache valide, retourner
  if (cached && cached.expiresAt > new Date()) {
    return cached.tracklist
  }
  
  // 3. Sinon, fetch depuis Discogs
  const data = await fetchFromDiscogs(discogsId, type)
  
  // 4. Sauvegarder dans le cache
  await prisma.tracklistCache.upsert({
    where: { discogsId },
    create: {
      discogsId,
      type,
      tracklist: data,
      expiresAt: addDays(new Date(), 30)
    },
    update: {
      tracklist: data,
      expiresAt: addDays(new Date(), 30)
    }
  })
  
  return data
}
```

### Performance

**Sans cache** :
- 1 album = 1 requête API
- 50 albums = 50 requêtes = ~50 secondes (rate limit)

**Avec cache** :
- 1 album = 0 requête (si en cache)
- 50 albums = 0-10 requêtes = 0-10 secondes
- **Amélioration : 80-97%**

**Voir** : [Performance](../technical/PERFORMANCE.md)

## 🔄 Gestion des homonymes

### Problème

Plusieurs artistes peuvent avoir le même nom :
- John Williams (compositeur de films)
- John Williams (guitariste classique)
- John Williams (chanteur country)

### Solution

**Stocker l'ID artiste Discogs** :

```prisma
model Album {
  id              String  @id @default(cuid())
  discogsId       String
  discogsArtistId String? // ID unique de l'artiste
  artist          String
  title           String
  year            Int?
}
```

**Utilisation** :
```typescript
// Lors de la recherche
const results = await searchAlbums('John Williams')

// Afficher avec distinction
results.map(result => ({
  ...result,
  displayName: `${result.artist} (Discogs ID: ${result.artistId})`
}))

// Filtrer par artiste spécifique
const filtered = results.filter(r => r.artistId === '123')
```

## 🎯 Bonnes pratiques

### 1. Respect du rate limit

```typescript
// Implémenter un rate limiter
import pLimit from 'p-limit'

const limit = pLimit(5) // Max 5 requêtes simultanées

const fetchMultipleAlbums = async (ids: string[]) => {
  return Promise.all(
    ids.map(id => limit(() => fetchAlbum(id)))
  )
}
```

### 2. Gestion des erreurs

```typescript
const fetchWithRetry = async (url: string, retries = 3) => {
  try {
    const response = await fetch(url, { headers })
    
    if (response.status === 429) {
      // Rate limit atteint
      await sleep(60000) // Attendre 1 minute
      return fetchWithRetry(url, retries - 1)
    }
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    return response.json()
  } catch (error) {
    if (retries > 0) {
      await sleep(5000)
      return fetchWithRetry(url, retries - 1)
    }
    throw error
  }
}
```

### 3. User-Agent requis

**Important** : Discogs requiert un User-Agent descriptif

```typescript
headers: {
  'User-Agent': 'RankList/1.0 +https://ranklist.app'
}
```

Format recommandé : `AppName/Version +URL`

### 4. Prioriser les masters

**Masters** > **Releases**
- Masters = version canonique
- Plus de métadonnées
- Tracklist complète

```typescript
const getAlbum = async (discogsId: string, type: string) => {
  // Toujours essayer master d'abord
  if (type === 'release') {
    try {
      const release = await getReleaseDetails(discogsId)
      if (release.master_id) {
        return getMasterDetails(release.master_id.toString())
      }
    } catch (error) {
      // Fallback sur release
    }
  }
  
  return type === 'master' 
    ? getMasterDetails(discogsId)
    : getReleaseDetails(discogsId)
}
```

### 5. Déduplication

```typescript
// Dédupliquer par artiste + titre
const dedupe = (albums: Album[]) => {
  const seen = new Map()
  
  return albums.filter(album => {
    const key = `${album.artist.toLowerCase()}-${album.title.toLowerCase()}`
    
    if (seen.has(key)) {
      // Garder master plutôt que release
      const existing = seen.get(key)
      if (album.type === 'master' && existing.type === 'release') {
        seen.set(key, album)
        return true
      }
      return false
    }
    
    seen.set(key, album)
    return true
  })
}
```

## 📊 Monitoring

### Logs des requêtes

```typescript
const fetchDiscogs = async (url: string) => {
  console.log(`[Discogs] GET ${url}`)
  const start = Date.now()
  
  const response = await fetch(url, { headers })
  
  const duration = Date.now() - start
  console.log(`[Discogs] ${response.status} in ${duration}ms`)
  
  return response.json()
}
```

### Métriques à surveiller

- **Nombre de requêtes/minute** : < 60
- **Cache hit rate** : > 80%
- **Temps de réponse moyen** : < 500ms
- **Erreurs 429** : 0

### Dashboard simple

```typescript
let requestCount = 0
let cacheHits = 0
let cacheMisses = 0

setInterval(() => {
  console.log(`
    Requests: ${requestCount}
    Cache hits: ${cacheHits}
    Cache misses: ${cacheMisses}
    Hit rate: ${(cacheHits / (cacheHits + cacheMisses) * 100).toFixed(2)}%
  `)
  requestCount = 0
}, 60000) // Toutes les minutes
```

## 🐛 Dépannage

### Erreur 401 Unauthorized

**Cause** : Token invalide ou manquant

**Solution** :
```bash
# Vérifier .env.local
DISCOGS_TOKEN=your_token_here

# Régénérer token sur Discogs
# Settings → Developers → Generate new token
```

### Erreur 429 Too Many Requests

**Cause** : Rate limit dépassé (> 60 req/min)

**Solution** :
```typescript
// Implémenter rate limiting
// Utiliser le cache
// Paralléliser avec limite (p-limit)
```

### Images CORS bloquées

**Cause** : Discogs images avec CORS strict

**Solution** :
```typescript
// Option 1: Proxy interne
<img src={`/api/proxy-image?url=${encodeURIComponent(imageUrl)}`} />

// Option 2: crossOrigin attribute
<img crossOrigin="anonymous" src={imageUrl} />
```

### Résultats incomplets

**Cause** : Release au lieu de master

**Solution** :
```typescript
// Toujours récupérer le master_id
if (release.master_id) {
  return getMasterDetails(release.master_id)
}
```

## 🔮 Évolutions futures

### Améliorations planifiées

- [ ] OAuth pour requêtes par utilisateur
- [ ] Cache images localement
- [ ] Sync périodique des métadonnées
- [ ] Fallback sur autres APIs (MusicBrainz)
- [ ] Cache Redis pour haute performance

### Considérations

**OAuth vs Personal Token** :
- OAuth = 60 req/min par utilisateur
- Token personnel = 60 req/min total
- Pour > 1000 utilisateurs actifs : passer OAuth

**Cache distribué** :
- PostgreSQL OK pour < 10k utilisateurs
- Redis recommandé pour > 10k

## 📚 Ressources

- **Documentation officielle** : [discogs.com/developers](https://www.discogs.com/developers)
- **Limites API** : [Rate limiting](https://www.discogs.com/developers#page:home,header:home-rate-limiting)
- **Forum développeurs** : [discogs.com/forum](https://www.discogs.com/forum)

---

**API Version** : Discogs API v2  
**Rate limit** : 60 req/min (authentifié)  
**Cache TTL** : 30 jours  
**Dernière mise à jour** : Janvier 2025
