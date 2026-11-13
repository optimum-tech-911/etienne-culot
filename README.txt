ÉTIENNE CULOT — VERSION LOCALE V5

Développement local. Aucun déploiement ni publication sans demande explicite de l’utilisateur. Ne pas utiliser ChatGPT Sites. Voir AGENTS.md.

LANCER
Prérequis : Node.js / npm et Python 3.
Depuis ce dossier : npm install (aucune dépendance à télécharger actuellement).
Depuis ce dossier : npm run dev
Ouvrir : http://127.0.0.1:4173/
Alternative : python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
Aucune dépendance JavaScript à installer. Python 3 sert les fichiers ; Node vérifie la syntaxe. Actualiser le navigateur après une modification.
Si le port 4173 est déjà utilisé, ouvrir l’aperçu existant ou arrêter l’ancien serveur avec Ctrl+C avant de relancer.

BUILD ET CLOUDFLARE PAGES
npm run build
Le site est déjà écrit dans dist/ : le build vérifie la syntaxe JavaScript, les fichiers locaux référencés et l’absence de fichiers privés dans le dossier public. Il ne supprime et ne réécrit pas dist/.
Réglages Cloudflare Pages pour un futur déploiement :
- Framework preset : None.
- Root directory : racine du dépôt (laisser vide).
- Build command : npm run build.
- Build output directory : dist.
- Production branch : main, si c’est la branche choisie pour publier.
- Variables d’environnement : aucune nécessaire.
Ne pas utiliser npm run dev comme commande de build. Les commandes npm de ce projet ne déploient rien.
Documentation : https://developers.cloudflare.com/pages/framework-guides/deploy-anything/

GIT ET FICHIERS PUBLICS
.gitignore exclut les dépendances, fichiers .env, clés privées, journaux et états locaux d’hébergement.
Conserver dist/, ses photographies, package.json, package-lock.json et scripts/ dans Git : dist/ est ici le code source du site, pas un dossier généré à ignorer.
Publier uniquement dist/, jamais la racine du dépôt. Tout fichier placé dans dist/ est public.
dist/_headers définit les en-têtes de sécurité Cloudflare Pages. Python ne les applique pas dans l’aperçu local.
Une exclusion Git ne retire pas les fichiers déjà suivis : .openai/hosting.json est une ancienne métadonnée d’hébergement déjà suivie, sans secret, inutile à Cloudflare Pages.

AVANT PUBLICATION
La page conserve volontairement la directive noindex,nofollow pour la proposition privée. La retirer de dist/index.html lorsque l’indexation publique sera souhaitée.
Valider les textes et les droits de réutilisation des photographies avec la cliente, comme indiqué dans SOURCES.txt.

ÉDITER
- dist/content.js : les huit créations, notes, dates, sources, couleurs et chapitres de l’atelier.
- dist/index.html : structure, photographies, textes et navigation.
- dist/style.css : composition responsive, typographie et animations.
- dist/app.js : gestes, dialogues, orbite des créations, atelier et boutique.
- DESIGN.md : direction visuelle et règles d’interaction.
- SOURCES.txt : provenance des photographies.

INTERACTIONS
- Navigation : libellés simples, sans numérotation visible. Menu plein écran prune avec dévoilement animé, liens décalés et aperçu photographique lorsque l’espace le permet.
- Scène d’ouverture : huit choix ; la création active et ses deux voisines occupent le premier plan. Les photographies flottent en perspective CSS. Glissement horizontal, choix directs et clavier ; toucher la création active ouvre sa photographie.
- Les gourmandises : huit créations visibles dans une collection photographique, en deux colonnes sur téléphone, trois sur tablette et quatre sur grand écran. Chaque carte ouvre la photographie et ses informations.
- Un peu de culot : les huit photographies parcourent une orbite circulaire en profondeur, avec socles, éclairage et couleur d’ambiance. Le défilement vertical ordinaire traverse une section de 270 svh sur téléphone, 280 svh sur grand écran, avec hauteurs minimales. Les vignettes, le glissement horizontal et le clavier permettent aussi de choisir ; une sélection directe suit le chemin circulaire le plus court. Après une sélection manuelle, le défilement continue depuis la position choisie. Le pointeur ajoute une légère inclinaison sur ordinateur. Sans JavaScript ou en mode réduit, les créations restent dans une collection statique.
- Détail : photographie entière par défaut ; agrandissement volontaire, navigation entre les créations, transitions décodées, ouverture et fermeture animées, Échap, confinement et restauration du focus.
- Atelier : sélecteur coulissant entre « Le savoir-faire » et « L’équipe », fondu entre photographies ; chapitres liés au défilement sur grand écran, contrôles et glissement sur téléphone.
- Boutique : une fenêtre photographique s’ouvre par deux volets au défilement. Deux vues sélectionnables, fondu après décodage et photographie complète agrandie dans un dialogue. Un carton d’adresse réunit copie de l’adresse, itinéraire et téléphone.
- Le raccourci mobile s’efface dans l’expérience en orbite et dans la boutique pour laisser les photographies et commandes accessibles.
- Ruban et mouvement : le ruban défile lorsqu’il est visible. « Pause » et la commande du pied de page partagent un réglage global mémorisé. Le réglage système de réduction des animations est respecté ; les transitions JavaScript en cours sont aussi annulées, sans bloquer la fermeture des dialogues.

PHOTOGRAPHIES
Huit créations réelles, publiées dans les archives de la maison : figue–fleur d’oranger, brioche chocolat–passion, coing–vanille, douceur chocolat–passion–noisette, flan pistache, forêt noire, tropézienne figue–cacahuète et pêche–poivre.
Originaux produits : largeur 1440 px ; hauteurs 1920, 1919 ou 1734 px.
Atelier : originaux 1600 × 1200, Clément Berthet / Le Dauphiné Libéré.
Boutique : deux originaux OCF ; photographie principale 2016 × 1512.
La profondeur utilise de vraies photographies et des transformations CSS 3D ; les pâtisseries ne sont pas des modèles 3D reconstruits.
Les archives ne constituent pas une promesse de disponibilité actuelle ni un classement de meilleures ventes. Cette proposition reste indépendante du commerce ; les contenus et les droits de réutilisation commerciale seront à valider avec la cliente.

VÉRIFICATION
npm run check
Mise en page inspectée dans le navigateur à 320, 390, 600 et 1440 px. Vérifiés : huit produits, ouverture et boucle du détail, orbite au défilement après sélection manuelle, choix directs, geste horizontal sans ouverture accidentelle, deux vues de boutique, agrandissement, Échap et retour du focus, réduction puis restauration des animations et du parcours clavier. Copie de l’adresse non déclenchée pendant ces essais. La simulation ne remplace pas les essais sur téléphone physique.
