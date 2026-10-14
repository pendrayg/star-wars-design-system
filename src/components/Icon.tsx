import type { HTMLAttributes } from 'react'
import { cx } from './cx'
import { GLYPH_SET, type AnyIconName } from './glyphs'

/**
 * Une icône du DS. Décorative par défaut : le nom accessible est porté par la commande.
 *
 * DEUX POLICES, UN SEUL COMPOSANT. Le DS en sert deux — la Symbols Nerd Font pour les symboles
 * d'interface (`ICONS`), les Star Wars GlyphIcons pour le bestiaire (`GLYPHS`) — et c'est le NOM
 * qui désigne la famille, jamais un paramètre : les deux listes sont disjointes (un test le
 * garde), donc l'appelant écrit `<Icon name="xwing"/>` comme `<Icon name="close"/>` et n'a pas à
 * savoir laquelle des deux rend son icône.
 */
export function Icon({ name, className, ...rest }: { name: AnyIconName } & HTMLAttributes<HTMLElement>) {
  const glyphe = GLYPH_SET.has(name)
  return <i className={cx(glyphe ? 'swg' : 'nf', glyphe ? `swg-${name}` : `nf-md-${name}`, className)} aria-hidden="true" {...rest} />
}
