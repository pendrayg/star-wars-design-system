# Star Wars design system

Un design system **nativement Star Wars** : les jetons, le CSS et les composants React, avec une
page de démonstration. Mêmes composants et même échelle que
[`@pendrayg/neomorphism-design-system`](https://github.com/pendrayg/neomorphism-design-system), mais
plus une ombre : chaque commande est cernée d'un **tube néon**. Et des **pilules**, deux
**polices du générique**, un bestiaire de **157 glyphes**, le grain d'un **écran cathodique**, des
**projections holographiques** et un **saut en hyperespace** entre deux états. Publié sur npm sous
[`@pendrayg/star-wars-design-system`](https://www.npmjs.com/package/@pendrayg/star-wars-design-system),
en PolyForm Noncommercial : qui s'en sert pour un projet non commercial n'a qu'à l'installer.

## Principes

- **Deux niveaux, deux thèmes.** Au repos, une commande est **allumée** : liseré néon et halo
  doux ; active (pressée, cochée, engagée, destination courante), elle est **plein feu**. Le thème
  suit l'appareil (sombre par défaut) ; `data-theme="dark"` ou `"light"` sur `<html>` le force.
- **La lumière ne dit que l'interaction.** Ce qui se presse porte un tube ; une **zone** (panneau,
  liste, message) n'a qu'une bordure fine.
- **Actif = bleu.** C'est le premier principe du DS : le **bleu** des hologrammes
  (`--neon-lit-color`) est réservé à ce qui est **actif** — bouton allumé, bascule enclenchée,
  champ engagé, case cochée, élément choisi, section dépliée, destination courante. Tout le reste
  est **ambre** au repos (`--neon-color`). Un bouton principal ou un lien n'est donc plus bleu au
  repos : il se distingue par un libellé en pleine encre ambre. Le danger reste rouge, actif ou
  non. Les données aussi sont ambre par défaut (`--chart-ink`) : une courbe ou un camembert
  bleus se liraient comme sélectionnés.
- **Un tube néon, le même partout.** Boutons, champs, case à cocher, recherche, cadre de la barre
  de menu et sa pastille, chaton d'un bouton serti : tous sont cernés du **même tube** — un trait
  ambre (`--grad-solar-to`) de **2,5 px** posé en dedans, pour ne rien pousser, et son halo de
  **12 px** au-dehors. C'est le bord du châssis de visée (`.ds-frame`), à la même mesure : une
  seule largeur de trait et de néon dans tout le DS — commandes, zones, lectures, châssis.
  `.ds-primary` brille au glacier, `.ds-danger` au rouge. La recette s'écrit une fois (`neon.css`)
  et se règle par `--neon-color`, `--neon-width` et `--neon-blur` ; `.ds-neon` la donne à n'importe quel bloc d'une app, et
  `--lit: 1` le met plein feu.
- **Une gouttière pour le halo.** Il n'y a plus d'ombre à loger, mais un halo, qui porte à peu
  près aussi loin. La gouttière d'avant tombe donc encore juste : **72 px × k**, k = **1/3** pour
  une commande ordinaire, **1/2** pour une grande (barre de menu, recherche) — **multiplié par
  `--neu-density`** (1 au doigt, **2/3** à la souris) —, soit 24 / 36 px au doigt et
  **16 / 24 px à la souris** (`--shadow-room` / `-lg`). Les apps la posent en marge et en `gap` :
  un halo rogné, ou recouvert par la commande voisine, se lirait comme un tube cassé.
- **Plein feu, sans rebond.** Rien ne s'enfonce : on appuie, ça brille plus fort et ça passe
  **au bleu** — le halo se densifie (55 → 100 %, sans s'élargir), un voile de lumière passe en
  dedans, et le tube comme le texte virent du jaune (`--neon-color`) au bleu des hologrammes
  (`--neon-lit-color`). Le danger reste rouge. Un nombre enregistré le pilote, `--lit` (0 au
  repos, 1 plein feu), qui passe de l'un à l'autre **en clignotant**, dans les deux sens : chaque
  éclat bleu, chaque raté jaune, sur une courbe de transition à paliers qui ne prend que 0 et 1
  (`--lit-flicker`, un `linear()`), en 0,6 s. Un **bouton d'action** s'allume ainsi au clic,
  reste bleu **une seconde** (`PRESS_HOLD_MS`) pour dire que le clic est pris, puis revient au
  jaune ; une **bascule** reste bleue tant qu'elle est active. Sans `linear()`, la lumière monte
  en 80 ms et pâlit en 250.
- **Ce qui apparaît s'amorce.** Une commande qui paraît (grille, section dépliante) ne monte pas
  du fond : son néon **s'amorce**, comme un tube qu'on allume — deux ratés, une retombée, puis il
  tient —, en coupures franches (`steps`). Au repli, la même chose à l'envers : il vacille et
  s'éteint. `--pop` (0 éteint, 1 allumé) est hérité : l'animer sur une commande allume aussi son
  calque de néon et son chaton. Les animations passent par des nombres enregistrés
  (`@property --lit`, `--pop`, `--menu-at`) : Safari n'interpole pas des listes de `box-shadow`
  écrites en variables.
- **Deux échelles, choisies par le POINTEUR.** Le DS a été dessiné pour le pouce ; à la souris, qui
  vise au pixel, la même maquette est trop grosse. L'échelle **compacte** (commande de
  **33 px**) est donc le **défaut**, et l'échelle **confortable** (**50 px**, la maquette au pixel
  près) revient sur `@media (pointer: coarse)` — doigt, stylet. Pas de `resolution` / `dppx` : un
  écran Retina est un écran de bureau, et se vise à la souris. `data-density="compact"` ou
  `"comfortable"` sur `<html>` force l'une ou l'autre, comme `data-theme` force le thème.

  Six jetons littéraux par échelle, **tout le reste en découle** :

  | jeton | confortable (doigt) | compact (souris) |
  |---|---|---|
  | `--control-height` (= `-lg`) | 50 | 33 |
  | `--control-pad` — la marge d'un cadre | 8 | 5 |
  | `--control-icon` — le glyphe d'une commande | 20 | 18 |
  | `--control-check` — la case à cocher | 22 | 18 |
  | `--control-radius` | 14 | 9 |
  | `--neu-density` — l'échelle de la gouttière | 1 | `calc(2 / 3)` |
  | *dérivé* `--control-inner` (hauteur − 2 marges) | 34 | 23 |
  | *dérivé* `--control-radius-inner` (rayon − marge) | 6 | 4 |
  | *dérivé* `--shadow-room` / `-lg` | 24 / 36 | 16 / 24 |

  **Le rapport est 2/3, pas la moitié.** Une commande de 25 px faisait trop petit à l'écran. Et
  les deux tiers sont le seul rapport simple qui rende `--shadow-room` **entier aux deux k**
  (72 × 1/3 × 2/3 = 16, 72 × 1/2 × 2/3 = 24), ce que ni 0,625 ni 0,66 ne font : ce n'est pas une
  ombre mais une **gouttière de mise en page**, posée en marge et en `gap` par les apps, elle doit
  tomber juste. D'où `calc(2 / 3)`, écrit en fraction et non en décimale.

  **La typographie ne bouge pas** : 14 / 15 / 16 px restent lisibles à 60 cm, et c'est pourquoi
  l'échelle n'est pas un simple multiplicateur. Les glyphes ne suivent pas non plus le rapport des
  boîtes (18, et non 13) : ils vivent avec un texte resté à 14 px.

  Les jetons dérivés sont déclarés **sur le même élément** que les primitives : une densité par
  sous-arbre n'est pas supportée (le `calc()` y serait déjà substitué). La densité est une affaire
  de racine.
