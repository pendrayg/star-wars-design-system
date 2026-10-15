import { useLayoutEffect, useRef, useState, type ButtonHTMLAttributes, type CSSProperties, type HTMLAttributes } from 'react'
import { cx } from './cx'
import { Icon } from './Icon'
import type { AnyIconName } from './glyphs'

/** Un choix de la barre : une icône (le libellé ne se montre alors que sur le choix courant), ou un
 *  libellé seul, toujours visible. */
export interface PillItem<Id extends string = string> {
  id: Id
  icon?: AnyIconName
  label: string
  /** Nom accessible ; le libellé visible est décoratif. */
  ariaLabel?: string
}

interface PillBarProps<Id extends string> {
  items: readonly PillItem<Id>[]
  active: Id
  onSelect: (id: Id) => void
  className: string
  /** L'élément racine et ses attributs (navigation, groupe de choix…). */
  as: 'nav' | 'div'
  rootProps: HTMLAttributes<HTMLElement>
  /** Les attributs de chaque choix, selon qu'il est le courant. */
  itemProps: (current: boolean) => ButtonHTMLAttributes<HTMLButtonElement>
}

/** La pastille S'ÉTEINT sur l'ancien choix, en clignotant comme un néon qui lâche… */
export const MENU_OUT_MS = 300
/** …puis se RALLUME sur le nouveau, en clignotant comme un néon qui s'amorce (ds-neon-in : les
 *  ratés tiennent dans les 46 premiers centièmes, le reste est le palier). */
export const MENU_IN_MS = 600

/** Les bords d'un choix dans la barre : gauche, haut, droite, bas. */
type Edges = [number, number, number, number]

const measure = (bar: HTMLElement, index: number): Edges => {
  const item = bar.querySelectorAll<HTMLElement>('.ds-menu-item')[index]
  return item ? [item.offsetLeft, item.offsetTop, item.offsetLeft + item.offsetWidth, item.offsetTop + item.offsetHeight] : [0, 0, 0, 0]
}

const draw = (indicator: HTMLElement, [left, top, right, bottom]: Edges) => {
  indicator.style.left = `${left}px`
  indicator.style.top = `${top}px`
  indicator.style.width = `${Math.max(0, right - left)}px`
  indicator.style.height = `${Math.max(0, bottom - top)}px`
}

/**
 * Le cœur de la barre de menu et du sélecteur multiple plat : un cadre cerné de néon, et dedans UNE
 * pastille plein feu sous le choix courant. Changer de choix ne fait pas glisser la pastille, ni ne
 * l'étire : elle S'ÉTEINT sur l'ancien choix, en clignotant comme un tube qui lâche, puis SE
 * RALLUME sur le nouveau, en clignotant comme un tube qui s'amorce. L'ancien choix reste allumé
 * (`ds-trail`) tant que la pastille est sous lui. Ses bords suivent ceux du choix qu'elle double,
 * mesurés à chaque image, pendant que les choix changent de largeur (un libellé qui paraît).
 *
 * Le clignotement est une animation d'OPACITÉ de la pastille (ds-neon-out, ds-neon-in) et non de
 * --pop : sur iPhone, Safari ne répercute pas un nombre animé sur l'ombre de l'élément même qui
 * l'anime, et la pastille porte son néon elle-même. Elle n'a pas de texte, l'opacité ne fait
 * donc ressortir aucun chevauchement de lettres.
 */
export function PillBar<Id extends string>({ items, active, onSelect, className, as: Root, rootProps, itemProps }: PillBarProps<Id>) {
  const at = Math.max(0, items.findIndex((item) => item.id === active))
  // L'ancienne destination reste allumée le temps que la pastille l'atteigne… puis la quitte.
  const [shown, setShown] = useState({ at, trail: null as number | null })
  if (shown.at !== at) setShown({ at, trail: shown.at })
  const trail = shown.at === at ? shown.trail : shown.at

  const nav = useRef<HTMLElement>(null)
  const pill = useRef<HTMLSpanElement>(null)
  const from = useRef(at)
  const edges = useRef<Edges | null>(null)

  useLayoutEffect(() => {
    const bar = nav.current
    const indicator = pill.current
    if (!bar || !indicator) return
    const rect = (index: number) => measure(bar, index)
    const place = (next: Edges) => {
      edges.current = next
      draw(indicator, next)
    }

    const start = from.current
    from.current = at
    const still = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frame = 0
    let timer = 0
    const phase = (name: 'out' | 'in' | null) => {
      indicator.classList.remove('is-out', 'is-in')
      if (name) {
        // Relancer l'animation même si la même classe vient d'être retirée (un changement d'avis).
        void indicator.offsetWidth
        indicator.classList.add(`is-${name}`)
      }
    }
    if (start === at || still || !edges.current) {
      phase(null)
      place(rect(at))
      if (start !== at) setShown({ at, trail: null })
    } else {
      phase('out')
      const t0 = performance.now()
      let lit = false
      const step = (now: number) => {
        const t = now - t0
        if (!lit && t >= MENU_OUT_MS) {
          lit = true
          phase('in')
        }
        place(rect(lit ? at : start))
        if (t < MENU_OUT_MS + MENU_IN_MS) frame = requestAnimationFrame(step)
      }
      step(t0)
      frame = requestAnimationFrame(step)
      timer = window.setTimeout(() => setShown({ at, trail: null }), MENU_OUT_MS)
    }
    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(timer)
    }
  }, [at])

  // Au repos, la pastille suit la barre si elle change de largeur (rotation, fenêtre) — et le choix
  // courant, s'il passe alors d'une ligne à l'autre. Elle suit aussi les CHOIX eux-mêmes : la police
  // du générique arrive après le premier rendu, et ses lettres plus larges déplacent les choix sans
  // que la barre change de taille — la pastille restait alors posée à côté du choix courant.
  useLayoutEffect(() => {
    const bar = nav.current
    if (!bar || typeof ResizeObserver !== 'function') return
    const observer = new ResizeObserver(() => {
      const indicator = pill.current
      if (!indicator || bar.querySelector('.ds-menu-item.ds-trail')) return
      edges.current = measure(bar, from.current)
      draw(indicator, edges.current)
    })
    observer.observe(bar)
    bar.querySelectorAll('.ds-menu-item').forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [items.length])

  return (
    <Root ref={nav as never} className={cx('ds-menu', className)} style={{ '--menu-n': items.length } as CSSProperties} {...rootProps}>
      <span ref={pill} className="ds-menu-indicator" aria-hidden="true" />
      {items.map((item, index) => {
        const current = index === at
        const lit = current || index === trail
        return (
          <button
            key={item.id}
            type="button"
            className={cx('ds-menu-item', !item.icon && 'ds-plain', lit && 'ds-active', !current && lit && 'ds-trail')}
            aria-label={item.ariaLabel ?? item.label}
            {...itemProps(current)}
            onClick={() => onSelect(item.id)}
          >
            {item.icon && <Icon name={item.icon} />}
            <span className="ds-menu-label" aria-hidden="true">
              {item.label}
            </span>
          </button>
        )
      })}
    </Root>
  )
}
