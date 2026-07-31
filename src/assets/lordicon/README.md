# Icônes animées Lordicon

Déposez ici les fichiers JSON téléchargés depuis [lordicon.com](https://lordicon.com),
en respectant **exactement** ces noms de fichiers :

| Fichier attendu | Où il apparaît | Repli lucide si absent |
|---|---|---|
| `heart.json` | Bouton favori d'une annonce | `Heart` |
| `search-empty.json` | Aucune annonce ne correspond aux filtres | `SearchX` |
| `loading.json` | Chargement d'une page de résultats | `Loader2` |
| `filter.json` | Bouton « Filtres » (mobile) | `SlidersHorizontal` |
| `map-pin.json` | Sélecteur de ville | `MapPin` |

Aucun fichier n'est obligatoire : tant qu'un JSON est absent, l'icône lucide
correspondante s'affiche et l'interface reste complète. Ajoutez-les au fur et à
mesure, sans toucher au code.

## Comment obtenir un fichier

1. Ouvrez l'icône sur lordicon.com.
2. Bouton **Download** → format **Lottie (.json)**.
3. Renommez le fichier selon le tableau ci-dessus et placez-le dans ce dossier.

Vite les détecte automatiquement (`import.meta.glob` dans
`src/components/ui/AnimatedIcon.tsx`) : un simple redémarrage du serveur de
développement suffit.

## Licence — à vérifier avant mise en production

Les icônes gratuites de Lordicon imposent un **lien d'attribution** vers
lordicon.com. Pour un usage commercial sans attribution, un abonnement payant
est requis. eLocation étant une plateforme commerciale, tranchez ce point avant
le déploiement : soit vous prenez la licence, soit vous ajoutez l'attribution
en pied de page, soit vous restez sur les icônes lucide (licence ISC, libres).
