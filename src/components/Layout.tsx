import {
  Children,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type Ref,
  type RefObject,
} from 'react'
import { cx } from './cx'
import { MENU_IN_MS, MENU_OUT_MS } from './PillBar'

type Props<E extends HTMLElement> = HTMLAttributes<E> & { ref?: Ref<E> }

/** L'écran d'une app : l'en-tête, le corps qui défile, le pied, en colonne sur toute la hauteur. */
export function Screen({ className, ...rest }: Props<HTMLDivElement>) {
  return <div className={cx('ds-screen', className)} {...rest} />
}

/** L'en-tête fixe (une barre de recherche…), sous la barre d'état. */
export function Header({ className, ...rest }: Props<HTMLElement>) {
  return <header className={cx('ds-header', className)} {...rest} />
}

/**
 * Le corps, seul à défiler, entre l'en-tête et le pied : il passe sous eux en s'effaçant en fondu.
 * Sans en-tête, il prend lui-même la marge du haut, sous la barre d'état.
 *
 * IL NE COUPE QUE CE QU'IL DOIT. Un corps qui défile se coupe net sur ses bords — sans quoi son
 * contenu passerait par-dessus l'en-tête et le pied. Mais ce découpage n'a rien à cacher quand il
 * NE DÉFILE PAS : il ne coupe plus alors que les HALOS de ce qu'il porte, et un bouton posé au ras
 * du pied y perdait le sien, tranchée sur la ligne du pied. Le corps le dit donc par `data-fits`,
 * et la feuille de style en tire les conséquences (cf. `layout.css`) : plus de découpe, et
 * l'en-tête comme le pied rendent leur fond opaque, qui repeindrait par-dessus le halo.
 *
 * Il faut le MESURER : aucune requête CSS ne sait dire si une boîte défile (il faudrait
 * `scroll-state()`, que Safari ne connaît pas encore). On suit la boîte ET ses enfants — le corps
 * tient sa taille de l'écran, elle ne bouge pas quand son contenu grandit ; c'est le contenu qui
 * déborde. Au premier rendu on suppose qu'il défile : un halo qui apparaît une image plus tard ne
 * se voit pas, un contenu qui déborde du cadre le temps d'une image, si.
 */
export function Body({ className, ref, ...rest }: Props<HTMLDivElement>) {
  const own = useRef<HTMLDivElement | null>(null)
  const [fits, setFits] = useState(false)

  const attach = useCallback(
    (node: HTMLDivElement | null) => {
      own.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) (ref as RefObject<HTMLDivElement | null>).current = node
    },
    [ref],
  )

  // Sans tableau de dépendances : les enfants observés changent avec le rendu.
  useLayoutEffect(() => {
    const body = own.current
    if (!body) return
    // Un pixel de garde : une hauteur de contenu fractionnaire dépasse la hauteur arrondie de la
    // boîte sans que rien ne défile pour autant.
    const measure = () => setFits(body.scrollHeight <= body.clientHeight + 1)
    measure()
    if (typeof ResizeObserver !== 'function') return
    const observer = new ResizeObserver(measure)
    observer.observe(body)
    for (const child of body.children) observer.observe(child)
    return () => observer.disconnect()
  })

  return <div ref={attach} data-fits={fits ? '' : undefined} className={cx('ds-body', className)} {...rest} />
}

/** Le pied fixe (la barre de menu), au-dessus de la zone sûre du bas d'iPhone. */
export function Footer({ className, ...rest }: Props<HTMLElement>) {
  return <footer className={cx('ds-footer', className)} {...rest} />
}

/** Durée totale du changement d'écran : celle de la pastille du menu qui s'éteint sur l'ancienne
 *  destination (`MENU_OUT_MS`) puis se rallume sur la nouvelle (`MENU_IN_MS`). L'écran et le menu
 *  racontent le même geste, image pour image. */
export const BLINK_MS = MENU_OUT_MS + MENU_IN_MS

