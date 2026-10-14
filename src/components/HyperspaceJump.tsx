import { useEffect, useRef } from 'react'
import { advance, createStars, JUMP_DURATIONS, jumpSpeed, project, type JumpPhase } from '../jump/starfield'

/** Densité du champ. Assez pour saturer l'écran en croisière, assez peu pour tenir 60 fps. */
const STAR_COUNT = 900
/** Plafond du delta entre deux frames : un onglet revenu au premier plan ne doit pas téléporter
 *  le champ d'un seul bond (le navigateur suspend `requestAnimationFrame` en arrière-plan). */
const MAX_FRAME_MS = 50
/** Repli si le jeton de teinte est illisible (feuille du DS non chargée, canvas hors document). */
const GLOW_FALLBACK = '#a8e6ff'

export interface HyperspaceJumpProps {
  /** Phase courante, pilotée par `useHyperspaceJump`. Ce composant ne compte pas le temps. */
  phase: JumpPhase
}

function themeGlow(): string {
  if (typeof window === 'undefined') return GLOW_FALLBACK
  return getComputedStyle(document.documentElement).getPropertyValue('--grad-glacier-to').trim() || GLOW_FALLBACK
}

/**
 * Saut en hyperespace, à la première personne : le spectateur EST la caméra, les étoiles fondent
 * sur lui et s'étirent en traits radiaux.
 *
 * Le rendu passe par un `<canvas>` et non par le DOM : neuf cents traits redessinés à chaque frame
 * seraient neuf cents nœuds à recalculer. La 3D elle-même vit dans `jump/starfield.ts` ; ce
 * composant ne fait que peindre et suivre l'horloge.
 */
export function HyperspaceJump({ phase }: HyperspaceJumpProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // La phase change en cours de vie : un ref évite de relancer la boucle (et donc de repartir d'un
  // champ neuf) à chaque transition.
  const phaseRef = useRef(phase)
  // oxlint-disable-next-line react/refs
  phaseRef.current = phase

  // Verrou de défilement, dans son propre effet : il ne dépend pas du canvas et doit tenir même là
  // où le contexte 2D est refusé.
  useEffect(() => {
    const root = document.documentElement
    const previousOverflow = root.style.overflow
    const previousPadding = root.style.paddingRight

    // La compensation est MESURÉE, pas déduite : selon que le navigateur garde ou non la gouttière
    // de `scrollbar-gutter: stable` sous `overflow: hidden`, la page rétrécit de la largeur de la
    // barre de défilement ou ne bouge pas du tout. Compenser à l'aveugle décalait le contenu de
    // 16 px dans Chrome, qui conserve la gouttière.
    const before = document.body.clientWidth
    root.style.overflow = 'hidden'
    const shrink = before - document.body.clientWidth
    if (shrink > 0) root.style.paddingRight = shrink + 'px'

    return () => {
      root.style.overflow = previousOverflow
      root.style.paddingRight = previousPadding
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    // jsdom ne fournit pas de contexte 2D : le composant se rend, mais ne peint rien.
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    const stars = createStars(STAR_COUNT)
    const glow = themeGlow()
    let viewport = { width: 0, height: 0 }

    const resize = () => {
      const ratio = window.devicePixelRatio || 1
      viewport = { width: window.innerWidth, height: window.innerHeight }
      canvas.width = Math.round(viewport.width * ratio)
      canvas.height = Math.round(viewport.height * ratio)
      // Le contexte travaille en pixels CSS ; l'échelle absorbe la densité de l'écran.
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    let frame = 0
    let last = performance.now()
    let elapsed = 0
    let current: JumpPhase = phaseRef.current

    const draw = (now: number) => {
      const delta = Math.min(now - last, MAX_FRAME_MS)
      last = now
      // Le temps se compte PAR PHASE : chaque changement remet le compteur à zéro, sinon la
      // progression de `cruise` repartirait de la fin de `enter` et le halo saturerait d'emblée.
      if (phaseRef.current !== current) {
        current = phaseRef.current
        elapsed = 0
      }
      elapsed += delta
      const progress = elapsed / JUMP_DURATIONS[current]
      const { speed, trail, glow: intensity } = jumpSpeed(current, progress)
      advance(stars, (speed * delta) / 1000)

      context.fillStyle = '#000'
      context.fillRect(0, 0, viewport.width, viewport.height)

      if (intensity > 0) {
        const radius = Math.max(viewport.width, viewport.height) * 0.42
        const halo = context.createRadialGradient(viewport.width / 2, viewport.height / 2, 0, viewport.width / 2, viewport.height / 2, radius)
        halo.addColorStop(0, glow)
        halo.addColorStop(1, 'transparent')
        context.globalAlpha = 0.28 * intensity
        context.fillStyle = halo
        context.fillRect(0, 0, viewport.width, viewport.height)
        context.globalAlpha = 1
      }

      context.strokeStyle = '#fff'
      context.lineCap = 'round'
      context.beginPath()
      for (const star of stars) {
        const head = project(star, viewport)
        // La queue est l'étoile projetée PLUS LOIN : au repos les deux points se confondent en un
        // grain, à pleine vitesse ils s'écartent en un trait qui fuit le centre.
        const tail = project(star, viewport, trail)
        if (!head || !tail) continue
        context.moveTo(tail.x, tail.y)
        context.lineTo(head.x, head.y)
      }
      // Les traits s'épaississent avec la vitesse : sans ça, la croisière paraît grêle.
      context.lineWidth = 1 + intensity * 1.4
      context.stroke()

      frame = requestAnimationFrame(draw)
    }
    frame = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div className="ds-jump" data-phase={phase} aria-hidden="true" data-testid="ds-jump">
      <canvas ref={canvasRef} className="ds-jump-canvas" />
    </div>
  )
}
