import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { JUMP_DURATIONS } from '../jump/starfield'
import { useHyperspaceJump } from './useHyperspaceJump'

/**
 * `shouldSkipAnimation()` coupe le saut quand NODE_ENV vaut 'test' : on neutralise cette branche
 * pour observer la séquence réelle.
 */
function enableAnimation() {
  vi.stubEnv('NODE_ENV', 'development')
  vi.stubGlobal('matchMedia', () => ({ matches: false }))
  vi.useFakeTimers()
}

/** Avance l'horloge de `ms` en laissant React appliquer les états programmés. */
function tick(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms)
  })
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('useHyperspaceJump', () => {
  it('ne saute pas au montage, même avec la valeur déjà posée', () => {
    enableAnimation()
    const { result } = renderHook(() => useHyperspaceJump('light'))

    expect(result.current.phase).toBeNull()
    expect(result.current.value).toBe('light')
  })

  it('enchaîne les trois phases puis rend la main', () => {
    enableAnimation()
    const { result, rerender } = renderHook(({ target }) => useHyperspaceJump(target), { initialProps: { target: 'dark' } })

    act(() => rerender({ target: 'light' }))
    expect(result.current.phase).toBe('enter')

    tick(JUMP_DURATIONS.enter)
    expect(result.current.phase).toBe('cruise')

    tick(JUMP_DURATIONS.cruise)
    expect(result.current.phase).toBe('exit')

    tick(JUMP_DURATIONS.exit)
    expect(result.current.phase).toBeNull()
  })

  it("ne livre la nouvelle valeur qu'à l'entrée en croisière, jamais au changement", () => {
    enableAnimation()
    const { result, rerender } = renderHook(({ target }) => useHyperspaceJump(target), { initialProps: { target: 'dark' } })

    act(() => rerender({ target: 'light' }))
    // Le cœur de la demande : pendant l'accélération, l'ancienne valeur tient encore.
    expect(result.current.value).toBe('dark')

    tick(JUMP_DURATIONS.enter - 1)
    expect(result.current.value).toBe('dark')

    tick(1)
    expect(result.current.value).toBe('light')
  })

  it('applique la DERNIÈRE valeur quand on change deux fois pendant le saut', () => {
    enableAnimation()
    const { result, rerender } = renderHook(({ target }) => useHyperspaceJump(target), { initialProps: { target: 'dark' } })

    act(() => rerender({ target: 'light' }))
    act(() => rerender({ target: 'system' }))

    tick(JUMP_DURATIONS.enter)
    // Et non 'light', qui était la cible au moment où le minuteur a été programmé.
    expect(result.current.value).toBe('system')
  })

  it("n'est pas lié au booléen d'un thème : il retarde n'importe quelle valeur", () => {
    enableAnimation()
    const premier = { id: 1 }
    const second = { id: 2 }
    const { result, rerender } = renderHook(({ target }) => useHyperspaceJump(target), { initialProps: { target: premier } })

    act(() => rerender({ target: second }))
    expect(result.current.value).toBe(premier)

    tick(JUMP_DURATIONS.enter)
    expect(result.current.value).toBe(second)
  })

  it('bascule sans animation quand les mouvements réduits sont demandés', () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubGlobal('matchMedia', () => ({ matches: true }))
    const { result, rerender } = renderHook(({ target }) => useHyperspaceJump(target), { initialProps: { target: 'dark' } })

    act(() => rerender({ target: 'light' }))

    expect(result.current.phase).toBeNull()
    expect(result.current.value).toBe('light')
  })

  it("bascule sans animation en environnement de test, pour ne pas retarder l'interface", () => {
    const { result, rerender } = renderHook(({ target }) => useHyperspaceJump(target), { initialProps: { target: 'dark' } })

    act(() => rerender({ target: 'light' }))

    expect(result.current.phase).toBeNull()
    expect(result.current.value).toBe('light')
  })
})
