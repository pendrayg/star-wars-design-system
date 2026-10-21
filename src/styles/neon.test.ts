import { readdirSync, readFileSync } from 'node:fs'
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

  it('le ton est dans le tube, jamais dans le texte : aucun ton ne change la couleur du libellé', () => {
    const bouton = lire('button.css')
    for (const ton of ['.ds-danger', '.ds-link']) {
      expect(regle(bouton, ton)).not.toMatch(/--btn-active-color|--color-primary/)
    }
    expect(bouton).not.toMatch(/\.ds-primary\s*\{/)
    expect(regle(lire('delete.css'), '.ds-delete.ds-armed')).not.toMatch(/--btn-active-color:|(?:^|[\s;{])color:\s*var\(--color-danger\)/)
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

describe('le texte est opaque', () => {
  /**
   * Les polices du générique sont à CHEVAUCHEMENT : un texte translucide en montre chaque
   * recouvrement, plus foncé. Une demi-encre se mélange donc au fond, jamais au transparent.
   */
  it.each(['button.css', 'menu.css', 'field.css', 'search.css', 'disclosure.css'])('%s : aucune couleur de texte translucide', (fichier) => {
    const couleurs = lire(fichier).match(/(?:^|[;{\s])(?:caret-)?color:[^;]*;/g) ?? []
    for (const couleur of couleurs) expect(couleur).not.toMatch(/transparent/)
  })

  it('un bouton indisponible s’éteint par la couleur, pas par l’opacité', () => {
    expect(regle(lire('button.css'), '.ds-button:disabled')).not.toMatch(/opacity/)
  })
})

describe('la pastille d’un sélecteur', () => {
  it('est l’exception à « actif = bleu » : plein feu, mais jaune', () => {
    expect(regle(lire('menu.css'), '.ds-menu-indicator')).toMatch(/--neon-lit-color:\s*var\(--neon-color\)/)
  })

  it('change de choix en s’éteignant puis en se rallumant au néon, en coupures franches', () => {
    const menu = lire('menu.css')
    expect(regle(menu, '.ds-menu-indicator.is-out')).toMatch(/ds-neon-out[^;]*steps\(1, end\)/)
    expect(regle(menu, '.ds-menu-indicator.is-in')).toMatch(/ds-neon-in[^;]*steps\(1, end\)/)
    expect(lire('neon.css')).toMatch(/@keyframes ds-neon-out/)
  })
})

/**
 * RIEN NE S’ALLUME PAR HÉRITAGE. --lit est héritée (tokens.css), et c’est voulu : elle descend
 * d’une commande à son calque de néon. Mais elle descend AUSSI dans tout ce que cette commande
 * CONTIENT — une section dépliée monte à 1 pour son propre calque et le passe à ses champs. Tout ce
 * que la recette peint doit donc POSER son --lit, sinon il prend celui d’un ancêtre allumé et vire
 * au bleu du plein feu sans rien avoir d’actif. C’est ce qui était arrivé au cadre d’un sélecteur
 * plat déplié : cadre bleu, pastille jaune — l’inverse exact du dessin.
 * Deux exceptions, et deux seulement : le calque, qui EST le tube de la commande qui le porte, et
 * .ds-neon, la porte d’entrée qu’une app allume elle-même.
 */
describe('rien ne s’allume par héritage', () => {
  const SUIVENT_LEUR_HOTE = ['.ds-neon', '.ds-shade']
  const FEUILLES = readdirSync(import.meta.dirname)
    .filter((fichier) => fichier.endsWith('.css'))
    .map(lire)

  /** Les règles d’une feuille, en couples [sélecteurs, corps]. */
  const regles = (css: string): [string, string][] =>
    [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((hit) => [hit[1].trim(), hit[2]])

  /** Ce que le néon peint : la liste est LUE dans la recette, jamais recopiée ici. */
  const peints = (() => {
    const neon = lire('neon.css')
    return neon
      .slice(0, neon.indexOf('{'))
      .split(',')
      .map((selecteur) => selecteur.trim())
      .filter(Boolean)
  })()

  it('la liste des peints est bien celle de neon.css', () => {
    expect(peints).toContain('.ds-menu')
    expect(peints).toContain('.ds-selectable')
    expect(peints.length).toBeGreaterThan(5)
  })

  it.each(peints.filter((selecteur) => !SUIVENT_LEUR_HOTE.includes(selecteur)))(
    '%s pose son propre --lit',
    (selecteur) => {
      /* Le tube d’un pseudo-élément se règle sur l’élément qui le porte, dont il hérite. */
      const cible = selecteur.replace(/::[a-z-]+$/, '')
      const pose = FEUILLES.some((css) =>
        regles(css).some(
          ([selecteurs, corps]) => selecteurs.split(',').some((s) => s.trim() === cible) && /--lit:/.test(corps),
        ),
      )
      expect(pose, `${selecteur} n’a pas de --lit à lui : il prendra celui d’un ancêtre allumé`).toBe(true)
    },
  )
})
