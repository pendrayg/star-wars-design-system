/** Logos inventés pour les démonstrations : un ambre, un holo, un rouge, un de nuit. */
const svg = (bg: string, fg: string, glyph: string, defs = '') =>
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs>${defs}</defs><rect width="100" height="100" fill="${bg}"/>${glyph.replace(/FG/g, fg)}</svg>`)

/* Les teintes sont les valeurs LITTÉRALES des palettes du DS (--grad-solar-to, --grad-glacier-to,
   --grad-blaze-to) : une image en `data:` ne lit aucune variable CSS, elle est hors du document. */
export const LOGOS = [
  // Ambre : le réticule d'un viseur.
  {
    name: 'Ambre',
    src: svg(
      '#1a1200',
      '#ffc500',
      '<circle cx="50" cy="50" r="26" fill="none" stroke="FG" stroke-width="6"/><path d="M50 10v18M50 72v18M10 50h18M72 50h18" stroke="FG" stroke-width="6" stroke-linecap="round"/>',
    ),
  },
  // Holo : la projection, socle compris.
  {
    name: 'Holo',
    src: svg(
      '#001020',
      '#a8e6ff',
      '<path d="M30 24h40L58 62H42z" fill="FG" opacity=".55"/><rect x="36" y="68" width="28" height="8" rx="4" fill="FG"/>',
    ),
  },
  // Braise : le moteur, vu de face.
  { name: 'Braise', src: svg('#1a0000', '#ff2d2d', '<path d="M28 72 50 22l22 50z" fill="FG"/><circle cx="50" cy="58" r="8" fill="#1a0000"/>') },
  // Nuit : une étoile, et le vide autour.
  {
    name: 'Nuit',
    src: svg(
      'url(#g)',
      '#e7fbff',
      '<path d="M50 16 56 44 84 50 56 56 50 84 44 56 16 50 44 44z" fill="FG"/>',
      '<radialGradient id="g"><stop offset="0" stop-color="#16202c"/><stop offset="1" stop-color="#05070a"/></radialGradient>',
    ),
  },
] as const
