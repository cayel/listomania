# 📊 Génération de rapports multi-listes

## Vue d'ensemble

La fonctionnalité de génération de rapports permet de créer des documents professionnels regroupant plusieurs listes d'albums. Accès via le menu **"Rapports"** ou directement à `/reports`.

**Version** : 1.8.0  
**Authentification** : Requise

## ✨ Fonctionnalités

### Trois formats d'export
- **HTML** : Design geek sobre avec grille de pochettes + statistiques
- **CSV** : Compatible Excel/Sheets avec statistiques
- **TXT** : Format ASCII universel avec statistiques

### Statistiques incluses
- **Top 10 artistes** : Classement des artistes les plus présents
- **Top 10 années** : Répartition des albums par année

### Filtrage et tri avancés
- **Visibilité** : Toutes / Publiques / Privées
- **Catégorie** : Filtrer par catégorie assignée
- **Période** : Filtrer par période définie
- **Tri** : Par titre, date de modification, nombre d'albums, ou période
- **Ordre** : Croissant ou décroissant

## 📖 Guide d'utilisation

### 1. Filtrer et trier vos listes

**Cliquez sur "Filtres"** pour accéder au panneau de filtrage.

#### Filtres disponibles

**Visibilité :**
- **Toutes** : Affiche toutes vos listes
- **Publiques** : Uniquement les listes visibles par tous
- **Privées** : Uniquement vos listes privées

**Catégorie :**
- Filtrez par catégorie (Rock, Jazz, Hip-Hop, etc.)
- Liste dynamique basée sur vos catégories existantes

**Période :**
- Filtrez par période (2024, Années 90, etc.)
- Liste dynamique basée sur vos périodes définies

#### Options de tri

- **Par titre** : Ordre alphabétique
- **Par dernière modification** : Listes récemment modifiées en premier
- **Par nombre d'albums** : Du moins au plus grand nombre
- **Par période** : Ordre chronologique

💡 Le badge numéroté sur "Filtres" indique le nombre de filtres actifs.

### 2. Sélectionner vos listes

- Cochez les listes à inclure dans votre rapport
- Utilisez **"Tout sélectionner"** pour gagner du temps
- Le compteur affiche le nombre de listes sélectionnées
- Le titre affiche le nombre de listes visibles après filtrage

### 3. Générer le rapport

Cliquez sur **"Générer le rapport"**. Le système va :
- ✅ Récupérer toutes vos listes
- ✅ Charger les albums avec leurs détails
- ✅ Organiser les données par liste
- ✅ Calculer les statistiques

Vous verrez ensuite :
- **Total d'albums** : Nombre total dans toutes les listes sélectionnées
- **Listes incluses** : Nombre de listes dans le rapport

⚠️ Le rapport respecte l'ordre de tri choisi dans les filtres !

### 4. Exporter dans le format souhaité

#### 📄 HTML (Impression)

**Design sobre et geek** optimisé pour l'impression

✨ **Caractéristiques :**
- **Grille visuelle de pochettes** (7 colonnes desktop)
- Format : Artiste - Titre (Année)
- Aspect ratio 1:1 (carrés parfaits sans déformation)
- Design responsive (7/5/4/3 colonnes selon écran)
- Police monospace pour un style geek
- Statistiques Top 10 artistes et années
- Liste détaillée de tous les albums après la grille

💡 **Comment l'utiliser :**
1. Cliquez sur "HTML (Impression)"
2. Le fichier HTML est téléchargé
3. Ouvrez-le dans votre navigateur
4. Admirez vos albums en mode galerie visuelle
5. Utilisez Ctrl+P (Cmd+P sur Mac) pour imprimer ou sauvegarder en PDF

**Structure visuelle :**
```
┌─────────────────────────────────────────────┐
│  📊 Rapport de Listes RankList              │
│  Généré le XX/XX/XXXX                       │
│  X liste(s) • X album(s) au total           │
└─────────────────────────────────────────────┘

─────────────────────────────────────────────
1. Nom de la liste
─────────────────────────────────────────────
Description de la liste
📅 Période: XXXX-XXXX
🎵 X album(s)

Grille 7 colonnes (responsive):
┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ...
│ IMG │ │ IMG │ │ IMG │ │ IMG │ │ IMG │
│ #1  │ │ #2  │ │ #3  │ │ #4  │ │ #5  │
│Title│ │Title│ │Title│ │Title│ │Title│
└─────┘ └─────┘ └─────┘ └─────┘ └─────┘

Détails complets:
1. Artiste - Titre (Année)
2. Artiste - Titre (Année)
...

📊 Statistiques:

Top 10 artistes:
• Artiste 1: X albums
• Artiste 2: X albums
...

Top 10 années:
• Année 1: X albums
• Année 2: X albums
...
```