- **Une hauteur, et un cadre fait ce qu'il loge plus ses deux marges.** C'est tout l'invariant, et
  il n'a qu'une question : *ce qui est dedans, est-ce qu'on le PRESSE ou est-ce qu'on le LIT ?*

  **Ce qu'on presse pour agir est une commande et fait `--control-height`** (33 / 50) — bouton,
  lien d'action, bouton-icône, champ, sélecteur, logo et nom, **destination de la barre de menu,
  choix du sélecteur plat** ; les tuiles à image sont des carrés du même côté. **Ce qu'on lit ou ce
  dans quoi on écrit est un contenu et fait `--control-inner`** (23 / 34).

  Un cadre ne rapetisse donc jamais ce qu'il loge pour s'aligner sur le bouton d'à côté : la cible
  offerte au pointeur passe avant le bord. Les deux cadres qui logent des commandes — barre de menu
  et sélecteur plat — font une hauteur de commande *plus* leurs deux marges, **43 / 66 px**. **Seule
  la recherche loge un contenu** (son champ, où l'on écrit), et c'est le seul cadre qui retombe sur
  `--control-height` tout compris, 33 / 50. Son bouton Effacer n'est pas une exception à la règle :
  il est l'accessoire du champ et prend sa taille, `--control-inner`.

  | | ce qu'il loge | le logé | le cadre |
  |---|---|---|---|
  | `MenuBar` | des destinations, des **commandes** | `--control-height` | 43 / 66 |
  | `FlatSelector` | des choix, des **commandes** | `--control-height` | 43 / 66 |
  | `SearchField` | un champ, du **contenu** (+ son bouton Effacer) | `--control-inner` | 33 / 50 |
- **Un sous-menu, c'est `FlatSelector`.** Toute bascule entre contenus d'un même écran — Build /
  Run, Courant / Priorisation, une période, un mode d'affichage — **se fait avec le sélecteur
  multiple plat du DS, et avec rien d'autre** : pas de « segmented toggle » maison, pas de rangée de
  boutons dont on allume le courant. La règle de partage est simple : **`MenuBar` dit où l'on est
  dans l'app, `FlatSelector` dit ce qu'on regarde là où l'on est.** Les deux partagent la même
  mécanique (`PillBar`) — cadre cerné de néon, pastille plein feu qui s'étire jusqu'au nouveau
  choix puis se rétracte de l'ancien —, si bien qu'un sous-menu refait à la main ne sera jamais que
  cette mécanique en moins bien : pastille qui glisse au lieu de s'étirer, hauteurs hors échelle,
  néon hors recette, et une seconde grammaire à maintenir à côté de la première.
- **Des pilules, et ce qui est carré est rond.** `--control-radius` n'est plus un nombre par
  échelle (9 et 14) mais une **règle** : **la moitié de la hauteur**, déclarée une fois dans les
  dérivés — **16,5 px** à la souris, **25** au doigt. Tout ce qui fait la hauteur d'une commande
  est donc une pilule, et ce qui est logé dans un cadre garde rayon − marge
  (`--control-radius-inner`), ce qui vaut **exactement la moitié de `--control-inner`** : le logé
  est pilule **par construction**, sans second calcul. Un cadre, qui fait son contenu plus ses deux
  marges, prend rayon + marge — **21,5 / 33 px** pour la barre de menu.

  Corollaire : **ce qui est carré est rond** (`50%`), puisque la pilule d'un carré est le disque —
  la case à cocher, les tuiles à image, leur image, le chaton serti. Les rayons proportionnels
  écrits à la main (0,18 d'une tuile, 0,2 d'un chaton, 0,318 d'une case) ont disparu avec eux.

  Les **zones** font exception, et c'est voulu : **3 px**, presque carré. Une zone qui imiterait la
  pilule disputerait sa forme aux commandes ; un panneau de cockpit n'est pas une touche, et ce
  contraste suffit à dire, d'un coup d'œil, ce qui s'actionne et ce qui se lit.
- **Deux polices, une graisse.** Le corps prend la **SF Distant Galaxy** (`--font-body`), les
  titres et les commandes son **Alternate** (`--font-title`) : des mots courts et capitaux ont la
  place de la variante large, un paragraphe entier s'y lirait comme une affiche. Aucune des deux
  n'a de gras — les sept `font-weight: 700` du DS sont tombés à `400`, parce qu'une graisse
  **simulée** par le navigateur épaissit le tracé et en brouille les contre-formes. Sans
  `!important` : rien ne les concurrence. La troisième police, la **Starwars Kit**, n'écrit pas des
  lettres mais des **coques de vaisseaux** : elle est exposée en jeton (`--font-hull`) et n'habille
  rien par défaut.
- **Une zone est un panneau d'instrument.** Liseré **ambre** de 1 px, halo (`--glow-amber`), encre
  ambre, fond assombri de 8 % — rendu au fond nu en thème clair, où ces 8 % viraient au gris.
- **Deux polices d'icônes, un seul composant.** `Icon` choisit la famille d'après le **nom** :
  les 58 symboles d'interface de `ICONS` (Symbols Nerd Font) et les **157 glyphes** de `GLYPHS`
  (Star Wars GlyphIcons) sont deux listes **disjointes** — un test le garde —, si bien que
  `<Icon name="xwing"/>` s'écrit comme `<Icon name="close"/>`. Toutes les props `icon` du DS
  (`Button`, `IconButton`, `Disclosure`, `MenuBar`, `FlatSelector`, `RichTextField`) acceptent les
  deux, via `AnyIconName`.
- **Le décor se pose par-dessus tout, et il s'éteint.** Les **rayures** d'un tube cathodique
  couvrent la page (`body::after`, z-index 9999), animées par deux périodes **premières entre
  elles** — 17 s de dérive, 23 s de clignotement : elles ne se réalignent qu'au bout de près de
  sept minutes. `data-scanlines="off"` sur `<html>` les éteint, même grammaire que `data-theme` et
  `data-density`. En thème clair, le grain passe en bleu nuit et trois fois plus discret.
- **Un hologramme rayonne et décroche.** `.ds-holo` teinte en glacier, pose `--glow-holo` et joue
  `--holo-anim` — 13 s, **premier** avec les 17 et 23 s des rayures. Le décrochage n'est pas
  aléatoire : ses images-clés sont irrégulières et très rapprochées (~40 ms), en `steps(1, end)`,
  comme un tube néon qui amorce mal. La **phase** appartient à l'app (`--holo-delay`), et elle doit
  être **dérivée** d'une donnée stable — un `Math.random()` rejouerait à chaque rendu.
  `HoloEmitter` ajoute le socle et le faisceau : le faisceau décroche avec le sujet, **jamais le
  socle**, qui est une pièce matérielle. Sa **taille** tient dans un seul `font-size`, posé sur
  l'émetteur (2,4 rem par défaut) : le sujet l'hérite et vaut 1 em, le socle et le faisceau sont
  mesurés en `em` — régler cette valeur met toute la projection à l'échelle.
- **La visée a son propre vocabulaire.** `Frame` est le **bord de l'écran** : trait ambre de
  2,5 px, rayon de **26 px** — le seul du DS à ce rayon, il n'est ni une commande ni une zone —,
  halo fort et voile interne, qu'un balayage rouge parcourt **une seule fois**. `Readout` est le
  panneau d'instrument, et ses chiffres (`digits`) passent au rouge : **l'encre dit le rôle**.
- **Une cible tactile fait 44 px — sur pointeur grossier**, et c'est là que la règle s'applique. Les
  commandes y sont par leur hauteur (50 px) ; la case à cocher, seule exception à 22 px, y arrive
  par un débord invisible de sa zone sensible, déduit de sa taille (`(44px - --control-check) / -2`)
  et posé sous `@media (pointer: coarse)`. À la souris, les commandes font 33 px et la case 18, sans
  débord : un curseur vise juste. Le débord se déduisant de la case, il suit même un
  `data-density="compact"` forcé sur un écran tactile : case de 18, débord de −13, cible de 44.
- **Un clic se voit** : un bouton d'action reste allumé, bleu, **une seconde** (`PRESS_HOLD_MS`),
  puis clignote vers son repos jaune (`usePress`, classe `ds-pressed`). Le texte et l'icône
  passent au bleu avec le tube : `TextButton` loge son libellé dans un `<span class="ds-label">`,
  qui hérite de `--lit` image par image.
- **Le néon d'un bouton est un élément** (`<span class="ds-shade">`, rendu par les composants ;
  `Shade` pour un bouton écrit à la main), pas un pseudo-élément : il hérite des nombres animés du
  bouton (`--lit`, `--pop`), ce que Safari ne fait pas pour `::after`.
- **Un bouton plat (`.ds-flat`) n'a pas de tube au repos** : il ne s'allume que pressé ou actif.
- **Un graphique n'est ni une commande ni une zone.** Sa lumière tient dans `ChartFilters`.
- **Une marque de graphique est un tube néon, point** — qu'elle soit un trait, une aire, un symbole
  de nuage, un rectangle de barre ou une part de camembert : elle rayonne de **sa propre teinte**,
  comme un hologramme. Plus de gravure ni de rainure. Et **toutes** les séries, non la seule
  principale : toutes les marques d'un graphique disent la même chose, elles doivent la dire de la
  même façon. Deux halos, un seul seuil, **3 px** :
  - `#ds-chart-groove` — **le halo d'un trait** (1 à 2 px : courbe, contour d'aire, ligne de
    référence) : le trait flouté, posé **deux fois** sous lui — un trait mince ne retient qu'une
    petite part de son flou, et à une seule couche il n'en restait qu'un voile ;
  - `#ds-chart-groove-fill` — **le halo d'une marque pleine** (3 px et plus : symbole, barre,
    part) : le même flou, posé une fois et à 60 % — une marque pleine retient tout le sien, et au
    dosage d'un trait une barre rayonnerait trois fois plus que la courbe d'à côté ;
  - `#ds-chart-set` — **le châssis du graphique** : un liseré néon de 2,5 px autour de la
    silhouette **entière** (un camembert, une carte), à la teinte des commandes (`--neon-color`),
    et son halo. Il habille le graphique entier, jamais une marque ;
  - `#ds-chart-shadow` — **déprécié** : il rend désormais le halo d'un trait, pour qu'une app qui
    le cite encore reste dans le ton, et sera retiré.
