import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cx } from './cx'
import { Icon } from './Icon'
import type { AnyIconName } from './glyphs'
import { Shade } from './Shade'
import { usePress } from './usePress'

export type ButtonTone = 'default' | 'primary' | 'danger' | 'link'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Couleur d'allumage : l'encre (défaut), le primaire, le danger, ou un lien d'action. */
  tone?: ButtonTone
  /** Taille d'un bouton à libellé. */
  size?: 'md' | 'sm'
  /** Icône avant le libellé — symbole d'interface ou glyphe Star Wars. */
  icon?: AnyIconName
  /** Plein feu, durablement : la destination courante, un réglage actif. Sans elle, le bouton est
   *  une commande MOMENTANÉE (`ds-momentary`) : il ne brille plus fort que le temps d'un appui. */
  active?: boolean
  /** Éteint au repos (posé dans une surface déjà cernée de néon) : il ne s'allume qu'à l'appui. */
  flat?: boolean
  children?: ReactNode
}

/**
 * Bouton à libellé : liseré néon au repos, plein feu pressé ou actif — un
 * toucher bref compris (cf. usePress). Un bouton à bascule passe `aria-pressed` et `active` ensemble.
 */
export function Button({ tone = 'default', size = 'md', icon, active, flat = false, className, children, type = 'button', ...rest }: ButtonProps) {
  const { pressed, handlers } = usePress(rest)
  return (
    <button
      type={type}
      className={cx(
        'ds-button',
        'ds-text',
        size === 'sm' && 'ds-small',
        tone !== 'default' && `ds-${tone}`,
        active && 'ds-active',
        active === undefined && 'ds-momentary',
        pressed && 'ds-pressed',
        flat && 'ds-flat',
        className,
      )}
      {...rest}
      {...handlers}
    >
      <Shade />
      {icon && <Icon name={icon} />}
      {children !== undefined && children !== null && <span className="ds-label">{children}</span>}
    </button>
  )
}

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: AnyIconName
  /** Nom accessible : un bouton-icône n'a pas de texte. */
  label: string
  active?: boolean
  /** Échelle des grands éléments (gouttière k = 1/2), quand il est logé dans une barre de même échelle. */
  large?: boolean
  tone?: ButtonTone
}

/** Bouton-icône : un carré de la hauteur d'une commande (--control-height : 50 px au doigt, 33 à la
 *  souris), au rayon des commandes (--control-radius). */
export function IconButton({ icon, label, active, large = false, tone = 'default', className, type = 'button', ...rest }: IconButtonProps) {
  const { pressed, handlers } = usePress(rest)
  return (
    <button
      type={type}
      aria-label={label}
      className={cx('ds-button', 'ds-icon', large && 'ds-large', tone !== 'default' && `ds-${tone}`, active && 'ds-active', active === undefined && 'ds-momentary', pressed && 'ds-pressed', className)}
      {...rest}
      {...handlers}
    >
      <Shade />
      <Icon name={icon} />
    </button>
  )
}
