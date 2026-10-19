import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * L'ÉCHELLE DE LA PROJECTION, gardée depuis le FICHIER : jsdom ne résout ni les `em` ni le
 * cascade, et c'est la place de la déclaration qu'on veut tenir, pas son rendu. Le `font-size`
 * doit être posé sur l'émetteur — le sujet projeté l'hérite et vaut 1 em — et NULLE PART ailleurs :
 * sur les seuls pseudo-éléments, le faisceau mesurait 2,4 rem autour d'un glyphe resté à la taille
 * du texte environnant.
 */
const CSS = readFileSync(join(import.meta.dirname, 'holo.css'), 'utf8')

/** Le corps d'une règle, repérée par son sélecteur. */
function rule(selector: string) {
  const start = CSS.indexOf(selector)
  expect(start, `règle ${selector} introuvable`).toBeGreaterThan(-1)
  return CSS.slice(start, CSS.indexOf('\n}', start))
}

describe("l'émetteur holographique", () => {
  it('porte le `font-size`, et le sujet projeté en hérite', () => {
    expect(rule('.ds-holo-emitter {')).toMatch(/^\s*font-size:\s*2\.4rem;/m)
  })

  it('ne le redéclare pas sur ses pseudo-éléments, qui héritent eux aussi', () => {
    expect(rule('.ds-holo-emitter::before,')).not.toMatch(/font-size:/)
    expect(rule('.ds-holo-emitter::after {')).not.toMatch(/font-size:/)
    expect(rule('.ds-holo-emitter::before {')).not.toMatch(/font-size:/)
  })
})

/**
 * LA POSE D'UN SUJET TEXTUEL, elle aussi gardée depuis le FICHIER : ce sont des cotes DÉRIVÉES
 * (métriques de la police, cf. le commentaire de `.ds-holo-text`) et non des valeurs ajustées à
 * l'œil — une retouche qui casserait la dérivation doit casser un test. jsdom ne résout ni les `em`
 * ni `:has()`, le rendu ne dirait rien.
 */
describe('un sujet textuel projeté (.ds-holo-text)', () => {
  it('pose sa ligne de base sur le haut du socle : 0,46 − 0,3333 = 0,127 em', () => {
    expect(rule('.ds-holo-emitter .ds-holo-text {')).toMatch(/top:\s*0\.127em;/)
  })

  it('raccourcit le faisceau à la hauteur du chiffre (0,667 em), sommet à 0,6667 − 0,46', () => {
    const faisceau = rule('.ds-holo-emitter:has(.ds-holo-text)::before {')
    expect(faisceau).toMatch(/top:\s*calc\(50% - 0\.207em\);/)
    expect(faisceau).toMatch(/height:\s*0\.667em;/)
  })

  it("ne touche pas à l'ouverture du faisceau : l'aperture ne dépend pas du sujet", () => {
    const faisceau = rule('.ds-holo-emitter:has(.ds-holo-text)::before {')
    expect(faisceau).not.toMatch(/width:/)
    expect(faisceau).not.toMatch(/clip-path:/)
  })

  it('laisse la projection du GLYPHE intacte : ses cotes restent celles de son encre', () => {
    // Pas `rule()` ici : le sélecteur du socle apparaît d'abord dans la règle GROUPÉE avec le
    // faisceau (content/position), c'est la règle qui le cote qu'on veut lire.
    expect(CSS).toMatch(/\.ds-holo-emitter::after \{\s*top:\s*calc\(50% \+ 0\.46em\);/)
    const faisceau = rule('.ds-holo-emitter::before {')
    expect(faisceau).toMatch(/top:\s*calc\(50% - 0\.563em\);/)
    expect(faisceau).toMatch(/height:\s*1\.023em;/)
    expect(faisceau).toMatch(/width:\s*1\.3em;/)
  })
})
