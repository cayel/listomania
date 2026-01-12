# 🎵 RankList - Guide de démarrage rapide

## ✅ Application créée avec succès !

Votre application de gestion de listes d'albums est maintenant prête. Voici les étapes pour la lancer :

## 📋 Étapes suivantes

### 1. Configurer la base de données PostgreSQL

Choisissez une des options suivantes :

**Option A - PostgreSQL local (macOS avec Homebrew):**
```bash
brew install postgresql
brew services start postgresql
createdb ranklist
```

**Option B - Docker (recommandé pour démarrer rapidement):**
```bash
docker run --name ranklist-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_USER=ranklist \
  -e POSTGRES_DB=ranklist \
  -p 5432:5432 \
  -d postgres:15
```

**Option C - Service cloud gratuit:**
- [Supabase](https://supabase.com/) - Créez un projet et récupérez l'URL de connexion
- [Neon](https://neon.tech/) - Base PostgreSQL serverless gratuite

### 2. Configurer les variables d'environnement

Éditez le fichier `.env` :

```bash
# Database - Modifiez selon votre configuration
DATABASE_URL="postgresql://ranklist:password@localhost:5432/ranklist"

# NextAuth - URL de l'application
NEXTAUTH_URL="http://localhost:3000"

# NextAuth Secret - Utilisez celui généré ci-dessous
NEXTAUTH_SECRET="UvY5/bcYIc9cKspi3wHu/enF4iXU0Mnp9NMWvZP06is="

# Discogs Token - Obtenez-le sur https://www.discogs.com/settings/developers
DISCOGS_TOKEN="votre-token-ici"
```

### 3. Obtenir un token Discogs

1. Créez un compte sur [Discogs.com](https://www.discogs.com/fr/)
2. Allez sur [Settings > Developers](https://www.discogs.com/settings/developers)
3. Cliquez sur "Generate new token"
4. Copiez le token dans votre fichier `.env`

### 4. Initialiser la base de données

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Lancer l'application

```bash
npm run dev
```

Ouvrez votre navigateur sur [http://localhost:3000](http://localhost:3000)

## 🎯 Fonctionnalités de l'application

- ✅ **Authentification** - Inscription et connexion sécurisées
- ✅ **Création de listes** - Créez des listes d'albums avec titre, description et période
- ✅ **Recherche Discogs** - Recherchez des albums dans la base Discogs
- ✅ **Drag & Drop** - Réorganisez vos albums par glisser-déposer
- ✅ **Listes publiques/privées** - Partagez vos listes ou gardez-les privées
- ✅ **Thèmes clair/sombre** - Interface moderne avec basculement de thème
- ✅ **Responsive** - Fonctionne sur desktop, tablette et mobile

## 📁 Structure du projet

```
ranklist/
├── app/
│   ├── api/              # API Routes (auth, lists, search)
│   ├── auth/             # Pages d'authentification
│   ├── lists/            # Pages de gestion des listes
│   └── page.tsx          # Page d'accueil
├── components/           # Composants React réutilisables
├── lib/                  # Services (Prisma, Auth, Discogs)
├── prisma/
│   └── schema.prisma     # Schéma de base de données
└── .env                  # Variables d'environnement
```

## 🛠️ Commandes utiles

```bash
# Développement
npm run dev

# Build de production
npm run build
npm start

# Gestion de la base de données
npx prisma studio         # Interface graphique
npx prisma migrate dev    # Créer une migration
npx prisma generate       # Générer le client

# Voir les logs en temps réel
npm run dev -- --turbopack
```

## 🔍 Dépannage

### La base de données ne se connecte pas
- Vérifiez que PostgreSQL est bien démarré
- Vérifiez l'URL dans DATABASE_URL
- Testez la connexion : `psql $DATABASE_URL`

### Erreur "NEXTAUTH_SECRET is not set"
- Assurez-vous que le fichier `.env` existe et contient NEXTAUTH_SECRET
- Redémarrez le serveur après modification du `.env`

### Les recherches Discogs ne fonctionnent pas
- Vérifiez que DISCOGS_TOKEN est correctement configuré
- Testez le token : `curl "https://api.discogs.com/database/search?q=nirvana&token=VOTRE_TOKEN"`

## 📚 Documentation

- [Next.js](https://nextjs.org/docs)
- [Prisma](https://www.prisma.io/docs)
- [NextAuth.js](https://next-auth.js.org)
- [Discogs API](https://www.discogs.com/developers)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🚀 Prochaines étapes

Une fois l'application lancée :

1. Créez un compte utilisateur
2. Créez votre première liste
3. Recherchez et ajoutez des albums
4. Réorganisez-les par glisser-déposer
5. Partagez vos listes publiques !

## 💡 Conseils

- Utilisez des périodes cohérentes (ex: "1990-1999", "Années 80")
- Ajoutez des descriptions détaillées pour vos listes
- Explorez les listes publiques des autres utilisateurs
- N'oubliez pas de rendre vos meilleures listes publiques !

---

**Bon classement ! 🎵**
