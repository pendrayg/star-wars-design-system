/**
 * Les filtres SVG des graphiques.
 *
 * Le DS ne dessine pas de graphique — recharts, ou du SVG à la main, s'en charge —, mais il en
 * règle la LUMIÈRE : sans cela chaque app réinvente son halo, et un graphique est justement le cas
 * que la règle ne couvre pas, n'étant ni une commande ni une zone.
 *
 * UNE MARQUE DE GRAPHIQUE EST UN TUBE NÉON — un trait, une aire, un symbole de nuage, un rectangle
 * de barre, une part de camembert : elle rayonne de SA PROPRE TEINTE, comme un hologramme
 * (`.ds-holo`). Plus de gravure ni d'ombre : le néomorphisme est parti du DS, les graphiques avec.
 *
 * Les identifiants sont ceux d'avant — une app qui les cite n'a rien à changer :
 *
 *   #ds-chart-groove — LE HALO D'UN TRAIT (1 à 2 px) : courbe, contour d'aire, ligne de référence.
 *     Le trait, flouté à σ = 2 et posé DEUX FOIS sous lui : un trait de 2 px ne retient qu'une
 *     petite part de son flou, et à une seule couche il n'en restait qu'un voile. Le tracé passe
 *     au-dessus, net — le tube, et sa lumière autour.
 *
 *   #ds-chart-groove-fill — LE HALO D'UNE MARQUE PLEINE (3 px et plus) : symbole, barre, part.
 *     Même flou, posé UNE fois et à 60 % : une marque pleine retient tout son flou, et au dosage
 *     d'un trait une barre rayonnerait trois fois plus que la courbe d'à côté.
 *
 *   #ds-chart-shadow — **DÉPRÉCIÉ**, sans emploi : il posait une marque SUR la page. Il rend
 *     désormais le halo d'un trait, pour qu'une app qui le cite encore reste dans le ton, et sera
 *     retiré.
 *
 *   #ds-chart-set — LE CHÂSSIS D'UN GRAPHIQUE : un liseré néon de 1,5 px autour de la silhouette
 *     ENTIÈRE de ce qu'il habille (un camembert, une carte), à la teinte du néon des commandes
 *     (`--neon-color`, cf. chart.css), et son halo. C'est le tube d'une commande porté à une forme
 *     quelconque. Il habille le graphique entier, jamais une marque.
 *
 * Les valeurs sont en unités de tracé, qui sont les pixels de l'écran dans un graphique rendu à
 * l'échelle 1 (recharts). Les couleurs viennent du thème (`chart.css`) et non des attributs : un
 * attribut de présentation ne résout pas `var()`.
 *
 * À rendre UNE FOIS par page — les identifiants sont fixes —, puis à citer depuis n'importe quel
 * SVG : `filter="url(#ds-chart-groove)"`. En ATTRIBUT de préférence, et non par une règle CSS :
 * WebKit résout le fragment d'un `url(#…)` écrit dans une feuille séparée contre l'URL de la
 * feuille et non contre celle du document, et le filtre disparaît alors sans la moindre erreur.
 */
export function ChartFilters() {
  return (
    <svg className="ds-chart-filters" width="0" height="0" aria-hidden="true" focusable="false">
      <defs>
        <filter id="ds-chart-groove" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="halo" />
          <feMerge>
            <feMergeNode in="halo" />
            <feMergeNode in="halo" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="ds-chart-groove-fill" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="flou" />
          <feColorMatrix in="flou" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.6 0" result="halo" />
          <feMerge>
            <feMergeNode in="halo" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* DÉPRÉCIÉ : le halo d'un trait, recopié. */}
        <filter id="ds-chart-shadow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="halo" />
          <feMerge>
            <feMergeNode in="halo" />
            <feMergeNode in="halo" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Le liseré : la silhouette dilatée de 1,5, moins la silhouette — un anneau qui l'épouse
            au-dehors —, teinté (feFlood, cf. chart.css), puis flouté pour le halo. Le halo
            dessous, la forme, le tube au-dessus de tout. */}
        <filter id="ds-chart-set" x="-40%" y="-40%" width="180%" height="180%">
          <feMorphology in="SourceAlpha" operator="dilate" radius="1.5" result="gonfle" />
          <feComposite operator="out" in="gonfle" in2="SourceAlpha" result="anneau" />
          <feFlood result="encre" />
          <feComposite operator="in" in="encre" in2="anneau" result="tube" />
          <feGaussianBlur in="tube" stdDeviation="3" result="halo" />
          <feMerge>
            <feMergeNode in="halo" />
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="tube" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  )
}