- **Les encres par défaut d'un graphique sont ambre.** `.ds-chart-line` pour une courbe : un
  trait de 2 px à `--chart-ink` (l'ambre du néon). `.ds-chart-part` pour une marque pleine (part
  de camembert, barre, aire) : remplie de `--chart-fill`, l'ambre à 22 % de transparence, et cernée
  du trait plein du néon (`--neon-width`) — deux parts voisines se séparent par leur liseré. Des
  classes, pas des attributs, pour que le thème change l'encre ; une app qui distingue des séries
  pose ses propres teintes, **jamais le bleu**, qui dirait « sélectionné ».

  Les identifiants sont ceux d'avant : une app qui les cite n'a rien à changer.
- **Un filtre se cite en attribut, jamais par une règle CSS.** WebKit résout le fragment d'un
  `url(#…)` écrit dans une feuille séparée contre l'URL de la feuille et non contre celle du
  document : le filtre disparaît alors sans la moindre erreur.
- **Ce qui se déplie se déplie comme la grille.** Une `Disclosure` reprend le système de la
  `FoldingGrid` pour un contenu quelconque : un intitulé toujours visible, le contenu replié, et
  dessous le même chevron, allumé tant que tout est affiché. Le dépli va ligne par ligne — le
  cadre pousse la page pour faire la place d'une ligne, puis le néon de ses commandes s'amorce,
  pendant que la suivante se découvre —, et le repli est le dépli à l'envers, depuis le bas. Il
  part DÈS L'APPUI : le cadre remonte aussitôt, et les commandes d'une ligne s'éteignent pendant
  qu'il la recouvre (`revealBackSchedule`) — la grille, elle, attend que ses boutons soient éteints. Les lignes d'un
  formulaire ne sont pas données comme celles d'une grille : elles sont relevées dans la mise en
  page (`foldLines`) — un titre, un champ avec son libellé, une note, ou une rangée de commandes
  côte à côte, qui s'amorcent ensemble. Un texte se découvre sans s'amorcer, en fondu : seul ce
  qui s'actionne a un tube à allumer. Au-delà de quatre lignes, les poussées se resserrent pour que le dépli
  entier tienne dans le temps de quatre lignes de grille (`foldPush`) : trente poussées de 0,3 s
  feraient neuf secondes.
