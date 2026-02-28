# ❓ FAQ - Questions fréquentes

## 📑 Table des matières

- [Général](#général)
- [Compte et authentification](#compte-et-authentification)
- [Listes et albums](#listes-et-albums)
- [Recherche Discogs](#recherche-discogs)
- [Import/Export](#importexport)
- [Rapports et statistiques](#rapports-et-statistiques)
- [Partage](#partage)
- [Performance](#performance)
- [Technique](#technique)

---

## Général

### Qu'est-ce que RankList ?

RankList est une application web pour créer, organiser et partager vos classements d'albums musicaux. Elle utilise la base de données Discogs (14M+ albums) et offre des fonctionnalités avancées d'import/export, rapports, playlists et statistiques.

### Est-ce gratuit ?

Oui, RankList est entièrement gratuit et open-source.

### Puis-je l'utiliser hors ligne ?

Non, RankList nécessite une connexion internet pour :
- Rechercher des albums sur Discogs
- Charger les pochettes
- Synchroniser vos données

### Sur quels appareils ça fonctionne ?

RankList fonctionne sur :
- 💻 Desktop (Windows, Mac, Linux)
- 📱 Mobile (iOS, Android)
- 📱 Tablette

Interface responsive adaptée à tous les écrans.

---

## Compte et authentification

### Comment créer un compte ?

1. Cliquer sur "S'inscrire"
2. Renseigner email, nom d'utilisateur, mot de passe
3. Valider

Connexion automatique après inscription.

### J'ai oublié mon mot de passe

**À venir** : Fonction "Mot de passe oublié"

Actuellement : Contacter le support

### Puis-je changer mon nom d'utilisateur ?

Oui, dans Profil → Modifier → Nouveau nom d'utilisateur

### Comment supprimer mon compte ?

⚠️ **Action irréversible**

1. Profil → Paramètres
2. "Supprimer mon compte"
3. Confirmer

Toutes vos listes seront supprimées.

---

## Listes et albums

### Combien de listes puis-je créer ?

Illimité. Créez autant de listes que vous voulez.

### Combien d'albums par liste ?

Illimité. Certaines listes ont > 500 albums.

### Puis-je avoir un album dans plusieurs listes ?

Oui ! Un même album peut être dans autant de listes que vous voulez.

### Comment organiser mes albums ?

Glisser-déposer dans l'ordre souhaité. Les positions se mettent à jour automatiquement.

### Les listes sont-elles numérotées automatiquement ?

Oui, si vous organisez par ordre : #1, #2, #3...

### Puis-je créer des listes sans ordre ?

Oui, ne pas organiser les albums. Ils apparaissent dans l'ordre d'ajout.

### Comment supprimer un album ?

Mode Édition → Icône poubelle sur l'album → Confirmer

### Comment supprimer plusieurs albums en même temps ?

**À venir** : Sélection multiple

Actuellement : Supprimer un par un

---

## Recherche Discogs

### Pourquoi Discogs ?

Discogs est la plus grande base de données musicale :
- 14M+ albums
- Métadonnées complètes
- Images haute qualité
- Tracklists détaillées

### Je ne trouve pas un album

**Vérifiez** :
- Orthographe correcte
- Essayez variations (avec/sans "The")
- Ajoutez l'année
- Cherchez sur discogs.com d'abord

Si vraiment introuvable : L'album n'est peut-être pas dans Discogs (rare).

### Plusieurs résultats pour le même album

Normal. Discogs a plusieurs releases :
- Différentes éditions
- Différents pays
- Différents formats (vinyl, CD, etc.)

**Conseil** : Sélectionner le "master" (version canonique).

### Homonymes d'artistes

Exemple : "John Williams" (compositeur films vs guitariste)

**Solution** :
- Ajouter du contexte : "John Williams Star Wars"
- Vérifier l'année dans les résultats
- RankList utilise les IDs Discogs pour différencier

### Les pochettes ne s'affichent pas

**Causes** :
- Connexion lente
- Pas d'image sur Discogs (rare)
- Problème de cache

**Solutions** :
- Recharger la page
- Vérifier la connexion
- Attendre quelques secondes

---

## Import/Export

### Quels formats d'import ?

- **CSV** : Artiste, Titre, Année
- **JSON** : Métadonnées complètes

### Quels formats d'export ?

**Par liste** :
- CSV (Excel)
- JSON (backup)
- M3U8 (playlist)
- PNG (mosaïque)

**Rapports multi-listes** :
- HTML (avec pochettes)
- CSV (avec stats)
- TXT (avec stats)

### Comment importer depuis Apple Music ?

**Voir** : [Import depuis Apple Music](features/IMPORT-ALBUMS.md)

1. Exporter votre playlist Apple Music
2. Convertir en CSV
3. Importer dans RankList

### Mon import CSV échoue

**Vérifiez** :
- Format correct : `Artiste,Titre,Année`
- Encodage UTF-8
- Pas de lignes vides
- Virgules bien placées

**Exemple valide** :
```csv
Pink Floyd,The Dark Side of the Moon,1973
Led Zeppelin,Led Zeppelin IV,1971
```

### Export playlist vide

**Cause** : Certains albums n'ont pas de tracklist sur Discogs

**Solution** : Normal, tous les albums ne sont pas complets dans Discogs

### Comment sauvegarder toutes mes listes ?

1. Page "Mes Listes"
2. Pour chaque liste : Export JSON
3. Conserver les fichiers JSON

**À venir** : Export global de toutes les listes

---

## Rapports et statistiques

### Quelle est la différence entre Rapport et Statistiques ?

**Rapports** (`/reports`) :
- Exporter plusieurs listes en un document
- Formats HTML/CSV/TXT
- Avec statistiques (Top artistes, Top années)

**Statistiques** (`/stats`) :
- Vue analytique de votre collection
- Graphiques par décennie
- Top artistes globaux
- Albums favoris

### Les statistiques sont vides

**Cause** : Aucun album dans vos listes

**Solution** : Ajouter des albums !

### Rapport HTML sans images

**Cause** : Connexion lente ou bloquée

**Solution** :
- Vérifier connexion internet
- Les images viennent de Discogs
- Attendre le chargement complet

### Comment imprimer un rapport ?

**Rapport HTML** :
1. Générer rapport HTML
2. Ouvrir dans navigateur
3. Ctrl+P (Cmd+P sur Mac)
4. Imprimer ou sauvegarder en PDF

Optimisé pour l'impression.

### Statistiques incorrectes

**Causes possibles** :
- Cache navigateur
- Calcul en cours

**Solutions** :
1. Recharger la page
2. Vider le cache
3. Attendre quelques secondes

---

## Partage

### Différence entre Liste Publique et Lien de partage ?

**Liste publique** :
- Visible sur `/explore`
- Tout le monde peut trouver
- Indexée par Google

**Lien de partage (token)** :
- Lien privé unique
- Fonctionne même pour listes privées
- Seuls ceux avec le lien peuvent voir

### Quelqu'un peut-il modifier ma liste partagée ?

Non ! Seul le propriétaire peut modifier.

Les autres peuvent seulement consulter.

### Comment révoquer un lien de partage ?

1. Page liste → "Partager"
2. "Révoquer le lien"
3. Ancien lien ne fonctionne plus

Vous pouvez en générer un nouveau après.

### Ma liste publique n'apparaît pas sur Explorer

**Vérifiez** :
- Liste bien marquée "Publique"
- Liste contient au moins 1 album
- Recharger `/explore`

**Délai** : Immédiat normalement

---

## Performance

### L'application est lente

**Causes possibles** :
- Connexion internet lente
- Trop d'albums (> 1000)
- Cache plein

**Solutions** :
1. Vérifier connexion
2. Vider le cache navigateur
3. Recharger la page
4. Utiliser un navigateur récent

### Les images mettent du temps à charger

Normal. Images viennent de Discogs.

**Tips** :
- Connexion rapide recommandée
- Les images sont cachées après 1er chargement

### Recherche Discogs lente

**Cause** : Rate limit API (60 req/min)

**Solution** :
- Attendre quelques secondes entre recherches
- Système de cache pour accélérer

### Export playlist très long

**Cause** : Récupération des tracklists depuis Discogs

**Optimisation v1.6.0** :
- Cache 30 jours
- Traitement parallèle
- 80-97% plus rapide

**Voir** : [Performance](technical/PERFORMANCE.md)

---

## Technique

### Quelle technologie utilise RankList ?

- **Frontend** : Next.js 16, React, TypeScript
- **Backend** : Next.js API Routes
- **Base de données** : PostgreSQL + Prisma
- **API** : Discogs API v2

**Voir** : [Architecture](../ARCHITECTURE.md)

### Puis-je héberger ma propre instance ?

Oui ! RankList est open-source.

**Voir** : [Guide d'installation](guides/INSTALLATION.md)

### L'API Discogs a-t-elle des limites ?

Oui : **60 requêtes/minute**

RankList optimise avec :
- Cache 30 jours
- Déduplication
- Traitement parallèle

### Puis-je contribuer au projet ?

Oui ! Contributions bienvenues.

**Voir** : [Guide de contribution](../CONTRIBUTING.md)

### Où sont hébergées mes données ?

Base de données PostgreSQL sécurisée.

Vos données ne sont jamais partagées sans votre consentement.

### Puis-je exporter toutes mes données ?

Oui, pour chaque liste : Export JSON

**À venir** : Export global JSON de tout le compte

### L'application est-elle open-source ?

Oui, sous licence MIT.

Repository : [github.com/votre-user/ranklist](https://github.com)

---

## 🆘 Autres questions ?

### Support

- 🐛 **Bugs** : [GitHub Issues](https://github.com/votre-user/ranklist/issues)
- 💬 **Discussions** : [GitHub Discussions](https://github.com/votre-user/ranklist/discussions)
- 📖 **Documentation** : [docs/README.md](README.md)
- 📧 **Contact** : support@ranklist.app

### Guides utiles

- [Démarrage rapide](guides/QUICK-START.md) - 5 minutes
- [Guide utilisateur](guides/USER-GUIDE.md) - Complet
- [Installation](guides/INSTALLATION.md) - Auto-hébergement

---

**Dernière mise à jour** : Janvier 2025 (v1.8.0)
