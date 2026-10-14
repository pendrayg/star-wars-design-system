import { useEffect, useRef, useState } from 'react'
import { JUMP_DURATIONS, type JumpPhase } from '../jump/starfield'
import { prefersReducedMotion } from '../fold/motion'

/**
 * Vrai en TEST, ou si l'utilisateur demande moins d'animations : la bascule est alors immédiate.
 * La branche « test » n'est pas un confort : sans elle, toute suite qui bascule un réglage
 * attendrait 1,4 s de saut avant de voir le résultat — y compris celle d'une app consommatrice.
 *
 * `process` est lu DEPUIS `globalThis` et typé à la main plutôt que par @types/node : le paquet
 * publié est une bibliothèque de navigateur, sa compilation de déclarations (tsconfig.build.json)
 * n'embarque que `vite/client`, et un `process` global n'y existe pas. L'accès optionnel rend
 * `undefined` partout ailleurs qu'en exécution Node — donc dans un navigateur, où l'on anime.
 */
const NODE = globalThis as { process?: { env?: Record<string, string | undefined> } }

function shouldSkipAnimation(): boolean {
  if (NODE.process?.env?.NODE_ENV === 'test') return true
  return prefersReducedMotion()
}

export interface Jump<T> {
  /** Phase en cours, `null` hors saut. */
  phase: JumpPhase | null
  /** Valeur à APPLIQUER — en retard sur `target` pendant le saut. */
  value: T
}

/**
 * Retarde l'application d'une valeur le temps d'un saut en hyperespace.
 *
 * Le hook est GÉNÉRIQUE parce que ce qu'il retarde ne le regarde pas : un thème, un skin, une
 * route, un jeu de données. Ce qu'il garantit est toujours le même — la valeur ne change qu'une
 * fois l'écran entièrement couvert par l'overlay, en entrée de croisière, si bien que le
 * spectateur ne découvre le changement qu'en sortant du saut.
 *
 * L'appelant, lui, bascule `target` tout de suite : le bouton et le stockage n'ont pas à connaître
 * l'animation.
 *
 * `previous` vaut déjà `target` AU MONTAGE : recharger la page avec la valeur déjà posée ne rejoue
 * aucun saut.
 */
export function useHyperspaceJump<T>(target: T): Jump<T> {
  const previous = useRef(target)
  const targetRef = useRef(target)
  // Écrit pendant le rendu, et c'est VOULU : ce ref ne sert à aucun rendu, il ne sert qu'aux
  // minuteurs de l'effet ci-dessous, qui doivent lire la DERNIÈRE cible et non celle qui courait
  // quand ils ont été programmés. L'écrire dans l'effet le laisserait toujours d'un rendu en
  // retard. Même procédé pour `phaseRef` dans HyperspaceJump.tsx.
  // oxlint-disable-next-line react/refs
  targetRef.current = target
  const [phase, setPhase] = useState<JumpPhase | null>(null)
  const [value, setValue] = useState(target)

  useEffect(() => {
    const changed = previous.current !== target
    previous.current = target
    if (!changed) return
    if (shouldSkipAnimation()) {
      // setState synchrone dans un effet, et il n'y a pas d'autre endroit : la valeur ne PEUT pas
      // être dérivée du rendu, puisque tout l'objet du hook est de la retarder d'un temps que
      // seuls des minuteurs connaissent. Sans animation, ce retard vaut zéro.
      // oxlint-disable-next-line react/set-state-in-effect
      setValue(target)
      return
    }

    setPhase('enter')
    const timers = [
      setTimeout(() => {
        setPhase('cruise')
        // La valeur bascule ici, derrière un overlay opaque : `targetRef` et non `target`, pour
        // qu'un second changement pendant le saut applique la DERNIÈRE valeur au lieu de la périmée.
        setValue(targetRef.current)
      }, JUMP_DURATIONS.enter),
      setTimeout(() => setPhase('exit'), JUMP_DURATIONS.enter + JUMP_DURATIONS.cruise),
      setTimeout(() => setPhase(null), JUMP_DURATIONS.enter + JUMP_DURATIONS.cruise + JUMP_DURATIONS.exit),
    ]
    return () => timers.forEach(clearTimeout)
  }, [target])

  return { phase, value }
}
