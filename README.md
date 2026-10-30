# Atelier Tanana — landing page 3D

Landing page d'un commerçant d'artisanat malgache : étal de marché interactif en three.js (survol, examen et rotation des objets, ambiance matin/soir), fiches produits, panier et commande par message.

## Deux pages, deux sens de « tanana »

- `index.html` : **tànana**, la main. L'étal d'artisanat malgache.
- `tanana.html` : **tanàna**, le village, la ville. Le grand magasin de la construction, à visiter en 3D. On y trouve 9 rayons tenus par des fournisseurs (gros œuvre, menuiserie, sanitaire, électricité, outillage, extérieur, voirie, toiture et charpente, peinture et revêtements) et 67 articles en 3D. 55 viennent des bibliothèques gratuites de Sweet Home 3D (crédits : [assets/tanana/CREDITS.md](assets/tanana/CREDITS.md)). Les 12 matériaux de base (ciment, briques, parpaings, fer à béton, tôles, faîtières, planches, chevrons, peinture, carrelage, tuyaux PVC, câbles) sont modélisés directement en three.js. Les fiches des matériaux ont un calculateur de quantité, que l'assistante Hasina sait aussi utiliser : « ciment pour 20 m² de dalle ». Pour la visite : glisser pour regarder, cliquer au sol pour avancer, cliquer sur un article pour l'examiner. On peut aussi se déplacer avec la molette, ZQSD ou les flèches, et sauter d'un rayon à l'autre avec le plan.

### Catalogue HTML et devis de Tanàna

- **Catalogue HTML** : tous les rayons, fournisseurs et articles sont écrits en dur dans `tanana.html`, avec leurs données structurées pour Google (JSON-LD). Le contenu est donc lisible sans 3D ni JavaScript, par les moteurs de recherche, les lecteurs d'écran et les connexions lentes. On l'ouvre avec le bouton « Catalogue », le lien de l'écran d'entrée ou `tanana.html#catalogue`. Il s'affiche tout seul si la 3D ne peut pas se charger.
- **Après chaque changement d'article, de prix ou de fournisseur**, régénérer le catalogue :
  ```bash
  node tools/build-catalogue.js
  ```
- **Photos du catalogue** : une photo libre par article, venant de Wikimedia Commons (CC0, domaine public, CC BY, CC BY-SA). Elles sont dans `photos/tanana/`, avec auteur et licence dans `assets/tanana/photos.json`. Les crédits sont affichés sur chaque photo et dans « Crédits photos » en bas du catalogue. Pour chercher la photo d'un nouvel article : `node tools/fetch-photos.js`, puis vérifier le résultat à l'œil. Si la photo ne convient pas, fixer le bon fichier dans `PIN`. Relancer ensuite `node tools/build-catalogue.js`. Avant la mise en ligne, remplace ces photos d'illustration par les photos des vrais produits des fournisseurs.
- **Devis découpé par fournisseur** : chaque fournisseur reçoit sa propre demande par WhatsApp, avec le numéro `wa` de `SUPPLIERS`. Les numéros actuels `26134000000x` sont des exemples à remplacer. L'envoi groupé à l'accueil Tanàna utilise `WA_NUMBER`.

## Lancer en local

Ouvrez `index.html` dans un navigateur, ou servez le dossier :

```bash
npx serve .
```

Le décor réaliste (caisses de litchis et de patates douces, tabouret, poules, parasols, palmiers, brouette, tonneau…) se charge depuis `assets/models/`, ce qui demande un serveur : ouvert en double-cliquant sur `index.html`, l'étal s'affiche sans ce décor. En mode léger (mobile), seules la caisse et les litchis sont chargés (~3 Mo au lieu de ~7 Mo). Licences : [assets/models/CREDITS.md](assets/models/CREDITS.md).

## Technologies

- [three.js](https://threejs.org/) 0.147 (scène, OrbitControls)
- [Lenis](https://lenis.darkroom.engineering/) 1.1 (défilement fluide)
- Google Fonts : Gloock, Hanken Grotesk, JetBrains Mono

Les bibliothèques sont chargées depuis jsDelivr, aucune installation n'est nécessaire.

## Avant la mise en ligne

- Remplacer `https://atelier-tanana.example/` (balises `og:`, `canonical` et JSON-LD dans le `<head>`) par l'adresse réelle du site.
- Remplacer le numéro d'exemple : `WA_NUMBER` dans le script, le numéro affiché dans la section Commander et `telephone` dans le JSON-LD.
- `og-image.jpg` (1200 × 630) est l'aperçu affiché quand le lien est partagé sur WhatsApp ou Facebook ; `apple-touch-icon.png` est l'icône d'écran d'accueil.

## Contenu d'exemple

Les artisans, les six pièces hors étal (cabas, sets, couverts, écharpe, bracelets, plateau) et les témoignages sont **fictifs**. Avec `DEMO=true` dans le script, la mention « Contenu d'exemple » s'affiche sur ces sections. Avant la mise en ligne, remplace-les par le vrai contenu, puis passe `DEMO` à `false`.

Les photos de `photos/` sont des images d'exemple de Wikimedia Commons (CC0, domaine public, CC BY, CC BY-SA). Elles sont créditées dans le tableau `PHOTO_CREDITS` et affichées en pied de page sous « Crédits photos », comme les licences CC BY l'exigent. Quand tu remplaces une photo par la tienne, sous le même nom de fichier, supprime sa ligne dans `PHOTO_CREDITS`. Sans photo, une pièce de l'étal affiche son aperçu 3D (c'est le cas pour la soubique, la jarre, le zébu et le coffret).

## Ajouter le contenu réel

Tout se règle dans les données en haut du script de `index.html` ; une section reste masquée tant que son tableau est vide.

- **Photos produits** : déposer les images dans un dossier `photos/` (format 4:3, ~1200 px de large, JPG) et renseigner `photo:'photos/soubique.jpg'` dans `PRODUCTS`. L'aperçu 3D apparaît au survol, et la photo est ajoutée aux données Google.
- **Artisans** : ajouter des entrées à `ARTISANS` (nom, savoir-faire, village, portrait, citation), puis relier chaque produit avec `maker:'<id>'`. La section « Les mains » et son lien dans le menu apparaissent, et « Fait par… » s'affiche sur les cartes et les fiches.
- **Avis** : uniquement des avis réels, recopiés tels quels dans `REVIEWS`.
- **Livraison** : un tarif par ville dans `DELIVERY` (0 = gratuit). Il s'ajoute au total du panier et au message WhatsApp ; une ville absente reste « à confirmer ».

> Marque, prix et coordonnées d'exemple.
