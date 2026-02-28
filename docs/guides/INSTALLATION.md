# 🚀 Guide d'installation

## Prérequis

- **Node.js** : Version 18.x ou supérieure
- **PostgreSQL** : Version 14 ou supérieure
- **npm** ou **yarn** : Gestionnaire de paquets
- **Git** : Pour cloner le repository

## 📦 Installation locale

### 1. Cloner le repository

```bash
git clone https://github.com/votre-user/ranklist.git
cd ranklist
```

### 2. Installer les dépendances

```bash
npm install
# ou
yarn install
```

### 3. Configurer la base de données

**Créer une base PostgreSQL** :

```sql
CREATE DATABASE ranklist;
CREATE USER ranklist_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ranklist TO ranklist_user;
```

### 4. Configurer les variables d'environnement

Créer un fichier `.env.local` à la racine :

```bash
# Base de données
DATABASE_URL="postgresql://ranklist_user:your_password@localhost:5432/ranklist"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_secret_key_here" # Générer avec : openssl rand -base64 32

# Discogs API
DISCOGS_TOKEN="your_discogs_token" # Obtenir sur discogs.com/settings/developers

# Email (optionnel pour notifications)
EMAIL_SERVER="smtp://user:pass@smtp.example.com:587"
EMAIL_FROM="noreply@ranklist.app"
```

### 5. Initialiser la base de données

```bash
# Générer le client Prisma
npx prisma generate

# Exécuter les migrations
npx prisma migrate deploy

# Optionnel : Seed avec données de test
npx prisma db seed
```

### 6. Lancer l'application

**Mode développement** :
```bash
npm run dev
# ou
yarn dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000)

**Mode production** :
```bash
npm run build
npm run start
```

## 🐳 Installation avec Docker

### 1. Créer le fichier docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: ranklist
      POSTGRES_USER: ranklist_user
      POSTGRES_PASSWORD: your_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://ranklist_user:your_password@postgres:5432/ranklist
      NEXTAUTH_URL: http://localhost:3000
      NEXTAUTH_SECRET: your_secret_key
      DISCOGS_TOKEN: your_token
    depends_on:
      - postgres

volumes:
  postgres_data:
```

### 2. Créer le Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### 3. Lancer avec Docker Compose

```bash
docker-compose up -d
```

## ☁️ Déploiement en production

### Vercel (recommandé)

1. **Push sur GitHub**
2. **Importer sur Vercel** : [vercel.com/import](https://vercel.com/import)
3. **Configurer les variables d'environnement**
4. **Déployer automatiquement**

**Configuration Vercel** :
```json
{
  "buildCommand": "prisma generate && next build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

### Heroku

```bash
# Installer Heroku CLI
# Puis :
heroku create ranklist-app
heroku addons:create heroku-postgresql:hobby-dev
heroku config:set NEXTAUTH_SECRET=$(openssl rand -base64 32)
heroku config:set DISCOGS_TOKEN=your_token
git push heroku main
heroku run npx prisma migrate deploy
```

### Railway

1. Connecter votre repository GitHub
2. Ajouter un service PostgreSQL
3. Configurer les variables d'environnement
4. Déploiement automatique à chaque push

### DigitalOcean App Platform

1. Créer une nouvelle app
2. Connecter GitHub
3. Ajouter une base PostgreSQL
4. Configurer les variables
5. Déployer

## 🔧 Configuration avancée

### Optimiser les performances

**next.config.ts** :
```typescript
const config = {
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react']
  },
  images: {
    domains: ['i.discogs.com'],
    formats: ['image/avif', 'image/webp']
  }
}
```

### Configurer le cache Redis (optionnel)

Pour > 10k utilisateurs actifs :

```bash
# Installer Redis
npm install redis

# .env.local
REDIS_URL="redis://localhost:6379"
```

**lib/redis.ts** :
```typescript
import { createClient } from 'redis'

export const redis = createClient({
  url: process.env.REDIS_URL
})

redis.connect()
```

### Monitoring

**Sentry pour erreurs** :
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

**Vercel Analytics** :
```bash
npm install @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

## 🐛 Dépannage

### Erreur connexion PostgreSQL

**Symptôme** : `Connection refused`

**Solution** :
```bash
# Vérifier que PostgreSQL est lancé
sudo service postgresql status

# Lancer si nécessaire
sudo service postgresql start
```

### Erreur Prisma Client

**Symptôme** : `@prisma/client did not initialize yet`

**Solution** :
```bash
npx prisma generate
npm run dev
```

### Port 3000 déjà utilisé

**Solution** :
```bash
# Trouver le processus
lsof -i :3000

# Tuer le processus
kill -9 [PID]

# Ou utiliser un autre port
PORT=3001 npm run dev
```

### Images Discogs ne chargent pas

**Cause** : CORS ou proxy manquant

**Solution** : Vérifier [proxy.ts](../../proxy.ts) et configuration next.config.ts

## 📚 Ressources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Discogs API](https://www.discogs.com/developers)

## 🆘 Support

- 🐛 **Bugs** : [GitHub Issues](https://github.com/votre-user/ranklist/issues)
- 💬 **Discussions** : [GitHub Discussions](https://github.com/votre-user/ranklist/discussions)
- 📖 **Documentation** : [docs/README.md](../README.md)

---

**Prochaine étape** : [Guide de démarrage rapide](QUICK-START.md)
