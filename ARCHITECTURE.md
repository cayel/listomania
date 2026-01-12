# Architecture de Ranklist

## Vue d'ensemble

Ranklist est une application web full-stack construite avec Next.js 16, utilisant le App Router et TypeScript pour la type-safety.

## Schéma de base de données

### Modèles Prisma

```prisma
User
├── id: String (cuid)
├── name: String (unique)
├── email: String (unique)
├── password: String (hashed)
├── lists: List[]
└── timestamps

List
├── id: String (cuid)
├── title: String
├── description?: String
├── period?: String
├── sourceUrl?: String
├── shareToken?: String (unique)
├── isPublic: Boolean
├── userId: String → User
├── listAlbums: ListAlbum[]
└── timestamps

Album
├── id: String (cuid)
├── discogsId: String (unique)
├── discogsArtistId?: String
├── artist: String
├── title: String
├── year?: Int
├── coverImage?: String
├── listAlbums: ListAlbum[]
└── createdAt

ListAlbum (table de liaison)
├── id: String (cuid)
├── listId: String → List
├── albumId: String → Album
├── position: Int
└── createdAt
```

### Relations

- `User` → `List` : One-to-Many (un utilisateur peut avoir plusieurs listes)
- `List` → `ListAlbum` → `Album` : Many-to-Many (avec position)
- Les albums sont partagés entre les listes (évite duplication)

## Architecture des routes

### Pages (Client Components)

```
/ (Home)
├── /auth
│   ├── /signin
│   └── /signup
├── /lists
│   ├── /new
│   └── /[id]
│       ├── (view)
│       ├── /edit
│       └── /share?token=xxx
├── /explore
└── /profile
```

### API Routes (Server)

```
/api
├── /auth
│   ├── /register (POST)
│   └── /[...nextauth] (NextAuth)
├── /lists
│   ├── / (GET, POST)
│   ├── /import-full (POST) - Import liste complète JSON
│   └── /[id]
│       ├── / (GET, PATCH, DELETE)
│       ├── /albums (POST)
│       │   └── /[albumId] (DELETE)
│       ├── /export (GET) - Export CSV albums
│       ├── /export-full (GET) - Export JSON complet
│       ├── /import (POST) - Import CSV albums
│       ├── /reorder (PATCH)
│       └── /generate-share-token (POST)
├── /search?q=xxx (GET)
├── /public/lists (GET)
└── /user/profile (GET, PATCH)
```

## Flow d'authentification

1. **Inscription** : `/auth/signup`
   - Hash du mot de passe (bcrypt)
   - Création User dans DB
   - Auto-login via NextAuth

2. **Connexion** : `/auth/signin`
   - Credentials provider NextAuth
   - Session JWT
   - Vérification password

3. **Protection** : `proxy.ts`
   - Vérifie session pour routes protégées
   - Redirect vers `/auth/signin` si non authentifié

## Flow de partage avec token

1. Utilisateur clique "Partager" sur une liste
2. `POST /api/lists/[id]/generate-share-token`
   - Génère token unique (32 chars hex)
   - Stocke dans `List.shareToken`
   - Retourne le token
3. URL générée : `/lists/[id]/share?token=xxx`
4. Accès à la liste :
   - `GET /api/lists/[id]?token=xxx`
   - Vérifie : isPublic OU isOwner OU validToken
   - Retourne liste si autorisé

## Système d'import/export

### Export

**CSV (Albums uniquement)**
- Route : `GET /api/lists/[id]/export`
- Format : `Rank,Artist,Title,Year,DiscogsId`
- Usage : Sauvegarde simple des albums

