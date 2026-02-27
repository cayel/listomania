# Guide d'utilisation - Génération de Rapports

## Introduction

Cette fonctionnalité vous permet de créer des rapports professionnels regroupant plusieurs de vos listes d'albums. Idéal pour:
- Créer un document récapitulatif de votre collection
- Partager vos listes au format papier
- Analyser vos albums dans Excel
- Archiver vos listes

## Accès rapide

1. Cliquez sur **"Rapports"** dans le menu de navigation
2. Ou accédez directement à `/reports`

## Étape par étape

### 1. Filtrer et trier vos listes

Avant de sélectionner vos listes, vous pouvez affiner votre sélection avec les filtres :

#### 🔍 Filtres disponibles

**Cliquez sur "Filtres"** pour accéder au panneau de filtrage.

**Visibilité:**
- **Toutes** : Affiche toutes vos listes (publiques et privées)
- **Publiques** : Uniquement les listes visibles par tous
- **Privées** : Uniquement vos listes privées

**Catégorie:**
- Filtrez par catégorie (Rock, Jazz, Hip-Hop, etc.)
- La liste affiche uniquement les catégories que vous avez déjà utilisées

**Période:**
- Filtrez par période (2024, Années 90, etc.)
- La liste affiche uniquement les périodes que vous avez définies

#### 📊 Options de tri

**Trier par:**
- **Titre** : Ordre alphabétique des titres de listes
- **Dernière modification** : Listes récemment modifiées en premier
- **Nombre d'albums** : Du moins au plus grand nombre d'albums
- **Période** : Ordre chronologique des périodes

**Ordre:**
- **Croissant (A→Z)** : Ordre ascendant
- **Décroissant (Z→A)** : Ordre descendant

💡 **Astuce:** Le badge numéroté sur le bouton "Filtres" indique combien de filtres sont actifs. Utilisez "Réinitialiser les filtres" pour tout effacer.

### 2. Sélectionner vos listes

![Sélection de listes]

- Cochez les listes que vous souhaitez inclure dans votre rapport
- Utilisez **"Tout sélectionner"** pour gagner du temps
- Le compteur en temps réel affiche le nombre de listes sélectionnées
- Le titre affiche le nombre de listes visibles après filtrage

**Astuce:** Vous pouvez sélectionner autant de listes que vous le souhaitez !

### 3. Générer le rapport

Cliquez sur le bouton **"Générer le rapport"**

Le système va:
- ✅ Récupérer toutes vos listes
- ✅ Charger tous les albums avec leurs détails
- ✅ Organiser les données par liste
- ✅ Calculer les statistiques

Vous verrez ensuite:
- **Total d'albums:** Nombre total d'albums dans toutes les listes sélectionnées
- **Listes incluses:** Nombre de listes dans le rapport

**Note:** Le rapport respecte l'ordre de tri que vous avez choisi dans les filtres !

### 4. Exporter le rapport

Trois formats sont disponibles:

#### 📄 HTML (Impression)
**Recommandé pour:** Impression, partage professionnel

✨ **Avantages:**
- Design élégant et moderne avec grille de pochettes
- **Affichage visuel des pochettes d'albums**
- Cartes interactives avec effet de survol
- Format galerie responsive
- Parfait pour l'impression ou conversion en PDF
- Affichage adaptatif sur mobile

💡 **Comment l'utiliser:**
1. Cliquez sur "HTML (Impression)"
2. Le fichier HTML est téléchargé
3. Ouvrez-le dans votre navigateur
4. Admirez vos albums en mode galerie visuelle
5. Utilisez Ctrl+P (ou Cmd+P sur Mac) pour imprimer ou sauvegarder en PDF

🎨 **Rendu visuel:**
- Grille responsive de cartes d'albums
- Pochettes de 200x200px (150x150px sur mobile/impression)
- Position en badge coloré
- Titre, artiste et année clairement affichés
- Effet hover élégant sur desktop
- Fallback avec icône 🎵 si l'image n'est pas disponible

#### 📊 CSV (Excel)
**Recommandé pour:** Analyse de données, tableaux croisés