- **Ce qui paraît se déplie, il ne surgit pas.** Quand c'est l'état qui fait paraître un
  contenu — les actions d'une sélection, un message —, il se déplie comme une section dépliante
  dont l'état tiendrait le chevron : `Reveal`, la section dépliante cachée, qui est aussi le
  moteur de `Disclosure`. Il garde ce qu'il affichait le temps de son repli : une barre
  d'actions qui s'en va n'annonce pas « 0 sélectionnée ».
- **La section peut être le bouton.** `DisclosureButton` est une section en forme de bouton large,
  de toute la largeur : repliée, un bouton cerné de son liseré qui ne montre que son en-tête —
  icône, intitulé, indication, et un chevron qui se retourne. Un appui sur l'en-tête met le bouton
  tout entier plein feu, comme une bascule, et le déplie : le contenu paraît DANS le bouton, sous
  l'en-tête, dans le même tube, rentré de sa marge intérieure. Un second appui le replie : le
  contenu rentre ligne par ligne depuis le bas, et le bouton ne se rétracte d'une ligne qu'une
  fois elle rentrée et partie (`retractFirst` de `Reveal`) ; il ne pâlit qu'une fois tout rentré.
  Seul l'en-tête s'actionne — le contenu porte ses propres commandes, qu'un bouton ne peut pas
  contenir —, et le néon est peint sous le contenu : le voile qui monte en dedans au plein feu ne
  couvre pas ses champs.
