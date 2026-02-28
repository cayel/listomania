# 📊 Statistiques

## Vue d'ensemble

La page Statistiques (`/stats`) offre une vue analytique complète de votre collection musicale avec graphiques, classements et insights.

**Accès** : Menu principal → "Statistiques" ou `/stats`

## ✨ Fonctionnalités

### 📈 Albums par décennie

**Graphique en barres** montrant la répartition de vos albums par décennie :
- Années 60s, 70s, 80s, 90s, 2000s, 2010s, 2020s
- Hauteur proportionnelle au nombre d'albums
- Code couleur visuel
- Total affiché par décennie

**Utilité** :
- Identifier vos périodes musicales favorites
- Voir l'évolution de votre collection
- Détecter les trous dans votre collection

### 🎤 Top artistes

**Classement des artistes** les plus présents dans vos listes :
- Top 10 artistes par défaut
- Nom de l'artiste + nombre d'albums
- Tri décroissant par quantité
- Détection automatique des artistes récurrents

**Utilité** :
- Identifier vos artistes favoris
- Voir quels artistes dominent votre collection
- Découvrir vos préférences musicales

### 💿 Albums favoris (Top occurrences)

**Albums présents dans le plus de listes** :
- Top 10 albums par défaut
- Nom de l'album + artiste + nombre de listes
- Détecte les albums que vous avez ajoutés plusieurs fois
- Montre vos albums vraiment incontournables

**Utilité** :
- Identifier vos albums réellement favoris
- Albums présents dans plusieurs listes thématiques
- Vos choix les plus constants

### 📊 Statistiques globales

**Vue d'ensemble de votre collection** :
- **Nombre total de listes**
- **Nombre total d'albums** (avec dédoublonnage)
- **Nombre d'albums uniques**
- **Nombre d'artistes différents**
- **Période couverte** (plus ancien → plus récent)

## 📖 Guide d'utilisation

### Accéder aux statistiques

```
1. Cliquer sur "Statistiques" dans le menu
2. Ou aller directement sur /stats
3. Les statistiques se chargent automatiquement
```

### Interpréter le graphique des décennies

**Exemple de lecture** :
```
Années 70 : ████████████ (45 albums)
Années 80 : ████████████████ (68 albums)
Années 90 : ██████████ (32 albums)
Années 2000 : ████████ (25 albums)

→ Vous avez une préférence marquée pour les années 80
→ Les années 2000 sont sous-représentées
```

### Analyser le Top Artistes

**Exemple** :
```
1. Pink Floyd ........... 12 albums
2. Led Zeppelin ......... 9 albums
3. The Beatles .......... 8 albums

→ Pink Floyd est votre artiste le plus collectionné
→ Rock classique domine votre collection
```

### Comprendre les albums favoris

**Différence avec Top Artistes** :
- Top Artistes : Compte tous les albums d'un artiste
- Albums favoris : Albums spécifiques présents dans plusieurs listes

**Exemple** :
```
1. The Dark Side of the Moon (Pink Floyd) - 5 listes
2. Abbey Road (The Beatles) - 4 listes
3. Led Zeppelin IV (Led Zeppelin) - 4 listes

→ Ces albums sont dans plusieurs de vos listes thématiques
→ Vraiment incontournables pour vous
```

## 🎯 Cas d'usage

### Scénario 1 : Découvrir mes préférences

```
Objectif : Comprendre mes goûts musicaux

Actions :
1. Consulter le graphique décennies
2. Regarder le top artistes
3. Voir les albums favoris

Insights :
- Période favorite identifiée
- Artistes dominants révélés
- Albums clés confirmés
```

### Scénario 2 : Équilibrer ma collection

```
Objectif : Diversifier mes périodes musicales

Actions :
1. Voir le graphique décennies
2. Identifier les décennies sous-représentées
3. Chercher des albums de ces périodes

Résultat : Collection plus équilibrée
```

### Scénario 3 : Partager mes goûts

```
Objectif : Présenter ma collection à quelqu'un

Actions :
1. Prendre des captures d'écran des stats
2. Partager le Top Artistes
3. Montrer les albums favoris

Résultat : Vue claire de vos préférences musicales
```

### Scénario 4 : Suivre l'évolution

```
Objectif : Voir comment ma collection évolue

Actions :
1. Noter les stats actuelles
2. Revenir dans quelques mois
3. Comparer les changements

Résultat : Évolution de vos goûts visible
```

## 🛠️ Architecture technique

### Fichier principal

[app/stats/page.tsx](../../app/stats/page.tsx)

### Récupération des données

```typescript
const fetchStats = async () => {
  // Récupérer toutes les listes de l'utilisateur
  const lists = await fetch('/api/user/lists').then(r => r.json())
  
  // Récupérer tous les albums
  const albums = lists.flatMap(list => list.albums)
  
  // Calculer les statistiques
  calculateStats(albums)
}
```

### Calcul des décennies

```typescript
const albumsByDecade = albums.reduce((acc, album) => {
  const year = album.year
  if (!year) return acc
  
  const decade = Math.floor(year / 10) * 10
  const decadeKey = `${decade}s`
  
  acc[decadeKey] = (acc[decadeKey] || 0) + 1
  return acc
}, {})
```

### Calcul du Top Artistes