✨ **Avantages:**
- Compatible Excel, Google Sheets, Numbers
- Facile à trier et filtrer
- Idéal pour les statistiques

💡 **Comment l'utiliser:**
1. Cliquez sur "CSV (Excel)"
2. Le fichier .csv est téléchargé
3. Ouvrez-le avec Excel ou Google Sheets
4. Analysez vos données (comptage par année, par artiste, etc.)

**Format du CSV:**
```
Liste,Artiste,Titre,Année
"Mes favoris 2024","The Beatles","Abbey Road",1969
"Mes favoris 2024","Pink Floyd","The Dark Side of the Moon",1973
```

#### 📝 Texte (.txt)
**Recommandé pour:** Archivage, format universel

✨ **Avantages:**
- Léger et universel
- Lisible sur n'importe quel appareil
- Parfait pour l'archivage long terme
- Design ASCII élégant

💡 **Comment l'utiliser:**
1. Cliquez sur "Texte (.txt)"
2. Le fichier .txt est téléchargé
3. Ouvrez-le avec n'importe quel éditeur de texte

**Exemple de format:**
```
═══════════════════════════════════════════════════════
            RAPPORT DE LISTES RANKLIST
═══════════════════════════════════════════════════════

Généré le 26 février 2026
Nombre de listes: 3
Total d'albums: 45

─────────────────────────────────────────────────────
1. MES FAVORIS 2024
─────────────────────────────────────────────────────
Période: 2024
Nombre d'albums: 15

   1. The Beatles - Abbey Road (1969)
   2. Pink Floyd - The Dark Side of the Moon (1973)
   ...
```

## Cas d'usage concrets

### 📚 Créer un livre de vos meilleures listes (avec tri)

1. Utilisez le filtre **Catégorie** pour sélectionner "Favoris"
2. Triez par **Période** en ordre croissant
3. Sélectionnez les listes affichées
4. Générez le rapport
5. Exportez en **HTML**
6. Imprimez en PDF avec une mise en page soignée
7. Les listes seront ordonnées chronologiquement !

### 📊 Analyser votre collection par décennie

1. Utilisez le filtre **Période** pour sélectionner "Années 80"
2. Triez par **Nombre d'albums** décroissant
3. Générez et exportez en **CSV**
4. Analysez dans Excel pour voir quelles années dominent

### 🎯 Rapport des listes publiques uniquement

1. Utilisez le filtre **Visibilité** > "Publiques"
2. Triez par **Dernière modification**
3. Sélectionnez vos listes récentes
4. Générez et partagez le rapport HTML

### 📚 Créer un livre de vos meilleures listes

1. Sélectionnez vos 5-10 meilleures listes
2. Triez par **Titre** pour un ordre alphabétique
3. Générez le rapport
4. Exportez en **HTML**
5. Imprimez en PDF avec une mise en page soignée
6. Reliez le document ou partagez-le en PDF

### 📊 Analyser votre collection dans Excel

1. Filtrez par catégorie si besoin
2. Sélectionnez toutes les listes affichées
3. Générez le rapport
4. Exportez en **CSV**
5. Dans Excel:
   - Créez un tableau croisé dynamique
   - Analysez par année, par artiste
   - Créez des graphiques

### 💾 Archiver vos listes

1. Sélectionnez toutes vos listes
2. Générez le rapport
3. Exportez en **Texte**
4. Sauvegardez le fichier dans votre cloud ou disque dur
5. Le format texte garantit la lisibilité à long terme

### 📧 Partager avec des amis

1. Sélectionnez les listes à partager
2. Générez le rapport
3. Exportez en **HTML**
4. Envoyez par email ou partagez sur un drive

## Conseils et astuces

### ⚡ Optimiser la génération

- **Petites sélections:** Pour tester, commencez avec 1-2 listes
- **Grandes collections:** Pas de limite ! L'app gère même 50+ listes
- **Performance:** Le traitement est rapide grâce aux optimisations
- **Filtres intelligents:** Utilisez les filtres pour affiner rapidement votre sélection

### 🎯 Workflow optimal

