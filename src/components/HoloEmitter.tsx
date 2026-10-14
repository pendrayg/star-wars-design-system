import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from './cx'

/**
 * Émetteur holographique : un socle et son faisceau, qui projettent ce qu'on leur donne — en
 * général un `Icon` de glyphe Star Wars portant la classe `ds-holo`.
 *
 * Il porte un NOM ACCESSIBLE, contrairement à `Icon` : une projection n'est pas un ornement de
 * commande mais le sujet lui-même (le vaisseau d'une ligne, le personnage d'une priorité), et
 * l'enfant qu'il projette est, lui, décoratif.
 *
 * La PHASE du clignotement reste à l'app : `--holo-delay`, posé en style sur cet élément ou hérité
 * d'un ancêtre (la ligne d'un tableau). Sans elle, toutes les projections décrochent ensemble — ce
 * qui est juste tant qu'il n'y en a qu'une à l'écran.
 */
export function HoloEmitter({ label, children, className, ...rest }: { label: string; children?: ReactNode } & HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cx('ds-holo-emitter', className)} role="img" aria-label={label} {...rest}>
      {children}
    </span>
  )
}