**Responsive :**
- **> 1200px** : 7 colonnes
- **768-1200px** : 5 colonnes
- **480-768px** : 4 colonnes
- **< 480px** : 3 colonnes

#### 📊 CSV (Excel)

**Format tabulaire** pour analyse dans Excel ou Google Sheets

✨ **Caractéristiques :**
- Colonnes : Liste, Artiste, Titre, Année
- Encodage UTF-8 (caractères spéciaux)
- Section statistiques à la fin
- Facile à analyser et traiter

💡 **Comment l'utiliser :**
1. Cliquez sur "CSV (Excel)"
2. Ouvrez dans Excel, Numbers ou Google Sheets
3. Créez des graphiques, tableaux croisés dynamiques
4. Filtrez et triez selon vos besoins

**Structure :**
```csv
Liste,Artiste,Titre,Année
"Ma Liste Rock",Pink Floyd,The Dark Side of the Moon,1973
"Ma Liste Rock",Led Zeppelin,Led Zeppelin IV,1971
...

STATISTIQUES

Top 10 artistes
Artiste,Nombre d'albums
Pink Floyd,5
Led Zeppelin,4
...

Top 10 années
Année,Nombre d'albums
1973,8
1971,6
...
```

#### 📝 Texte (.txt)

**Format texte brut universel** compatible avec tous les éditeurs

✨ **Caractéristiques :**
- Design ASCII avec séparateurs visuels
- Format : Artiste - Titre (Année)
- Statistiques formatées en ASCII
- Compatible avec tous les éditeurs
- Idéal pour archivage ou systèmes legacy

💡 **Comment l'utiliser :**
1. Cliquez sur "Texte (.txt)"
2. Ouvrez avec n'importe quel éditeur de texte
3. Partagez facilement par email ou messagerie
4. Archivez pour consultation future

**Structure :**
```
============================================
   RAPPORT DE LISTES RANKLIST
============================================
Généré le: XX/XX/XXXX
Listes: X | Albums: X

--------------------------------------------
1. Nom de la liste
--------------------------------------------
Description
Période: XXXX-XXXX | Albums: X

1. Artiste - Titre (Année)
2. Artiste - Titre (Année)
...

============================================
   STATISTIQUES
============================================

TOP 10 ARTISTES
--------------------------------------------
1. Artiste 1 ............... X albums
2. Artiste 2 ............... X albums
...

TOP 10 ANNÉES
--------------------------------------------
1. Année 1 ................. X albums
2. Année 2 ................. X albums
...
```

## 💡 Exemples d'utilisation

### Scénario 1 : Rapport Rock des années 90

**Objectif :** Créer un rapport de toutes mes listes Rock des années 90, triées chronologiquement.

**Étapes :**
1. Ouvrir `/reports`
2. Cliquer sur "Filtres"
3. Sélectionner :
   - Catégorie : Rock
   - Période : Années 90
   - Trier par : Période
   - Ordre : Croissant
4. "Tout sélectionner"
5. Générer → Exporter en HTML

**Résultat :** Document élégant avec grille de pochettes Rock 90s, ordonnées chronologiquement.

### Scénario 2 : Analyse Excel complète

**Objectif :** Analyser toute ma collection dans Excel.

**Étapes :**
1. Ouvrir `/reports`
2. Garder filtres par défaut (Toutes)
3. Trier par : Titre
4. "Tout sélectionner"
5. Générer → Exporter en CSV

**Résultat :** Fichier CSV avec tous vos albums, prêt pour analyses statistiques avancées.

### Scénario 3 : Listes publiques récentes

**Objectif :** Partager mes listes publiques récentes en PDF.

**Étapes :**
1. Ouvrir `/reports`
2. Filtres :
   - Visibilité : Publiques
   - Trier par : Dernière modification
   - Ordre : Décroissant
3. Sélectionner les 5-10 premières
4. Générer → HTML → Imprimer en PDF

**Résultat :** PDF professionnel avec vos listes publiques récentes, visuellement attrayant.

### Scénario 4 : Archive texte complète

**Objectif :** Créer une archive texte de toute ma collection pour sauvegarde.

