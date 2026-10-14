import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { HyperspaceJump } from './HyperspaceJump'

describe('HyperspaceJump', () => {
  it("couvre l'écran sans jeter alors que jsdom ne fournit aucun contexte 2D", () => {
    // Le composant doit renoncer proprement à peindre : c'est exactement ce que fera un navigateur
    // qui refuse le contexte (canvas désactivé, mémoire GPU saturée).
    expect(() => render(<HyperspaceJump phase="enter" />)).not.toThrow()
    expect(screen.getByTestId('ds-jump')).toBeInTheDocument()
  })

  it('expose la phase courante, qui pilote le fondu de sortie en CSS', () => {
    const { rerender } = render(<HyperspaceJump phase="enter" />)
    expect(screen.getByTestId('ds-jump')).toHaveAttribute('data-phase', 'enter')

    rerender(<HyperspaceJump phase="exit" />)
    expect(screen.getByTestId('ds-jump')).toHaveAttribute('data-phase', 'exit')
  })

  it('masque la barre de défilement le temps du saut, puis la rend', () => {
    const root = document.documentElement
    const { unmount } = render(<HyperspaceJump phase="enter" />)

    expect(root.style.overflow).toBe('hidden')

    unmount()

    // Restaurée à sa valeur d'origine, et non écrasée : la page redevient défilante.
    expect(root.style.overflow).toBe('')
  })

  it("reste invisible aux lecteurs d'écran : c'est du décor", () => {
    render(<HyperspaceJump phase="cruise" />)
    expect(screen.getByTestId('ds-jump')).toHaveAttribute('aria-hidden', 'true')
  })
})