```typescript
const artistCounts = albums.reduce((acc, album) => {
  const artist = album.artist || 'Inconnu'
  acc[artist] = (acc[artist] || 0) + 1
  return acc
}, {})

const topArtists = Object.entries(artistCounts)
  .sort(([, a], [, b]) => b - a)
  .slice(0, 10)
  .map(([name, count]) => ({ name, count }))
```

### Calcul des albums favoris

```typescript
// Compter les occurrences d'albums
const albumOccurrences = albums.reduce((acc, album) => {
  const key = `${album.artist}-${album.title}`
  acc[key] = (acc[key] || 0) + 1
  return acc
}, {})

// Garder seulement les albums présents plusieurs fois
const favoriteAlbums = Object.entries(albumOccurrences)
  .filter(([, count]) => count > 1)
  .sort(([, a], [, b]) => b - a)
  .slice(0, 10)
```

### Rendu du graphique

```typescript
// Simple graphique avec CSS
<div className="decade-chart">
  {Object.entries(albumsByDecade).map(([decade, count]) => (
    <div key={decade} className="decade-bar">
      <div className="bar-label">{decade}</div>
      <div 
        className="bar-fill" 
        style={{ 
          width: `${(count / maxCount) * 100}%`,
          backgroundColor: getDecadeColor(decade)
        }}
      />
      <div className="bar-count">{count}</div>
    </div>
  ))}
</div>
```

## 📱 Design responsive

### Layout adaptatif

- **Desktop** : Grille 2 colonnes (graphique + stats)
- **Tablette** : Grille 1 colonne, graphique en haut
- **Mobile** : Colonnes empilées, graphique simplifié

### Optimisations mobile

- Graphique scrollable horizontalement
- Police réduite pour les labels
- Espacement adapté au touch

## 🎨 Visualisation des données

### Choix de couleurs par décennie

```typescript
const decadeColors = {
  '1960s': '#FF6B6B', // Rouge vintage
  '1970s': '#4ECDC4', // Turquoise
  '1980s': '#F7DC6F', // Jaune néon
  '1990s': '#9B59B6', // Violet grunge
  '2000s': '#3498DB', // Bleu digital
  '2010s': '#1ABC9C', // Vert moderne
  '2020s': '#E74C3C', // Rouge contemporain
}
```

### Typographie

- **Graphique** : Police sans-serif claire
- **Nombres** : Monospace pour alignement
- **Labels** : Gras pour lisibilité

## 💡 Conseils et astuces

### Pour les utilisateurs

✅ **Utilisez les stats pour planifier**
- Identifiez les trous dans votre collection
- Découvrez de nouveaux artistes similaires à vos favoris
- Équilibrez les périodes sous-représentées

✅ **Comparaison sociale**
- Comparez vos stats avec d'autres utilisateurs
- Découvrez des artistes que vous ne connaissez pas
- Échangez sur les albums communs

✅ **Évolution temporelle**
- Prenez des captures régulièrement
- Voyez comment vos goûts évoluent
- Documentez votre parcours musical

### Pour les développeurs

✅ **Performance**
- Mettre en cache les calculs de stats
- Utiliser useMemo pour éviter recalculs
- Charger les données en parallèle

✅ **Extensibilité**
- Structure modulaire par type de stat
- Facile d'ajouter de nouvelles statistiques
- Components réutilisables

## 🔮 Évolutions futures

### Fonctionnalités planifiées

- [ ] Statistiques par genre musical
- [ ] Évolution temporelle (graphique ligne)
- [ ] Comparaison entre utilisateurs
- [ ] Export des statistiques en PDF
- [ ] Partage des stats sur réseaux sociaux
- [ ] Statistiques par liste individuelle
- [ ] Top labels de disques
- [ ] Statistiques géographiques (pays d'origine)

### Améliorations techniques

- [ ] Graphiques interactifs (Chart.js ou Recharts)
- [ ] Filtrage par période ou genre
- [ ] Drill-down sur chaque statistique
- [ ] Cache côté serveur
- [ ] API dédiée aux statistiques

## 🐛 Dépannage

### Statistiques vides

**Cause** : Aucune liste ou aucun album

**Solution** :
- Créer des listes
- Ajouter des albums à vos listes

### Décennies manquantes

**Cause** : Pas d'albums de certaines décennies

**Solution** : Normal, reflète votre collection

### Top Artistes incorrect

**Cause** : Homonymes ou orthographes différentes

**Solution** :
- Utiliser les IDs Discogs pour dédoublonner
- Normaliser les noms d'artistes

### Performances lentes

**Cause** : Trop de listes ou d'albums

**Solution** :
- Mettre en cache les calculs
- Pagination des résultats
- Calcul côté serveur

## 📚 Voir aussi

- [Génération de rapports](REPORTS.md) - Stats dans les rapports
- [Page Explorer](EXPLORE-FILTERS.md) - Explorer les listes
- [Gestion de listes](LISTS-MANAGEMENT.md) - Organiser sa collection

---

**Fichier** : [app/stats/page.tsx](../../app/stats/page.tsx)  
**Version** : 1.4.0+  
**Tests** : [docs/technical/TESTING.md](../technical/TESTING.md)  
**Dernière mise à jour** : Janvier 2025