**JSON (Liste complète)**
- Route : `GET /api/lists/[id]/export-full`
- Format : JSON avec structure :
  ```json
  {
    "version": "1.0",
    "list": {
      "title": "...",
      "description": "...",
      "period": "...",
      "sourceUrl": "...",
      "isPublic": true/false,
      "exportDate": "...",
      "albumCount": 42
    },
    "albums": [
      {
        "rank": 1,
        "artist": "...",
        "title": "...",
        "year": 2020,
        "discogsId": "...",
        "discogsArtistId": "...",
        "coverImage": "..."
      }
    ]
  }
  ```
- Usage : Backup complet avec métadonnées

### Import

**CSV (Ajouter albums)**
- Route : `POST /api/lists/[id]/import`
- Ajoute des albums à une liste existante
- Détection automatique du séparateur (`,` ou `;`)
- Recherche Discogs si pas d'ID fourni

**JSON (Créer liste)**
- Route : `POST /api/lists/import-full`
- Crée une nouvelle liste complète
- Réutilise albums existants (pas de doublons)
- Tente de rafraîchir depuis Discogs
- Retourne l'ID de la nouvelle liste

## Intégration Discogs

### API Endpoints utilisés

- `GET /database/search` : Recherche d'albums
- `GET /masters/{id}` : Détails d'un album master
- `GET /releases/{id}` : Détails d'une release spécifique

### Gestion des homonymes

Les artistes avec le même nom (ex: Mike Davis (1), Mike Davis (2)) sont différenciés via `discogsArtistId`. Le nom affiché est nettoyé (sans le suffixe numérique).

### Rate limiting

Discogs limite à 60 requêtes/minute. L'app gère les erreurs 429 gracieusement.

## State Management

- **Authentification** : NextAuth session (server + client)
- **Theme** : Context Provider + localStorage
- **Forms** : React state local
- **Lists** : Fetch on mount, optimistic updates

## Sécurité

### Backend
- Validation Zod sur toutes les API routes
- Session-based auth avec NextAuth
- CSRF protection (NextAuth built-in)
- Password hashing (bcrypt)
- SQL injection protection (Prisma)

### Frontend
- XSS protection (React auto-escape)
- No inline scripts
- Secure token sharing (pas d'exposition publique)

## Performance

### Optimisations
- Image optimization (Next.js Image)
- Route prefetching (Next.js Link)
- Database indexes (userId, discogsId, position)
- Debounced search (300ms)

### Caching
- Prisma query caching
- Static generation pour pages publiques (à implémenter)

## Déploiement

### Variables d'environnement requises

```env
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=xxx
DISCOGS_TOKEN=xxx
```

### Build

```bash
npm run build
# Génère .next/ avec pages optimisées
```

### Checklist pré-déploiement
- [ ] Migrations Prisma appliquées
- [ ] Variables d'environnement configurées
- [ ] NEXTAUTH_URL mis à jour
- [ ] NEXTAUTH_SECRET généré (production)
- [ ] Connexion DB testée
- [ ] Token Discogs valide

## Tests (à implémenter)

### Tests suggérés
- Unit tests : fonctions utils
- Integration tests : API routes
- E2E tests : flows critiques (auth, création liste)

### Tools recommandés
- Jest + React Testing Library
- Playwright (E2E)
- MSW (mock API)

## Changements récents (Janvier 2026)

- ✅ Migration `middleware.ts` → `proxy.ts` (Next.js 16)
- ✅ Export/Import JSON complet (avec métadonnées)
- ✅ Partage sécurisé par token
- ✅ Gestion homonymes artistes (discogsArtistId)
- ✅ Refactoring structure (types/, lib/utils/, constants)

## Évolutions possibles

### Court terme
- [ ] Pagination listes (explore)
- [ ] Recherche de listes
- [ ] Filtres par période

### Moyen terme
- [ ] Statistiques utilisateur
- [ ] Likes sur listes publiques
- [ ] Commentaires
- [ ] Tags personnalisés

### Long terme
- [ ] Recommandations basées IA
- [ ] Collaboration sur listes
- [ ] Export PDF/Image
- [ ] Mobile app (React Native)
