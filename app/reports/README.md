# Module de Génération de Rapports

Ce module permet aux utilisateurs de générer des rapports de qualité à partir d'une sélection de listes.

## Structure

```
app/reports/
├── page.tsx              # Interface utilisateur pour la génération de rapports

app/api/reports/
├── generate/
│   └── route.ts          # API pour générer les données du rapport
└── export-pdf/
    └── route.ts          # API pour préparer l'export PDF

docs/
├── REPORTS-FEATURE.md    # Documentation technique
└── GUIDE-RAPPORTS.md     # Guide utilisateur

__tests__/
└── reports.test.ts       # Tests unitaires
```

## Fonctionnalités

### Interface utilisateur (page.tsx)

- Affichage de toutes les listes de l'utilisateur
- Sélection multiple avec cases à cocher
- Bouton "Tout sélectionner/désélectionner"
- Génération du rapport avec statistiques
- Export en 3 formats: HTML, CSV, Texte

### API Generate (api/reports/generate/route.ts)

**Endpoint:** `POST /api/reports/generate`

**Body:**
```json
{
  "listIds": ["list-id-1", "list-id-2", "list-id-3"]
}
```

**Response:**
```json
{
  "generatedAt": "2026-02-26T12:00:00.000Z",
  "lists": [
    {
      "id": "list-id-1",
      "title": "Ma Liste",
      "description": "Description",
      "period": "2024",
      "isPublic": true,
      "isRanked": true,
      "categories": [
        { "name": "Rock", "color": "#FF0000" }
      ],
      "albums": [
        {
          "position": 1,
          "artist": "Artist Name",
          "title": "Album Title",
          "year": 2024,
          "discogsId": "12345",
          "coverImage": "url"
        }
      ]
    }
  ],
  "totalAlbums": 42,
  "totalLists": 3
}
```

**Sécurité:**
- Authentification NextAuth requise
- Vérifie que l'utilisateur est propriétaire des listes
- Valide les IDs de listes

### API Export PDF (api/reports/export-pdf/route.ts)

**Endpoint:** `POST /api/reports/export-pdf`

Prépare les données pour une génération PDF (actuellement, la génération se fait côté client).

## Formats d'export

### HTML
- Design moderne et professionnel
- Tableaux responsive
- Optimisé pour impression
- Styles CSS intégrés
- Peut être converti en PDF via impression navigateur

### CSV
- Compatible Excel, Google Sheets
- Encodage UTF-8
- Échappement des guillemets
- Format: `Liste,Artiste,Titre,Année`

### Texte (.txt)
- Format ASCII avec séparateurs visuels
- Universel et léger
- Lisible sur tous les systèmes
- Idéal pour archivage

## Utilisation

### Côté utilisateur

1. Accéder à `/reports`
2. Sélectionner les listes souhaitées
3. Cliquer sur "Générer le rapport"
4. Choisir le format d'export
5. Le fichier est téléchargé automatiquement

### Côté développeur

```typescript
// Générer un rapport
const response = await fetch('/api/reports/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ listIds: ['id1', 'id2'] })
})

const reportData = await response.json()

// reportData contient toutes les données formatées
console.log(reportData.totalAlbums)
console.log(reportData.lists)
```

## Tests

Les tests unitaires couvrent:
- Génération de rapport avec données correctes
- Calcul du total d'albums
- Gestion des listes vides
- Formatage CSV
- Échappement des guillemets
- Formatage des dates

Exécuter les tests:
```bash
npm test -- __tests__/reports.test.ts
```

## Améliorations futures

1. **Export PDF natif serveur** avec bibliothèque comme `pdfkit` ou `jspdf`
2. **Inclusion des images** des couvertures d'albums
3. **Templates personnalisables** avec choix de styles
4. **Export Word/DOCX** pour édition
5. **Envoi automatique par email**
6. **Rapports planifiés** (hebdomadaires, mensuels)
7. **Graphiques et statistiques** avancées
8. **Export Excel natif** avec feuilles multiples

## Performance

- Optimisé pour grandes collections (50+ listes)
- Requêtes Prisma optimisées avec `include`
- Génération exports côté client (pas de surcharge serveur)
- Gestion des états de chargement

## Sécurité

- ✅ Authentification requise
- ✅ Vérification ownership des listes
- ✅ Validation des inputs
- ✅ Protection CSRF via NextAuth
- ✅ Pas de stockage des rapports (génération temps réel)

## Documentation

- **Technique:** [docs/REPORTS-FEATURE.md](../../docs/REPORTS-FEATURE.md)
- **Utilisateur:** [docs/GUIDE-RAPPORTS.md](../../docs/GUIDE-RAPPORTS.md)
- **Index docs:** [docs/README.md](../../docs/README.md)

## Support

Pour toute question ou problème, consultez la documentation ou ouvrez une issue sur GitHub.
