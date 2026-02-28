# 🔗 Partage de listes

## Vue d'ensemble

Le système de partage permet de rendre vos listes accessibles à d'autres utilisateurs, même si elles sont privées. Deux modes de partage : public (accessible à tous) et par token (accès sécurisé par lien unique).

**Version** : Depuis 1.0.0

## ✨ Fonctionnalités

### 🌍 Listes publiques

- Visibles par tous sur la page Explorer
- Indexables par moteurs de recherche
- Consultables sans authentification
- Modifiables uniquement par le propriétaire

### 🔒 Partage par token

- Lien unique et sécurisé
- Fonctionne même pour listes privées
- Pas besoin de compte pour consulter
- Révocable à tout moment
- Génération automatique de token

## 📖 Guide d'utilisation

### Rendre une liste publique

```
1. Ouvrir votre liste
2. Cliquer sur "Paramètres" ou "..."
3. Activer "Liste publique"
4. Sauvegarder

Résultat : Liste visible sur /explore
```

### Générer un lien de partage

```
1. Ouvrir votre liste (publique ou privée)
2. Cliquer sur "Partager"
3. Cliquer sur "Générer un lien"
4. Un token unique est créé
5. Copier le lien généré

Format : https://ranklist.app/shared/[token]
```

### Partager le lien

**Moyens de partage** :
- 📧 Email
- 💬 Messagerie (WhatsApp, Telegram, etc.)
- 🔗 Réseaux sociaux (Twitter, Facebook, etc.)
- 📋 Copier-coller dans forums, blogs

**Le destinataire** :
1. Clique sur le lien
2. Voit la liste complète
3. Peut consulter mais pas modifier
4. Peut voir les pochettes et détails

### Révoquer un lien de partage

```
1. Ouvrir votre liste
2. Cliquer sur "Partager"
3. Cliquer sur "Révoquer le lien"
4. Le token est supprimé

Résultat : Ancien lien ne fonctionne plus
```

### Régénérer un nouveau lien

```
1. Après révocation
2. Cliquer à nouveau sur "Générer un lien"
3. Nouveau token créé
4. Partager le nouveau lien

Note : L'ancien lien ne fonctionnera plus
```

## 🎯 Cas d'usage

### Scénario 1 : Partager avec des amis

```
Objectif : Montrer ma playlist à des amis

Actions :
1. Générer un lien de partage
2. Envoyer sur WhatsApp
3. Les amis consultent sans compte

Avantage : Pas besoin qu'ils créent un compte
```

### Scénario 2 : Blog musical

```
Objectif : Intégrer mes listes dans un article

Actions :
1. Rendre la liste publique
2. Ou générer un lien de partage
3. Ajouter le lien dans l'article

Résultat : Lecteurs voient la liste complète
```

### Scénario 3 : Liste privée temporaire

```
Objectif : Partager une liste privée temporairement

Actions :
1. Garder la liste privée
2. Générer un lien de partage
3. Partager le lien
4. Révoquer après consultation

Résultat : Contrôle total sur l'accès
```

### Scénario 4 : Portfolio musical

```
Objectif : Montrer mes goûts à un recruteur

Actions :
1. Créer une liste "Mes favoris"
2. Rendre publique
3. Ajouter l'URL sur CV/LinkedIn

Résultat : Portfolio musical professionnel
```

### Scénario 5 : Collaboration musicale

```
Objectif : Partager des recommandations

Actions :
1. Créer liste "Recommandations pour [Ami]"
2. Générer lien de partage
3. Envoyer le lien
4. L'ami peut voir et noter

Résultat : Échange musical facile
```

## 🛠️ Architecture technique

### Modèle de données

```prisma
model List {
  id           String   @id @default(cuid())
  title        String
  description  String?
  isPublic     Boolean  @default(false)
  shareToken   String?  @unique
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  albums       Album[]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

### Génération de token

```typescript
import { randomBytes } from 'crypto'

const generateShareToken = () => {
  return randomBytes(32).toString('hex') // 64 caractères
}

// Création
const token = generateShareToken()
await prisma.list.update({
  where: { id: listId },
  data: { shareToken: token }
})
```

### Routes de partage

**Page publique** : `/explore`
```typescript
// Récupérer toutes les listes publiques
const publicLists = await prisma.list.findMany({
  where: { isPublic: true },
  include: {
    user: true,
    albums: true,
    _count: { select: { albums: true } }
  }
})
```

**Page avec token** : `/shared/[token]`
```typescript
// Récupérer liste par token
const list = await prisma.list.findUnique({
  where: { shareToken: token },
  include: {
    user: true,
    albums: {
      include: { album: true },
      orderBy: { position: 'asc' }
    }
  }
})

// Vérifier que le token existe
if (!list) {
  return { notFound: true }
}
```

### API de gestion

**POST /api/lists/[id]/share** :
```typescript
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession()
  
  // Vérifier propriétaire
  const list = await prisma.list.findUnique({
    where: { id: params.id, userId: session.user.id }
  })
  
  if (!list) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }
  
  // Générer token
  const token = generateShareToken()
  
  await prisma.list.update({
    where: { id: params.id },
    data: { shareToken: token }
  })
  
  return NextResponse.json({ token })
}
```

**DELETE /api/lists/[id]/share** :
```typescript
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession()
  
  await prisma.list.update({
    where: { 
      id: params.id,
      userId: session.user.id 
    },
    data: { shareToken: null }
  })
  
  return NextResponse.json({ success: true })
}
```

### Sécurité

**Token aléatoire** :
- 64 caractères hexadécimaux
- Impossible à deviner
- Unique dans la base de données

**Validation** :
```typescript
// Vérifier unicité
const existing = await prisma.list.findUnique({
  where: { shareToken: token }
})

