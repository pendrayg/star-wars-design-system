/**
 * Le calque de néon d'un bouton du DS : liseré au repos, plein feu pressé, amorçage quand il
 * apparaît — il suit --lit et --pop, qu'il hérite du bouton. Un élément, et non un pseudo-élément : Safari, sur iPhone, ne
 * répercutait pas ces nombres animés sur ::after. Tout bouton `.ds-button` en rend un.
 */
export function Shade() {
  return <span className="ds-shade" aria-hidden="true" />
}