1. **Définissez votre objectif** (archivage, partage, analyse)
2. **Appliquez les filtres** appropriés (visibilité, catégorie, période)
3. **Choisissez le tri** qui correspond à votre besoin
4. **Sélectionnez** les listes affichées
5. **Générez** et **exportez** dans le format adapté

### 🎨 Personnaliser vos rapports

Le format HTML est personnalisable:
1. Ouvrez le fichier HTML téléchargé dans un éditeur
2. Modifiez le CSS dans la section `<style>`
3. Changez les couleurs, les polices, la mise en page

### 📱 Utilisation mobile

L'interface est responsive et fonctionne parfaitement sur mobile:
- Naviguez facilement dans la liste
- Sélectionnez vos listes avec le pouce
- Générez et téléchargez directement sur votre téléphone

### 🔒 Confidentialité

- Seules **vos** listes sont accessibles
- Les rapports sont générés en temps réel (pas de stockage)
- Les exports sont locaux sur votre appareil
- Vos données restent privées

## Dépannage

### ❌ "Aucune liste disponible"

**Solution:** Créez d'abord des listes dans la section "Mes Listes"

### ❌ "Veuillez sélectionner au moins une liste"

**Solution:** Cochez au moins une liste avant de générer

### ❌ Le téléchargement ne démarre pas

**Solutions:**
1. Vérifiez que les popups ne sont pas bloquées
2. Essayez un autre navigateur
3. Vérifiez vos paramètres de téléchargement

### ❌ Le fichier CSV s'ouvre mal dans Excel

**Solution:**
1. Dans Excel: Fichier > Importer > Fichier CSV
2. Choisissez l'encodage **UTF-8**
3. Définissez le délimiteur comme **virgule**

### ❌ Les accents sont mal affichés

**Solution:**
- Pour CSV: Ouvrez avec encodage UTF-8
- Pour TXT: Utilisez un éditeur supportant UTF-8

## Questions fréquentes

**Q: Les filtres affectent-ils l'ordre dans le rapport exporté ?**  
R: Oui ! L'ordre de tri choisi est appliqué au rapport final. Si vous triez par période, vos listes seront exportées dans cet ordre.

**Q: Puis-je combiner plusieurs filtres ?**  
R: Absolument ! Par exemple, vous pouvez filtrer les listes publiques de la catégorie "Rock" de la période "Années 90".

**Q: Le compteur de listes change quand j'applique des filtres ?**  
R: Oui, il affiche "X sur Y" où X est le nombre de listes visibles après filtrage et Y est le total.

**Q: Les filtres sont-ils sauvegardés entre les sessions ?**  
R: Non, les filtres sont réinitialisés à chaque visite. Cela vous permet de repartir sur une base neutre.

**Q: Combien de listes puis-je inclure dans un rapport ?**  
R: Il n'y a pas de limite ! Le système gère efficacement même de très grandes collections.

**Q: Les images des albums sont-elles incluses ?**  
R: Actuellement, seules les informations textuelles sont incluses (artiste, titre, année). Les images pourraient être ajoutées dans une future version.

**Q: Puis-je modifier le rapport après export ?**  
R: Oui ! Le fichier HTML peut être édité. Le CSV peut être modifié dans Excel.

**Q: Le rapport inclut-il mes listes privées ?**  
R: Oui, toutes vos listes (publiques et privées) sont disponibles dans le générateur de rapports.

**Q: Puis-je automatiser la génération de rapports ?**  
R: Pas encore, mais cette fonctionnalité pourrait être ajoutée (rapports planifiés, envoi automatique par email, etc.).

**Q: Le rapport respecte-t-il l'ordre de mes albums ?**  
R: Oui, l'ordre de position est préservé dans le rapport.

## Pour aller plus loin

- Consultez [REPORTS-FEATURE.md](REPORTS-FEATURE.md) pour la documentation technique
- Explorez les autres fonctionnalités d'export dans [README.md](../README.md)
- Partagez vos suggestions d'amélioration sur GitHub Issues

---

**Besoin d'aide ?** N'hésitez pas à ouvrir une issue sur GitHub ou à nous contacter !