if (existing) {
  // Régénérer un nouveau token
  token = generateShareToken()
}
```

**Rate limiting** :
- Limite les requêtes de génération de token
- Évite l'abus

## 📱 Interface utilisateur

### Bouton Partager

```typescript
<button 
  onClick={handleShare}
  className="btn-primary"
>
  <Share2 className="w-4 h-4" />
  Partager
</button>
```

### Modal de partage

```typescript
<Modal open={showShareModal}>
  <h2>Partager cette liste</h2>
  
  {/* Toggle public/privé */}
  <Switch
    checked={isPublic}
    onChange={togglePublic}
    label="Liste publique"
  />
  
  {/* Lien de partage */}
  {shareToken ? (
    <div>
      <input 
        value={`${baseUrl}/shared/${shareToken}`}
        readOnly
      />
      <button onClick={copyLink}>
        <Copy /> Copier
      </button>
      <button onClick={revokeLink}>
        <X /> Révoquer
      </button>
    </div>
  ) : (
    <button onClick={generateLink}>
      Générer un lien de partage
    </button>
  )}
</Modal>
```

### Copie dans le presse-papier

```typescript
const copyLink = async () => {
  const url = `${window.location.origin}/shared/${shareToken}`
  await navigator.clipboard.writeText(url)
  toast.success('Lien copié !')
}
```

## 🎨 Expérience utilisateur

### Vue consultation (destinataire)

**En-tête** :
```
┌─────────────────────────────────────────┐
│ 🔗 Liste partagée par [Username]        │
│                                          │
│ Titre de la liste                       │
│ Description...                           │
│                                          │
│ 📅 Période: 1980-1989                   │
│ 🎵 15 albums                             │
└─────────────────────────────────────────┘
```

**Fonctionnalités disponibles** :
✅ Voir tous les albums
✅ Voir les pochettes
✅ Consulter détails Discogs
✅ Cliquer sur Apple Music
✅ Trier/filtrer (si liste grande)

**Fonctionnalités NON disponibles** :
❌ Modifier la liste
❌ Ajouter/supprimer albums
❌ Réorganiser l'ordre
❌ Exporter (sauf si implémenté)

## 💡 Conseils et astuces

### Pour les propriétaires

✅ **Public vs Privé avec token**
- Public : Découverte sur Explorer
- Token : Contrôle de qui voit

✅ **Sécurité des tokens**
- Ne partagez que avec personnes de confiance
- Révoquez si besoin
- Générez nouveau token après révocation

✅ **Description claire**
- Ajoutez une description explicite
- Facilitez la compréhension pour visiteurs

✅ **Maintenance**
- Mettez à jour régulièrement
- Les visiteurs voient les changements en temps réel

### Pour les visiteurs

✅ **Pas de compte nécessaire**
- Consultation libre
- Bookmarkez le lien

✅ **Créez votre propre liste**
- Inspirez-vous
- Créez un compte pour votre version

## 🐛 Dépannage

### Le lien ne fonctionne plus

**Cause** : Token révoqué par le propriétaire

**Solution** :
- Demander un nouveau lien
- Ou vérifier si liste devenue publique

### Erreur 404 sur lien partagé

**Causes possibles** :
- Token invalide
- Liste supprimée
- URL mal copiée

**Solutions** :
1. Vérifier l'URL complète
2. Demander nouveau lien
3. Vérifier avec propriétaire

### Liste publique invisible sur Explorer

**Causes** :
- Liste vide (0 albums)
- Problème de synchronisation

**Solutions** :
1. Vérifier que isPublic = true
2. Ajouter au moins 1 album
3. Recharger /explore

### Bouton Partager ne fonctionne pas

**Cause** : Pas propriétaire de la liste

**Solution** :
- Seul le propriétaire peut partager
- Créez votre propre liste

## 🔮 Évolutions futures

### Fonctionnalités planifiées

- [ ] Statistiques de vues par lien
- [ ] Expiration automatique des tokens
- [ ] Liens avec mot de passe
- [ ] Partage collaboratif (édition)
- [ ] Partage direct vers réseaux sociaux
- [ ] QR code pour partage mobile
- [ ] Embed widget pour blogs

### Améliorations techniques

- [ ] Analytics sur liens partagés
- [ ] Cache pour pages partagées
- [ ] SEO optimisé pour listes publiques
- [ ] OpenGraph cards pour réseaux sociaux

## 📚 Voir aussi

- [Gestion de listes](LISTS-MANAGEMENT.md) - Créer et modifier
- [Page Explorer](EXPLORE-FILTERS.md) - Découvrir listes publiques
- [SEO](../reference/SEO.md) - Optimisation référencement

---

**Sécurité** : Token 64 caractères  
**Public** : Accessible sur /explore  
**Token** : Accessible sur /shared/[token]  
**Dernière mise à jour** : Janvier 2025