**Étapes :**
1. Ouvrir `/reports`
2. "Tout sélectionner"
3. Générer → Exporter en TXT

**Résultat :** Archive texte complète, facile à stocker et consulter sans dépendances.

### Scénario 5 : Top Jazz par artiste

**Objectif :** Voir quels artistes Jazz dominent ma collection.

**Étapes :**
1. Filtrer par Catégorie : Jazz
2. Sélectionner toutes les listes Jazz
3. Générer le rapport
4. Consulter la section "Top 10 artistes"

**Résultat :** Statistiques claires de vos artistes Jazz favoris.

### Scénario 6 : Albums des années 70

**Objectif :** Compter combien d'albums des 70s sont dans ma collection.

**Étapes :**
1. Filtrer par Période : Années 70
2. Sélectionner toutes les listes
3. Générer le rapport
4. Consulter la section "Top 10 années"

**Résultat :** Répartition précise par année dans les années 70.

### Scénario 7 : Rapport multi-genres

**Objectif :** Créer un rapport mixte Rock + Jazz + Hip-Hop.

**Étapes :**
1. Ne pas appliquer de filtre catégorie
2. Sélectionner manuellement les listes Rock, Jazz et Hip-Hop
3. Trier par : Titre
4. Générer → HTML

**Résultat :** Rapport visuel mixte avec statistiques inter-genres.

## 🏗️ Architecture technique

### Frontend

**Fichier** : [app/reports/page.tsx](../../app/reports/page.tsx)

**État de l'application :**
```typescript
// Données
const [allLists, setAllLists] = useState<List[]>([])
const [selectedLists, setSelectedLists] = useState<Set<string>>(new Set())

// Filtres
const [filterVisibility, setFilterVisibility] = useState<'all' | 'public' | 'private'>('all')
const [filterCategory, setFilterCategory] = useState<string>('all')
const [filterPeriod, setFilterPeriod] = useState<string>('all')

// Tri
const [sortBy, setSortBy] = useState<'title' | 'updated' | 'albums' | 'period'>('title')
const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
```

**Extraction dynamique des options :**
```typescript
// Catégories uniques
const categories = useMemo(() => {
  const cats = new Set<string>()
  allLists.forEach(list => {
    list.categories?.forEach(lc => cats.add(lc.category.name))
  })
  return Array.from(cats).sort()
}, [allLists])

// Périodes uniques
const periods = useMemo(() => {
  const pers = new Set<string>()
  allLists.forEach(list => {
    if (list.period) pers.add(list.period)
  })
  return Array.from(pers).sort()
}, [allLists])
```

**Filtrage et tri optimisés :**
```typescript
const filteredLists = useMemo(() => {
  let result = allLists

  // Appliquer les filtres
  if (filterVisibility !== 'all') {
    result = result.filter(list => 
      filterVisibility === 'public' ? list.isPublic : !list.isPublic
    )
  }

  if (filterCategory !== 'all') {
    result = result.filter(list =>
      list.categories?.some(lc => lc.category.name === filterCategory)
    )
  }

  if (filterPeriod !== 'all') {
    result = result.filter(list => list.period === filterPeriod)
  }

  // Appliquer le tri
  return result.sort((a, b) => {
    let comparison = 0
    switch (sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title)
        break
      case 'updated':
        comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        break
      case 'albums':
        comparison = (a._count?.albums || 0) - (b._count?.albums || 0)
        break
      case 'period':
        comparison = (a.period || '').localeCompare(b.period || '')
        break
    }
    return sortOrder === 'asc' ? comparison : -comparison
  })
}, [allLists, filterVisibility, filterCategory, filterPeriod, sortBy, sortOrder])
```

**Génération des statistiques :**
```typescript
// Compter les occurrences
const artistCount: { [key: string]: number } = {}
const yearCount: { [key: string]: number } = {}

reportData.forEach(list => {
  list.albums.forEach(album => {
    // Artistes
    const artist = album.artist || 'Inconnu'
    artistCount[artist] = (artistCount[artist] || 0) + 1
    
    // Années
    const year = album.year?.toString() || 'Inconnue'
    yearCount[year] = (yearCount[year] || 0) + 1
  })
})

// Top 10
const topArtists = Object.entries(artistCount)
  .sort(([, a], [, b]) => b - a)
  .slice(0, 10)

const topYears = Object.entries(yearCount)
  .sort(([, a], [, b]) => b - a)
  .slice(0, 10)
```

