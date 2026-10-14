import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from './cx'

/** Chargement : un petit tube néon rond qui pulse ; `compact`, le point seul. */
export function Spinner({ label = 'Chargement…', compact = false }: { label?: string; compact?: boolean }) {
  return (
    <div className={compact ? 'ds-spinner ds-spinner-compact' : 'ds-spinner'} role="status" aria-label={label}>
      <span className="ds-spinner-dot" aria-hidden="true" />
      {!compact && <span>{label}</span>}
    </div>
  )
}

/** Message : un texte d'accompagnement dont seul le mot clé (`title`) est appuyé. */
export function Notice({ tone, title, children, className, ...rest }: { tone?: 'warn' | 'ok'; title?: ReactNode; children?: ReactNode } & HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cx('ds-notice', tone && `ds-${tone}`, className)} {...rest}>
      {title && <strong>{title}</strong>} {children}
    </p>
  )
}

/** Zone : délimitée par une bordure fine, jamais par un tube néon. */
export function Zone({ className, ...rest }: HTMLAttributes<HTMLElement>) {
  return <section className={cx('ds-zone', className)} {...rest} />
}

/** Châssis de visée : le bord d'un écran de ciblage, qu'un balayage parcourt une fois. Il entoure
 *  un contenu entier (un graphique, une carte) là où `Zone` délimite un panneau. */
export function Frame({ className, ...rest }: HTMLAttributes<HTMLElement>) {
  return <section className={cx('ds-frame', className)} {...rest} />
}

/**
 * Lecture d'instrument : un intitulé ambre et, s'il y a lieu, la valeur mesurée en chiffres
 * rouges. `digits` est à part de `children` parce que l'encre dit le rôle — ce qui est mesuré
 * n'est pas ce qui le nomme, et une app ne doit pas avoir à poser la classe elle-même.
 */
export function Readout({ digits, children, className, ...rest }: { digits?: ReactNode } & HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cx('ds-readout', className)} {...rest}>
      {children}
      {digits !== undefined && <span className="ds-digits"> {digits}</span>}
    </span>
  )
}