- **Une section dépliée peut s'allumer.** Avec `sunken`, une `Disclosure` dépliée s'allume tout
  entière — intitulé, contenu, chevron —, du néon plein feu d'un élément choisi (`Selectable`) :
  l'ouverture se lit à la région, plus seulement au chevron. Au repli, elle reste allumée le temps
  que le contenu rentre et ne pâlit qu'à la fin (`Reveal` prévient alors par `onFolded`). Repliée,
  elle est éteinte, et sa marge, prise d'avance et rendue par une marge négative, la garde alignée
  sur ses voisines : rien ne bouge quand elle s'allume. Deux sections allumées côte à côte
  demandent à la page un écart d'au moins deux marges (24 px), pour que leurs halos ne se touchent
  pas.
- **Ce qui est choisi s'allume, il ne se teint pas.** Le néon dit l'état, ici comme ailleurs : un
  élément choisi (`Selectable`) prend le tube plein feu, du même geste que le bouton qui le choisit
  (`SelectToggle`, un bouton-icône à bascule — case vide, puis cochée et plein feu), `--lit` montant
  vite et pâlissant plus lentement. Au repos, **pas de tube** : l'élément n'est pas une commande,
  c'est une région de la page qui s'allume, pas une touche. Il porte d'avance la marge et les
  coins de son tube : rien ne bouge quand il s'allume.
