# Modèles 3D du magasin Tanàna

Les 55 articles du magasin (`tanana.html`) viennent des bibliothèques gratuites de [Sweet Home 3D](https://www.sweethome3d.com/fr/modeles-3d-gratuits/), version 1.9.3. Ils sont utilisés tels quels, seulement mis à l'échelle de leurs dimensions réelles.

| Dossier | Bibliothèque | Licence |
|---|---|---|
| `Contributions/` | Contributeurs Sweet Home 3D | [Licence Art Libre 1.3](https://artlibre.org/licence/lal/) (certains modèles sous double licence Art Libre / CC-BY) |
| `Scopia/` | Scopia | [CC-BY](https://creativecommons.org/licenses/by/4.0/deed.fr) |
| `KatorLegaz/` | Kator Legaz | [CC-BY](https://creativecommons.org/licenses/by/4.0/deed.fr) |
| `BlendSwap-CC-BY/` | Contributeurs Blend Swap | [CC-BY](https://creativecommons.org/licenses/by/4.0/deed.fr) |

Personnage (dossier `Reallusion/`) : l'hôtesse d'accueil Hasina (`female03`), de la bibliothèque Reallusion de Sweet Home 3D, sous [CC-BY](https://creativecommons.org/licenses/by/4.0/deed.fr) (auteur : Reallusion).

Toutes ces licences autorisent l'usage commercial à condition de citer l'auteur. Le site le fait de deux façons :

- sur chaque fiche article (« Modèle 3D : auteur · licence ») ;
- dans la liste complète, sous « Fournisseurs → Crédits des modèles 3D ».

Auteurs principaux : Scopia, Kator Legaz, Ola-Kristian Hoff, Seber Rider, Pencilart, Sophie, Venceslas, Starapple, Victorbied, Jay-Artist & Emmanuel Puybaret.

Pour le site, chaque modèle est converti en `.glb` compressé avec [gltfpack](https://github.com/zeux/meshoptimizer) (compression meshopt) : 2,3 Mo au lieu de 8,8 Mo. Les fichiers `.obj`, `.mtl` et les textures d'origine sont conservés. Ce sont les sources des modèles, et la page s'en sert en secours si un `.glb` ne se charge pas.

Une seule modification : dans `Scopia/rectangle-swimming-pool/rectangle-swimming-pool.mtl`, une ligne de texture pointait vers un chemin absolu de l'ordinateur de l'auteur. Elle a été retirée.