**Génération HTML :**
```typescript
const exportToHTML = () => {
  let html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Rapport RankList</title>
  <style>
    body { font-family: 'Courier New', monospace; }
    .covers-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 15px;
    }
    .album-card {
      aspect-ratio: 1;
      overflow: hidden;
    }
    .album-card img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    /* Responsive */
    @media (max-width: 1200px) {
      .covers-grid { grid-template-columns: repeat(5, 1fr); }
    }
    @media (max-width: 768px) {
      .covers-grid { grid-template-columns: repeat(4, 1fr); }
    }
    @media (max-width: 480px) {
      .covers-grid { grid-template-columns: repeat(3, 1fr); }
    }
  </style>
</head>
<body>
  <!-- En-tête -->
  <!-- Grilles de pochettes par liste -->
  <!-- Détails complets -->
  <!-- Statistiques -->
</body>
</html>
  `
  
  // Télécharger
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = \`rapport-ranklist-\${Date.now()}.html\`
  a.click()
}
```

### Backend

**API Generate** : [app/api/reports/generate/route.ts](../../app/api/reports/generate/route.ts)

- Récupération des listes avec albums depuis Prisma
- Validation des permissions utilisateur
- Support des paramètres de tri (`sortBy`, `sortOrder`)
- Formatage des données pour le frontend

**Requête Prisma :**
```typescript
const lists = await prisma.list.findMany({
  where: {
    id: { in: selectedListIds },
    userId: session.user.id
  },
  include: {
    albums: {
      orderBy: { position: 'asc' },
      include: { album: true }
    },
    categories: {
      include: { category: true }
    }
  },
  orderBy: sortBy === 'title' ? { title: sortOrder } 
    : sortBy === 'updated' ? { updatedAt: sortOrder === 'asc' ? 'asc' : 'desc' }
    : undefined
})
```

### Performance

**Optimisations avec useMemo :**
- Extraction des catégories/périodes : 1 seule fois
- Filtrage : recalculé uniquement si filtres changent
- Tri : recalculé uniquement si tri change

**Badge de filtres actifs :**
```typescript
const activeFiltersCount = useMemo(() => {
  let count = 0
  if (filterVisibility !== 'all') count++
  if (filterCategory !== 'all') count++
  if (filterPeriod !== 'all') count++
  return count
}, [filterVisibility, filterCategory, filterPeriod])
```

## 🔧 Configuration

Aucune configuration nécessaire. La fonctionnalité utilise les données existantes de la base de données.

## 📝 Notes de développement

### Extensibilité

Pour ajouter un nouveau format d'export :

1. Créer une fonction `exportToXXX()`
2. Générer le contenu dans le format souhaité
3. Créer un Blob avec le bon `type`
4. Déclencher le téléchargement

**Exemple :**
```typescript
const exportToJSON = () => {
  const json = JSON.stringify(reportData, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `rapport-${Date.now()}.json`
  a.click()
}
```

### Bonnes pratiques

- ✅ Utiliser `useMemo` pour calculs coûteux
- ✅ Extraction dynamique des options de filtres
- ✅ Badge de notification pour UX claire
- ✅ Encodage UTF-8 pour caractères spéciaux
- ✅ Noms de fichiers avec timestamp
- ✅ Responsive design pour tous formats
- ✅ Fallbacks pour images manquantes

## 🐛 Dépannage

### Le rapport est vide
- Vérifiez que vous avez sélectionné au moins une liste
- Vérifiez que les listes contiennent des albums

### Les pochettes ne s'affichent pas
- Images chargées depuis Discogs (nécessite connexion internet)
- Fallback automatique si image indisponible

### Le tri ne fonctionne pas
- Le tri est appliqué AVANT la sélection
- Générez un nouveau rapport après avoir changé le tri

### Les statistiques sont incorrectes
- Les statistiques sont basées uniquement sur les listes sélectionnées
- Vérifiez votre sélection avant de générer

### L'export CSV a des caractères bizarres
- Assurez-vous d'ouvrir avec encodage UTF-8
- Dans Excel : Données → Importer → UTF-8

## 📚 Voir aussi

- [Export de playlists](PLAYLIST-EXPORT.md) - Exporter des playlists M3U8
- [Export d'images](IMAGE-EXPORT.md) - Créer des mosaïques visuelles
- [Page Explorer](EXPLORE-FILTERS.md) - Filtrer vos listes
- [Statistiques](STATISTICS.md) - Comprendre vos stats

---

**Documentation mise à jour** : Janvier 2025 (v1.8.0)