/**
 * Les écrans d'une app, CÔTE À CÔTE : changer de destination remplace le contenu du cadre, et
 * RIEN NE GLISSE. Un glissement montrait l'écran arriver par le côté — un mouvement de surface, qui
 * n'a rien d'un instrument. Le changement est une COUPURE, et le CLIGNOTEMENT la couvre.
 *
 * LE CLIGNOTEMENT EST CALÉ SUR CELUI DU MENU. Au clic, la pastille du menu s'éteint sur l'ancienne
 * destination en clignotant (`MENU_OUT_MS`), puis se rallume sur la nouvelle (`MENU_IN_MS`).
 * L'écran fait EXACTEMENT la même chose, aux mêmes instants : l'ancien écran s'éteint avec la
 * pastille, le ruban saute au moment où les deux sont éteints, et le nouvel écran se rallume avec
 * elle. Le ruban ne saute donc pas au clic mais `MENU_OUT_MS` plus tard.
 *
 * Tous les écrans restent MONTÉS : une carte garde son contexte, une liste sa position de
 * défilement, et le passage de l'un à l'autre ne coûte rien. Seul l'écran affiché est atteignable
 * — les autres sont `inert` : ni doigt, ni focus, ni lecteur d'écran, sans quoi leurs commandes
 * apparaîtraient en double dans l'ordre de tabulation.
 *
 * Chaque écran porte d'ordinaire son propre `Body` : il défile seul, et garde sa position quand on
 * le quitte. Le ruban prend alors la place du corps dans l'écran — entre l'en-tête et le pied :
 *
 *   <Screen>
 *     <Slides at={index}>
 *       <Body>…</Body>
 *       <Body>…</Body>
 *     </Slides>
 *     <Footer><MenuBar … /></Footer>
 *   </Screen>
 *
 * `at` est l'INDEX de l'écran courant : c'est au consommateur de le tenir (un store de vue, une
 * route), et il doit suivre l'ordre des enfants. Le passer en même temps que le `active` du menu
 * suffit à caler les deux.
 *
 * C'est une TRICHE : ce n'est pas le contenu qui s'éteint mais un voile à la couleur du fond, à la
 * taille du cadre, qui le recouvre par éclats (cf. `layout.css`) — en négatif de la pastille : le
 * voile est plein là où elle est éteinte. Le `key` remonte le voile à chaque phase, seule façon de
 * rejouer une animation CSS. Pas au premier rendu : une app ne s'ouvre pas sur un raté. Sous
 * `prefers-reduced-motion`, le ruban saute aussitôt, sans voile.
 */
export function Slides({ at, className, children, ...rest }: Props<HTMLDivElement> & { at: number }) {
  const screens = Children.toArray(children)
  const target = Math.max(0, Math.min(screens.length - 1, at))
  // L'écran AFFICHÉ, en retard de `MENU_OUT_MS` sur l'écran demandé : le temps que l'ancien s'éteigne.
  const [shown, setShown] = useState(target)
  const [veil, setVeil] = useState<{ key: number; phase: 'out' | 'in' } | null>(null)
  // Le dernier écran DEMANDÉ : c'est son changement, vu pendant le rendu, qui lance l'extinction —
  // dans le même rendu que le clic, donc dans la même image que la pastille du menu. Rien au
  // premier rendu : une app ne s'ouvre pas sur un raté.
  const [requested, setRequested] = useState(target)
  if (requested !== target) {
    setRequested(target)
    const still = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (still) setShown(target)
    else if (target !== shown) setVeil((v) => ({ key: (v?.key ?? 0) + 1, phase: 'out' }))
  }

  // L'ancien écran éteint, le ruban saute et le nouveau se rallume.
  useEffect(() => {
    if (target === shown) return
    const timer = window.setTimeout(() => {
      setShown(target)
      setVeil((v) => ({ key: (v?.key ?? 0) + 1, phase: 'in' }))
    }, MENU_OUT_MS)
    return () => window.clearTimeout(timer)
  }, [target, shown])

  return (
    <div className={cx('ds-slides', className)} {...rest}>
      <div className="ds-slides-track" style={{ '--slides-at': shown } as CSSProperties}>
        {screens.map((screen, index) => (
          <div key={index} className="ds-slide" inert={index !== shown}>
            {screen}
          </div>
        ))}
      </div>
      {veil && <span key={veil.key} className={cx('ds-screen-blink', `is-${veil.phase}`)} aria-hidden="true" />}
    </div>
  )
}

/**
 * Une rangée de commandes qui OCCUPE SA LARGEUR : la place libre se répartit à parts égales entre
 * les boutons et aux deux bouts, au lieu de les serrer au centre derrière un écart fixe. L'écart
 * devient une mesure du conteneur — la même rangée respire sur un iPad et se resserre sur un
 * iPhone SE, sans réglage. En dessous de la place nécessaire, l'écart tombe à son minimum (la
 * marge des halos) puis la rangée se replie.
 *
 * Elle NE POSE PAS de marge latérale : celle de son conteneur (le pied, le corps) suffit, et
 * `space-evenly` laisse déjà de la place aux deux bouts.
 *
 * `label` en fait un groupe nommé pour les lecteurs d'écran (« Commandes de la vue », « Catégories ») ;
 * sans lui, ce n'est qu'une boîte, et ce sont les boutons qui se nomment.
 */
export function ButtonBar({ label, className, ...rest }: Props<HTMLDivElement> & { label?: string }) {
  return <div role={label ? 'group' : undefined} aria-label={label} className={cx('ds-button-bar', className)} {...rest} />
}
