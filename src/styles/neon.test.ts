import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * ACTIF = BLEU, gardé depuis les FICHIERS, comme les tests voisins : jsdom ne résout ni var() ni
 * color-mix(). Ce qui se garde, c'est la règle — le bleu n'est posé que sur un état actif, et ce
 * qui n'est pas actif (un ton au repos, une donnée) reste ambre.
 */
const lire = (fichier: string) => readFileSync(join(import.meta.dirname, fichier), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
const regle = (css: string, selecteur: string) => {
  const debut = css.indexOf(`${selecteur} {`)
  expect(debut, `règle ${selecteur} introuvable`).toBeGreaterThanOrEqual(0)
  return css.slice(debut, css.indexOf('}', debut))
}

describe('actif = bleu', () => {
  it('le tube passe de l’ambre au bleu selon --lit', () => {
    const neon = lire('neon.css')
    expect(neon).toMatch(/--neon-tint:\s*color-mix\(in srgb, var\(--neon-lit-color\) calc\(100% \* var\(--neon-full\)\), var\(--neon-color\)\)/)
  })

  it('un bouton principal ou un lien n’est pas bleu au repos', () => {
    const bouton = lire('button.css')
    for (const ton of ['.ds-primary', '.ds-link']) {
      expect(regle(bouton, ton)).not.toMatch(/--color-primary|--neon-lit-color/)
    }
  })

  it('le danger reste rouge, même actif', () => {
    expect(regle(lire('button.css'), '.ds-danger')).toMatch(/--neon-lit-color:\s*var\(--color-danger\)/)
  })

  it('les encres d’un graphique sont ambre par défaut, jamais le bleu', () => {
    const jetons = lire('tokens.css')
    expect(jetons).toMatch(/--chart-ink:\s*var\(--neon-color\)/)
    const graphique = lire('chart.css')
    expect(regle(graphique, '.ds-chart-line')).toMatch(/stroke:\s*var\(--chart-ink\)/)
    expect(regle(graphique, '.ds-chart-part')).toMatch(/fill:\s*var\(--chart-fill\)/)
  })
})
