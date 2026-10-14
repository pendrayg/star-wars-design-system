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
