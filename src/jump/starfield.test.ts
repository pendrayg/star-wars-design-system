import { describe, expect, it } from 'vitest'
import { advance, createStars, jumpSpeed, project, type Star, type Viewport } from './starfield'

const viewport: Viewport = { width: 1000, height: 600 }

/** Suite pseudo-aléatoire déterministe : les tests doivent voir toujours le même champ. */
function sequence(values: number[]): () => number {
  let index = 0
  return () => values[index++ % values.length]
}

/** Distance de la projection au centre de l'écran — la mesure de l'écartement perspectif. */
function spread(star: Star): number {
  const point = project(star, viewport)
  if (!point) throw new Error('étoile derrière la caméra')
  return Math.hypot(point.x - viewport.width / 2, point.y - viewport.height / 2)
}

describe('project', () => {
  it("écarte l'étoile du centre à mesure qu'elle se rapproche, de plus en plus vite", () => {
    const loin = spread({ x: 100, y: 100, z: 800 })
    const moyen = spread({ x: 100, y: 100, z: 400 })
    const proche = spread({ x: 100, y: 100, z: 200 })

    expect(moyen).toBeGreaterThan(loin)
    expect(proche).toBeGreaterThan(moyen)
    // L'écartement n'est pas linéaire : diviser z par deux double l'écart. C'est cette accélération
    // apparente qui fait la vitesse, pas une courbe d'animation.
    expect(proche - moyen).toBeGreaterThan(moyen - loin)
  })

  it("place une étoile centrée au milieu de l'écran, quelle que soit sa profondeur", () => {
    expect(project({ x: 0, y: 0, z: 900 }, viewport)).toEqual({ x: 500, y: 300 })
    expect(project({ x: 0, y: 0, z: 10 }, viewport)).toEqual({ x: 500, y: 300 })
  })

  it('ne projette rien derrière la caméra', () => {
    expect(project({ x: 100, y: 100, z: 0 }, viewport)).toBeNull()
    expect(project({ x: 100, y: 100, z: -50 }, viewport)).toBeNull()
  })

  it('projette la queue de traînée plus près du centre que la tête', () => {
    const star: Star = { x: 300, y: 0, z: 200 }

    // Même étoile, reculée : c'est l'écart entre les deux qui dessine le trait.
    expect(spread(star)).toBeGreaterThan(
      Math.hypot((project(star, viewport, 260) as { x: number }).x - viewport.width / 2, 0),
    )
  })
})

describe('advance', () => {
  it('rapproche les étoiles de la caméra', () => {
    const stars: Star[] = [{ x: 0, y: 0, z: 500 }]

    advance(stars, 120)

    expect(stars[0].z).toBe(380)
  })

  it('recycle au fond une étoile dépassée, sans jamais changer la taille du champ', () => {
    const stars: Star[] = [
      { x: 10, y: 10, z: 30 },
      { x: 20, y: 20, z: 700 },
    ]

    advance(stars, 100, sequence([0.5]))

    expect(stars).toHaveLength(2)
    // Renvoyée au fond, avec une position latérale neuve : sans ça, la même étoile repasserait
    // indéfiniment au même endroit de l'écran.
    expect(stars[0].z).toBe(1000)
    expect(stars[0].x).toBe(0)
    expect(stars[1].z).toBe(600)
  })
})

describe('createStars', () => {
  it('répartit les étoiles sur toute la profondeur, pas seulement au fond', () => {
    const stars = createStars(40)
    const profondeurs = stars.map((star) => star.z)

    expect(stars).toHaveLength(40)
    // Un champ né entièrement à 1000 ferait démarrer le saut sur un écran vide.
    expect(Math.min(...profondeurs)).toBeLessThan(400)
    expect(Math.max(...profondeurs)).toBeGreaterThan(600)
  })

  it('produit un champ reproductible avec une suite déterministe', () => {
    const premier = createStars(5, sequence([0.1, 0.9, 0.4, 0.7, 0.2]))
    const second = createStars(5, sequence([0.1, 0.9, 0.4, 0.7, 0.2]))

    expect(premier).toEqual(second)
  })
})

describe('jumpSpeed', () => {
  it("part de l'immobilité et ne s'emballe qu'en fin d'accélération", () => {
    expect(jumpSpeed('enter', 0).speed).toBe(0)
    // Ease-in : à mi-parcours on n'est qu'au quart de la vitesse, la ruée est pour la fin.
    expect(jumpSpeed('enter', 0.5).speed).toBeLessThan(jumpSpeed('cruise', 0).speed / 3)
    expect(jumpSpeed('enter', 1).speed).toBe(jumpSpeed('cruise', 0).speed)
  })

  it('tient la vitesse maximale sur toute la croisière', () => {
    expect(jumpSpeed('cruise', 0)).toEqual(jumpSpeed('cruise', 1))
    expect(jumpSpeed('cruise', 0.5).glow).toBe(1)
  })

  it('retombe à zéro en fin de sortie', () => {
    expect(jumpSpeed('exit', 0).speed).toBe(jumpSpeed('cruise', 0).speed)
    expect(jumpSpeed('exit', 1)).toEqual({ speed: 0, trail: 0, glow: 0 })
  })

  it('allonge la traînée et le halo avec la vitesse', () => {
    const lent = jumpSpeed('enter', 0.3)
    const rapide = jumpSpeed('enter', 0.9)

    expect(rapide.trail).toBeGreaterThan(lent.trail)
    expect(rapide.glow).toBeGreaterThan(lent.glow)
  })
})
