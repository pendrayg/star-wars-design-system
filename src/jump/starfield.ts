/**
 * Moteur du saut en vitesse lumière : un champ d'étoiles en 3D vu à la PREMIÈRE PERSONNE.
 *
 * La caméra est fixe à l'origine et regarde vers les z croissants ; c'est le champ qui vient à
 * elle (`z` diminue). Aucune dépendance au DOM ni au canvas : tout est testable à la main, et le
 * composant ne fait plus que peindre ce que ce module calcule.
 */

/** Phase du saut. Les trois s'enchaînent une fois, dans cet ordre. */
export type JumpPhase = 'enter' | 'cruise' | 'exit'

/** Durée de chaque phase, en millisecondes. */
export const JUMP_DURATIONS: Record<JumpPhase, number> = { enter: 400, cruise: 800, exit: 200 }

export const JUMP_TOTAL_MS = JUMP_DURATIONS.enter + JUMP_DURATIONS.cruise + JUMP_DURATIONS.exit

/** Profondeur du champ : une étoile naît à `DEPTH` et meurt en deçà de `NEAR`. */
const DEPTH = 1000
/** Plan rapproché : en deçà, l'étoile est derrière l'œil et la division exploserait. */
const NEAR = 1
/** Demi-étendue latérale du champ, en unités monde. Large devant `FOCAL` : les étoiles fuient
 *  vite hors cadre, ce qui donne la sensation de vitesse plutôt qu'un simple zoom. */
const SPREAD = 900
/** Distance focale, en pixels : elle fixe l'angle de champ (grande = longue focale, plus plate). */
const FOCAL = 420

/** Vitesse de croisière, en unités de profondeur par seconde. */
const MAX_SPEED = 1600
/** Longueur de traînée en croisière, en unités de profondeur (cf. {@link project}). */
const MAX_TRAIL = 260

export interface Star {
  x: number
  y: number
  z: number
}

export interface Point {
  x: number
  y: number
}

export interface Viewport {
  width: number
  height: number
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

/** Position latérale neuve. `z` est laissé à l'appelant : il diffère à la naissance et au recyclage. */
function scatter(star: Star, random: () => number): void {
  star.x = (random() * 2 - 1) * SPREAD
  star.y = (random() * 2 - 1) * SPREAD
}

/**
 * Champ initial. Les `z` sont répartis sur toute la profondeur — les tirer tous à `DEPTH`
 * ferait démarrer le saut sur un écran vide, puis arriver les étoiles en rideau.
 *
 * `random` est injectable pour que les tests travaillent sur un champ reproductible.
 */
export function createStars(count: number, random: () => number = Math.random): Star[] {
  return Array.from({ length: count }, () => {
    const star: Star = { x: 0, y: 0, z: NEAR + random() * (DEPTH - NEAR) }
    scatter(star, random)
    return star
  })
}

/**
 * Avance la caméra de `distance` unités. Les étoiles dépassées sont RECYCLÉES au fond du champ
 * plutôt que supprimées : le tableau garde sa taille, donc la densité à l'écran reste constante
 * et rien n'est réalloué pendant la boucle d'animation.
 */
export function advance(stars: Star[], distance: number, random: () => number = Math.random): void {
  for (const star of stars) {
    star.z -= distance
    if (star.z > NEAR) continue
    star.z = DEPTH
    scatter(star, random)
  }
}

/**
 * Projection perspective d'une étoile sur l'écran : `x / z`, l'unique formule qui fait la 3D ici.
 * Plus l'étoile est proche (z petit), plus elle s'écarte du centre — et vite, puisque la dérivée
 * de `1/z` explose. C'est cet écartement qui donne la vitesse, pas un effet ajouté.
 *
 * `depthOffset` recule virtuellement l'étoile : projeter deux fois, à `z` puis à `z + trail`,
 * donne les deux bouts du trait de traînée.
 *
 * `null` quand le point est passé derrière l'œil : il n'a plus de projection.
 */
export function project(star: Star, viewport: Viewport, depthOffset = 0): Point | null {
  const z = star.z + depthOffset
  if (z <= NEAR) return null
  return {
    x: viewport.width / 2 + (star.x / z) * FOCAL,
    y: viewport.height / 2 + (star.y / z) * FOCAL,
  }
}

/**
 * Réglage du saut à un instant donné : vitesse, longueur de traînée et intensité du halo.
 * Tout le ressenti tient dans cette fonction — c'est le seul endroit à toucher pour rendre
 * l'accélération plus brutale ou la sortie plus douce.
 *
 * `enter` accélère en `progress²` (départ presque immobile, ruée finale), `cruise` tient le
 * maximum, `exit` retombe en `(1 - progress)²` (coupure franche puis dérive lente).
 */
export function jumpSpeed(
  phase: JumpPhase,
  progress: number,
): { speed: number; trail: number; glow: number } {
  const ratio =
    phase === 'enter' ? clamp01(progress) ** 2 : phase === 'cruise' ? 1 : (1 - clamp01(progress)) ** 2
  return { speed: MAX_SPEED * ratio, trail: MAX_TRAIL * ratio, glow: ratio }
}