- **Supprimer se fait en deux appuis, sans boîte de dialogue** (`DeleteButton`). Au repos, la
  poubelle est à l'encre des commandes, comme tout bouton-icône : en rouge, chaque ligne d'une
  liste serait une alerte. Le premier appui allume le bouton, comme tout appui, et
  l'**arme** : la poubelle passe au rouge du danger, et son tube avec elle. Le second supprime. La confirmation est là
  où était le doigt, rien d'autre ne bouge. Armé, il désarme de lui-même au bout de
  `DELETE_ARM_MS` (3 s) ou dès qu'on touche ailleurs, et son nom accessible devient
  « Confirmer : … ». Avec `withLabel`, c'est un bouton à libellé — la poubelle puis le nom —,
  pour une suppression qui doit se lire avant d'être touchée (« Tout effacer ») ; le nom rougit
  avec la poubelle, et ne change pas, pour que le bouton garde sa largeur.
- **Les images ne remplacent jamais la surface d'un bouton.** Elles en sont le contenu, posées
  au-dessus de son néon — le voile du plein feu se dessine autour d'elle, jamais par-dessus :
  pastille, sertie (dans un chaton cerclé de son propre tube, qui s'allume avec celui du bouton),
  logo et nom, ou logo serti et nom.
- **On ne bascule pas, on SAUTE.** Un changement d'état qui repeint toute la page — le thème, le
  skin, la langue — passe par un **saut en hyperespace** : `useHyperspaceJump(cible)` garde
  l'ancienne valeur pendant l'accélération et ne livre la nouvelle qu'à **l'entrée en croisière**,
  quand l'écran est entièrement couvert. Le spectateur ne découvre le changement qu'en sortant.

  ```tsx
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const { phase, value } = useHyperspaceJump(theme)
  useEffect(() => { document.documentElement.dataset.theme = value }, [value])

  return (
    <>
      {phase && <HyperspaceJump phase={phase} />}
      <Button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>Thème</Button>
    </>
  )
  ```

  Une app qui bascule entre le DS **néomorphique** et celui-ci fait exactement pareil : elle
  enveloppe sa bascule dans `useHyperspaceJump` et rend `<HyperspaceJump phase={phase}/>` tant que
  `phase` n'est pas `null`. Le hook est **générique** (`<T>(target: T) => { phase, value }`) : ce
  qu'il retarde ne le regarde pas. 1,4 s en tout (400 / 800 / 200 ms, `JUMP_DURATIONS`), un champ
  de 900 étoiles peint au `<canvas>` — neuf cents traits par frame seraient neuf cents nœuds DOM —,
  la page inerte le temps du saut, et **aucun saut au montage** : recharger avec la valeur déjà
  posée ne rejoue rien. En `prefers-reduced-motion` comme en test, la bascule est immédiate.

## Contenu

| Composant | Rôle |
| --- | --- |
| `Button`, `IconButton` | bouton à libellé (tons défaut, primaire, danger, lien) et bouton-icône |
| `ImageButton` | bouton à image : `chip` (pastille), `set` (sertie), `label` (logo et nom), `label-set` (logo serti et nom) |
| `SetImage` | image sertie hors bouton (un portrait) : le chaton seul, cerclé de son tube, initiales à défaut d'image |
| `Input`, `Select`, `Checkbox` | champs, liseré néon au repos, plein feu engagés (ou cochée) |
| `SearchField` | champ de recherche, loupe qui s'allume, bouton Effacer |
| `MenuBar` | barre de menu cernée de néon, pastille plein feu qui s'étire sous la destination courante — *où l'on est dans l'app* |
| `FlatSelector` | **le sous-menu du DS** : un choix parmi quelques-uns, même cadre et même pastille — *ce qu'on regarde là où l'on est*. Toute bascule entre contenus passe par lui ; `multiline`, ses choix se replient sur plusieurs lignes et remplacent une liste déroulante |
| `ButtonBar` | rangée de commandes répartie sur toute la largeur (l'écart suit le conteneur, pas une constante), qui se replie quand la place manque |
| `FoldingGrid` | grille repliée à une ligne, dépliée ligne par ligne, le néon des boutons s'amorçant |
| `DeleteButton` | le bouton qui supprime : poubelle à l'encre des commandes, armée au premier appui (poubelle et tube rouges), qui supprime au second et désarme seule au bout de 3 s ou d'un appui ailleurs ; `withLabel`, un bouton à libellé (poubelle et nom) |
| `Selectable`, `SelectToggle` | la sélection : un bloc (ou une ligne de tableau, `as="tr"`) qui s'allume quand il est choisi, et le bouton à bascule qui le choisit, case vide puis cochée |
| `Reveal` | la section dépliante cachée : le dépli d'une `Disclosure`, sans intitulé ni chevron, commandé par l'état — les actions d'une sélection, un message qui s'impose |
| `Disclosure` | section dépliante, sur le système de la grille : un intitulé, le chevron dessous, un dépli ligne par ligne où le néon de chaque commande s'amorce ; `sunken` l'allume une fois dépliée |
| `DisclosureButton` | bouton section dépliante : la section est un bouton large dont l'en-tête s'actionne ; un appui l'allume tout entier et déplie le contenu dedans ; `open` le fait piloter par l'app (une seule section ouverte, un repli après enregistrement) |
| `ChartFilters` | la lumière d'un graphique, en filtres SVG : le halo d'un trait (`#ds-chart-groove`), le halo plus discret d'une marque pleine (`#ds-chart-groove-fill`), chacun à la teinte de sa marque, et le liseré néon du graphique entier (`#ds-chart-set`, `--neon-color`). `#ds-chart-shadow` est **déprécié** — alias du halo d'un trait |
| `Screen`, `Header`, `Body`, `Footer` | l'écran d'une app : en-tête et pied fixes, corps qui défile — **et qui ne coupe que s'il défile** : quand il tient dans sa place, le corps laisse déborder les halos de ses boutons, l'en-tête et le pied rendent leur fond |
| `Slides` | les écrans côte à côte : changer de destination fait glisser le ruban à gauche ou à droite, tous restés montés, les autres `inert` ; chaque écran porte son `Body`, qui défile seul et garde sa position |
| `Spinner`, `Notice`, `Zone` | chargement, message, panneau à liseré ambre et halo |
| `Icon` | les icônes des **deux** polices : `ICONS` (Symbols Nerd Font) et `GLYPHS` (157 glyphes Star Wars), choisies d'après le seul nom |
| `Frame`, `Readout` | la **visée** : le châssis d'écran que parcourt un balayage, et la lecture d'instrument dont les chiffres (`digits`) passent au rouge |
| `HoloEmitter` | l'**émetteur holographique** : socle et faisceau autour de ce qu'il projette (`.ds-holo`), dont la phase se règle par `--holo-delay` et la taille par un seul `font-size` sur l'émetteur (2,4 rem par défaut) |
| `HyperspaceJump`, `useHyperspaceJump` | le **saut** : le hook retarde une valeur jusqu'à la croisière, le composant peint le champ d'étoiles tant que `phase` n'est pas `null` |

## Utiliser le paquet dans une app

Le paquet est public, sur npmjs : ni jeton ni `.npmrc`, chez soi comme en CI.

```bash
npm install @pendrayg/star-wars-design-system
```

```tsx
import '@pendrayg/star-wars-design-system/styles.css'
import { Button, FoldingGrid, ImageButton } from '@pendrayg/star-wars-design-system'
```

React 19 est une dépendance pair : c'est l'app qui l'apporte.

**Licence : [PolyForm Noncommercial 1.0.0](LICENSE).** Installer, modifier, redistribuer, héberger
sur son serveur : tout est permis **tant que l'usage n'est pas commercial** — projet personnel,
étude, association, école, recherche publique, institution. Un usage commercial demande une licence
séparée : [ouvrir une issue](https://github.com/pendrayg/star-wars-design-system/issues).

**L'app n'a rien à faire pour la densité** : le DS lit le pointeur. Sur **téléphone**, le rendu est
**identique au pixel** à celui de la maquette (`pointer: coarse` ⇒ échelle confortable) ; ce qui
change d'une version à l'autre, c'est le rendu sur un **navigateur de bureau**, à l'échelle
compacte — en 0.6.0 elle passe de 25 à 33 px, d'où une mineure : tout consommateur en est changé.
Une app qui veut l'échelle de la maquette partout pose `data-density="comfortable"` sur `<html>`, une
app de bureau tactile (borne, écran de salle) peut au contraire forcer `"compact"` ; l'attribut a
toujours le dernier mot sur la détection.

Les **graphiques** font exception à la règle « un composant, un rendu » : le DS n'en dessine aucun,
il n'en règle que la lumière. `ChartFilters` se rend une fois par page — ses identifiants sont fixes
—, puis n'importe quel SVG les cite, recharts compris :

```tsx
<ChartFilters />
{/* un TRAIT : son halo, posé deux fois */}
<Line stroke={VALUE_COLOR} strokeWidth={2} filter="url(#ds-chart-groove)" />
{/* des MARQUES PLEINES : un halo plus discret */}
<Bar dataKey="waiting" filter="url(#ds-chart-groove-fill)" />
<Scatter data={points} filter="url(#ds-chart-groove-fill)" />
<Pie data={parts} innerRadius="58%" outerRadius="86%" filter="url(#ds-chart-groove-fill)" />
```

Les valeurs des filtres sont en unités de tracé, qui sont les pixels de l'écran dans un graphique
rendu à l'échelle 1. Sur un SVG mis à l'échelle par sa `viewBox`, les diviser par le facteur.

## Licences des polices

Les cinq polices sont **servies avec le paquet** (`src/assets/fonts/`, recopiées dans
`dist/assets/fonts/`) : pas de CDN, et une app hors ligne rend le même texte. Leurs en-têtes de
licence sont conservés tels quels en tête des feuilles qui les déclarent.

| Police | Rôle | Licence |
| --- | --- | --- |
| **SF Distant Galaxy** | corps de texte (`--font-body`) | ShyFoundry Fonts (Sigurdur Armannsson) — **gratuite pour un usage non commercial** |
| **SF Distant Galaxy Alternate** | titres et commandes (`--font-title`) | ShyFoundry Fonts — **gratuite pour un usage non commercial** |
| **Starwars Kit** | coques de vaisseaux (`--font-hull`), appliquée nulle part par défaut | ShyFoundry Fonts — **gratuite pour un usage non commercial** |
| **Star Wars GlyphIcons 1.4** | les 157 glyphes `.swg-*` (`GLYPHS`) | police **SIL OFL 1.1**, CSS **MIT** — [starwarsglyphicons.com](http://starwarsglyphicons.com/license), par [@maxtusken](https://twitter.com/maxtusken) |
| **Symbols Nerd Font** | les symboles d'interface `.nf-md-*` (`ICONS`) | [ryanoasis/nerd-fonts](https://github.com/ryanoasis/nerd-fonts) v3.4.0, glyphes Material Design Icons |

Les trois polices ShyFoundry sont **gratuites pour un usage non commercial**, ce qui **s'accorde
avec la PolyForm Noncommercial du paquet** : les deux licences autorisent exactement le même
périmètre. Un usage **commercial** demande donc **deux** autorisations — celle du paquet
([ouvrir une issue](https://github.com/pendrayg/star-wars-design-system/issues)) *et* celle de
ShyFoundry pour les polices. « Star Wars » est une marque de Lucasfilm Ltd. ; ce dépôt n'est ni
affilié ni approuvé par ses ayants droit.

## Développer

```bash
npm install          # npm 11 (npm 10 bute sur la résolution des dépendances pair)
npm run site         # la page de démonstration, http://localhost:5173
npm test
npm run build        # dist/index.js, dist/types, dist/styles
```

## Page de démonstration

`site/` est une app Vite toute simple, bâtie sur les composants du paquet : chaque famille en
situation, avec un sélecteur de thème (appareil, sombre, clair), un sélecteur de **densité**
(pointeur, compacte, confortable) et une bascule des **rayures**. Changer de thème passe par le
**saut en hyperespace**, exactement comme le ferait une app. Attention, `pointer: coarse` **ne se déclenche pas** en
redimensionnant la fenêtre : il faut l'émulation d'appareil de DevTools — ou le sélecteur. Pas de
Storybook : sur iPhone,
Safari n'y jouait pas les animations (plein feu, amorçage), alors qu'une page ordinaire les joue, comme
les apps.

Un Worker Cloudflare la sert (`wrangler.jsonc`), déployée à chaque poussée sur `main` par
l'intégration Git de Cloudflare :

| Réglage du build | Valeur |
| --- | --- |
| Commande de build | `npm run build-site` |
| Commande de déploiement | `npx wrangler deploy` |

Le build de ce Worker n'a besoin d'aucun jeton. L'adresse `*.workers.dev` est publique : pour
garder la page privée, la protéger par Cloudflare Access (Zero Trust → Access → Applications,
une règle sur son adresse e-mail).

## Publier une version

```bash
npm version minor    # ou patch, major : met à jour package.json et crée le tag
git push --follow-tags
```

Le workflow « Publier » construit et publie le tag sur npmjs **sans aucun jeton** : npmjs reconnaît
ce dépôt et ce fichier de workflow comme publieur de confiance (*trusted publisher*, OIDC), et
l'identité d'exécution d'Actions tient lieu de preuve. Un corollaire gratuit : la **provenance** du
paquet est attestée à chaque publication. Il se lance aussi à la main
(onglet Actions, « Run workflow ») : il publie alors la version inscrite dans `package.json`, puis
pose le tag `v<version>` s'il manque. Le champ « commit » vise un commit antérieur ; une version
déjà publiée n'est pas republiée, seul son tag est posé.
