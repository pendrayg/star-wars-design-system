import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * LES POLICES SONT SERVIES AVEC LE PAQUET, et c'est ce que ce test garde — pas leur rendu.
 *
 * Trois feuilles déclarent des `@font-face` (fonts.css, icons.css, glyphs.css) et toutes visent
 * `../assets/fonts/`, que `scripts/copy-styles.mjs` recopie tel quel dans `dist`. Un fichier
 * renommé, oublié au moment de la copie ou cité avec une faute ne se voit NULLE PART ailleurs :
 * le navigateur retombe silencieusement sur la police de repli, et le DS perd son lettrage sans
 * la moindre erreur. D'où cette garde, à la lettre : chaque `url()` doit exister sur le disque.
 */
const FEUILLES = ['fonts.css', 'icons.css', 'glyphs.css']

/** Les chemins de police cités par une feuille, dans l'ordre. */
function polices(feuille: string): string[] {
  const css = readFileSync(join(import.meta.dirname, feuille), 'utf8')
  return [...css.matchAll(/url\('([^']+)'\)/g)].map((hit) => hit[1])
}

describe('les polices du paquet', () => {
  it.each(FEUILLES)('%s ne cite que des fichiers présents, et tous dans src/assets/fonts', (feuille) => {
    const citees = polices(feuille)

    expect(citees.length, `${feuille} ne déclare aucune police`).toBeGreaterThan(0)
    for (const chemin of citees) {
      expect(chemin, `${feuille} : une police hors de src/assets/fonts`).toMatch(/^\.\.\/assets\/fonts\//)
      expect(existsSync(join(import.meta.dirname, chemin)), `${feuille} : ${chemin} est introuvable`).toBe(true)
    }
  })

  it('les deux polices de texte sont déclarées, et aucune ne porte de graisse', () => {
    // Commentaires retirés, comme dans menu.test.ts : ils parlent des graisses, ils ne les posent pas.
    const css = readFileSync(join(import.meta.dirname, 'fonts.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')

    expect(css).toMatch(/font-family:\s*'SF Distant Galaxy'\s*;/)
    expect(css).toMatch(/font-family:\s*'SF Distant Galaxy Alternate'\s*;/)
    // Une graisse déclarée inviterait le navigateur à en simuler une seconde : ces polices n'en
    // ont qu'une, et un gras synthétique brouille leur tracé.
    expect(css).not.toMatch(/font-weight:/)
  })
})
