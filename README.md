# Ranklist - Gestion de listes d'albums musicaux

Application web moderne pour créer, organiser et partager vos classements d'albums musicaux avec intégration Discogs.

## ✨ Fonctionnalités

- 🔐 Authentification sécurisée (inscription/connexion)
- 📝 Création de listes d'albums personnalisées
- 🔍 Recherche d'albums via l'API Discogs (+ de 14M d'albums)
- 🎯 Gestion des homonymes d'artistes (via ID Discogs)
- ↕️ Réorganisation par glisser-déposer
- 🌍 Listes publiques et privées
- 🔗 Partage sécurisé par token (même pour listes privées)
- 📅 Classification par période (année, décennie, custom)
- 🎨 Thèmes clair et sombre
- 📱 Interface responsive
- 📥 Import/Export CSV (albums uniquement)
- 📦 Import/Export JSON (liste complète avec métadonnées)
- 🔖 URL de source pour listes importées

## 🛠️ Stack Technique

- **Framework**: Next.js 16.1.1 (App Router + Turbopack)
- **Langage**: TypeScript
- **Base de données**: PostgreSQL avec Prisma ORM
- **Authentification**: NextAuth.js v4
- **UI**: Tailwind CSS v3
- **Drag & Drop**: @dnd-kit
- **API externe**: Discogs API
- **Validation**: Zod

## 📋 Prérequis

- Node.js 18+ 
- PostgreSQL 14+
- Token API Discogs ([obtenir un token](https://www.discogs.com/settings/developers))

## 🚀 Installation

1. **Installer les dépendances**
```bash
npm install
```

2. **Configurer les variables d'environnement**

Copier le fichier `.env.example` en `.env` :
```bash
cp .env.example .env
```

Puis éditer `.env` avec vos valeurs :

```env
# Database - URL de connexion PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/ranklist"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="générez-avec: openssl rand -base64 32"

# Discogs API
# Obtenir un token sur: https://www.discogs.com/settings/developers
DISCOGS_TOKEN="votre-token-discogs"
```

3. **Créer la base de données**

```bash
# Créer les tables
npx prisma migrate dev --name init

# Générer le client Prisma
npx prisma generate
```

4. **Lancer l'application**

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## Configuration de la base de données PostgreSQL

### Option 1: Installation locale

**macOS (avec Homebrew):**
```bash
brew install postgresql
brew services start postgresql
createdb ranklist
```

**Linux:**
```bash
sudo apt-get install postgresql
sudo systemctl start postgresql
sudo -u postgres createdb ranklist
```

### Option 2: Utiliser Docker

```bash
docker run --name ranklist-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=ranklist \
  -p 5432:5432 \
  -d postgres:15
```

### Option 3: Service cloud

Vous pouvez aussi utiliser un service comme:
- [Supabase](https://supabase.com/) (gratuit)
- [Neon](https://neon.tech/) (gratuit)
- [Railway](https://railway.app/)

## Obtenir un token Discogs

1. Créer un compte sur [Discogs](https://www.discogs.com/)
2. Aller sur [Settings > Developers](https://www.discogs.com/settings/developers)
3. Cliquer sur "Generate new token"
4. Copier le token dans votre fichier `.env`

## Scripts disponibles

```bash
# Développement
npm run dev

# Build production
npm run build
npm start

# Prisma
npx prisma studio        # Interface graphique pour la BDD
npx prisma migrate dev   # Créer une nouvelle migration
npx prisma generate      # Régénérer le client Prisma
```

## 📁 Structure du projet

```
ranklist/
├── app/                        # Pages et routes Next.js (App Router)
│   ├── api/                   # API Routes
│   │   ├── auth/              # Authentification (register, [...nextauth])
│   │   ├── lists/             # CRUD listes + albums
│   │   │   ├── import-full/   # Import liste complète (JSON)
│   │   │   └── [id]/          # Routes dynamiques
│   │   │       ├── albums/    # Gestion albums
│   │   │       ├── export/    # Export CSV
│   │   │       ├── export-full/ # Export JSON complet
│   │   │       ├── import/    # Import CSV
│   │   │       ├── reorder/   # Réorganisation
│   │   │       └── generate-share-token/ # Génération token
│   │   ├── search/            # Recherche Discogs
│   │   ├── public/            # Listes publiques
│   │   └── user/              # Profil utilisateur
│   ├── auth/                  # Pages signin/signup
│   ├── lists/                 # Pages gestion listes
│   │   ├── [id]/              # Détail + édition
│   │   │   └── share/         # Vue publique partagée
│   │   └── new/               # Création
│   ├── explore/               # Exploration listes publiques
│   ├── profile/               # Profil utilisateur
│   ├── layout.tsx             # Layout racine
│   ├── page.tsx               # Page d'accueil
│   └── globals.css            # Styles globaux
├── components/                # Composants React réutilisables
│   ├── navbar.tsx             # Navigation principale
│   ├── theme-toggle.tsx       # Bouton thème clair/sombre
│   ├── album-search.tsx       # Recherche d'albums
│   ├── album-grid-item.tsx    # Affichage album (grille)
│   ├── sortable-album-item.tsx # Album draggable
│   ├── period-selector.tsx    # Sélecteur de période
│   └── providers.tsx          # Context providers (NextAuth, Theme)
├── lib/                       # Bibliothèques et utilitaires
│   ├── auth.ts                # Config NextAuth
│   ├── discogs.ts             # Service API Discogs
│   ├── prisma.ts              # Client Prisma singleton
│   ├── periods.ts             # Constantes périodes
│   ├── constants.ts           # Constantes app
│   └── utils/                 # Fonctions utilitaires
│       └── helpers.ts         # Helpers divers
├── prisma/
│   ├── schema.prisma          # Schéma BDD (User, List, Album, ListAlbum)
│   └── migrations/            # Historique migrations
├── types/
│   ├── index.ts               # Types partagés
│   └── next-auth.d.ts         # Extension types NextAuth
├── public/                    # Assets statiques
├── .env                       # Variables d'environnement
├── .env.example               # Template variables
├── proxy.ts                   # Proxy Next.js (auth & routing)
├── next.config.ts             # Config Next.js
├── tailwind.config.ts         # Config Tailwind
├── tsconfig.json              # Config TypeScript
└── package.json               # Dépendances
```

## 🎯 Utilisation

### Créer un compte
1. Cliquer sur "S'inscrire"
2. Choisir nom d'utilisateur, email et mot de passe
3. Connexion automatique après inscription

### Créer une liste
1. Cliquer sur "Nouvelle Liste"
2. Remplir : titre, description (optionnelle), période
3. Choisir visibilité (publique/privée)
4. Option: ajouter une URL source

### Ajouter des albums
1. Ouvrir une liste
2. Utiliser la recherche (Discogs API, 14M+ albums)
3. Cliquer sur un album pour l'ajouter
4. Gérer les homonymes d'artistes automatiquement

### Réorganiser
- Glisser-déposer les albums dans l'ordre souhaité
- Sauvegarde automatique de la position

### Partager
1. Cliquer sur "Partager" dans une liste
2. Un token unique est généré automatiquement
3. Copier le lien (fonctionne même si liste privée)
4. Partager avec qui vous voulez

### Import/Export

**Export :**
- **Albums uniquement (CSV)** : Format simple `Rank,Artist,Title,Year,DiscogsId`
- **Liste complète (JSON)** : Inclut titre, description, période, sourceUrl + albums complets

**Import :**
- **CSV** : Ajouter des albums à une liste existante
- **JSON** : Créer une nouvelle liste complète (métadonnées + albums)

## 🚀 Déploiement

### Vercel (recommandé)

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel
```

Ou connecter directement votre repo GitHub à Vercel.

**Variables d'environnement à configurer** :
- `DATABASE_URL`
- `NEXTAUTH_URL` 
- `NEXTAUTH_SECRET`
- `DISCOGS_TOKEN`

### Autres plateformes compatibles
- Railway
- Render  
- Netlify
- Fly.io

## 🤝 Contribution

Les contributions sont bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📝 Licence

MIT

---

Développé avec ❤️ par [Christophe Ayel]

