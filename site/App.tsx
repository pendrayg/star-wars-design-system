import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { Button, IconButton } from '../src/components/Button'
import { ChartFilters } from '../src/components/ChartFilters'
import { DeleteButton } from '../src/components/DeleteButton'
import { Disclosure, DisclosureButton } from '../src/components/Disclosure'
import { Reveal } from '../src/components/Reveal'
import { Selectable, SelectToggle } from '../src/components/Selection'
import { Frame, Notice, Readout, Spinner, Zone } from '../src/components/Feedback'
import { GLYPHS } from '../src/components/glyphs'
import { HoloEmitter } from '../src/components/HoloEmitter'
import { HyperspaceJump } from '../src/components/HyperspaceJump'
import { Icon } from '../src/components/Icon'
import { useHyperspaceJump } from '../src/components/useHyperspaceJump'
import { Checkbox, Input, Select } from '../src/components/Field'
import { FlatSelector } from '../src/components/FlatSelector'
import { FoldingGrid } from '../src/components/FoldingGrid'
import { ImageButton, type ImageButtonVariant } from '../src/components/ImageButton'
import { Body, ButtonBar, Footer, Header, Screen, Slides } from '../src/components/Layout'
import { MenuBar, type MenuItem } from '../src/components/MenuBar'
import { SearchField } from '../src/components/SearchField'
import { SetImage } from '../src/components/SetImage'
import { LOGOS } from './logos'
import pkg from '../package.json'

type Theme = 'system' | 'dark' | 'light'

const THEMES: { id: Theme; label: string }[] = [
  { id: 'system', label: "De l'appareil" },
  { id: 'dark', label: 'Sombre' },
  { id: 'light', label: 'Clair' },
]

type Density = 'system' | 'compact' | 'comfortable'

const DENSITIES: { id: Density; label: string }[] = [
  { id: 'system', label: 'Du pointeur' },
  { id: 'compact', label: 'Compacte' },
  { id: 'comfortable', label: 'Confortable' },
]

type Scanlines = 'system' | 'off'

const SCANLINES: { id: Scanlines; label: string }[] = [
  { id: 'system', label: 'Rayures' },
  { id: 'off', label: 'Sans' },
]

const SECTIONS = [
  { id: 'fondations', title: 'Fondations' },
  { id: 'typographie', title: 'Typographie' },
  { id: 'glyphes', title: 'Glyphes Star Wars' },
  { id: 'visee', title: 'Visée et holo' },
  { id: 'boutons', title: 'Boutons' },
  { id: 'images', title: 'Boutons à image' },
  { id: 'serties', title: 'Images serties' },
  { id: 'graphiques', title: 'Graphiques' },
  { id: 'champs', title: 'Champs' },
  { id: 'menu', title: 'Barre de menu' },
  { id: 'selecteur', title: 'Sélecteur multiple plat' },
  { id: 'ecran', title: 'Écran' },
  { id: 'rangee', title: 'Rangée de commandes' },
  { id: 'glissement', title: 'Écrans qui glissent' },
  { id: 'grille', title: 'Grille dépliante' },
  { id: 'depliantes', title: 'Sections dépliantes' },
  { id: 'selection', title: 'Sélection' },
  { id: 'retours', title: 'Zones et messages' },
]

/** Une progression de neuf points, en pourcentage : de quoi montrer le halo d'une donnée. */
const COURBE = [-1.2, 2.1, 3.8, 5.2, 8.4, 7.2, 12.6, 16.2, 20.4]

/** Quatre parts, dans les teintes des palettes du DS. */
const PARTS: [string, number, string][] = [
  ['Actions', 46, 'var(--grad-glacier-to)'],
  ['Immobilier', 24, 'var(--grad-solar-to)'],
  ['Obligations', 18, 'var(--grad-fern-to)'],
  ['Liquidités', 12, 'var(--grad-dusk-to)'],
]

/** Le bestiaire entier, avec son nom : c'est la liste qu'une app parcourt pour choisir. */
function Glyphes() {
  return (
    <ul className="glyph-grid">
      {GLYPHS.map((nom) => (
        <li key={nom}>
          <Icon name={nom} />
          <code>{nom}</code>
        </li>
      ))}
    </ul>
  )
}

/** Un châssis de visée autour d'un graphique, deux lectures, et une projection holographique. */
function Visee() {
  return (
    <div className="stack visee-demo">
      <Frame>
        <Charts />
      </Frame>
      <div className="row">
        <Readout digits="12,4 pc">Distance</Readout>
        <Readout digits="0,7">Charge du cap</Readout>
        <Readout>Cap verrouillé</Readout>
      </div>
      <div className="row holo-demo">
        {(['xwing', 'tie', 'falcon'] as const).map((vaisseau, rang) => (
          // Le déphasage est DÉRIVÉ du rang : stable d'un rendu à l'autre, là où un tirage au sort
          // rejouerait à chaque fois et ferait sauter l'effet.
          <HoloEmitter key={vaisseau} label={vaisseau} style={{ '--holo-delay': `${rang * 2.6}s` } as CSSProperties}>
            <Icon name={vaisseau} className="ds-holo" />
          </HoloEmitter>
        ))}
      </div>
    </div>
  )
}

function Charts() {
  const largeur = 420
  const hauteur = 150
  const points = COURBE.map((valeur, index) => [
    8 + (index * (largeur - 16)) / (COURBE.length - 1),
    hauteur - 14 - ((valeur + 4) * (hauteur - 28)) / 26,
  ])
  // Une courbe lissée : chaque point tire ses tangentes de ses voisins (Catmull-Rom).
  const courbe = points.reduce((chemin, point, index) => {
    if (index === 0) return `M ${point[0].toFixed(1)} ${point[1].toFixed(1)}`
    const avant = points[index - 2] ?? points[index - 1]
    const depuis = points[index - 1]
    const apres = points[index + 1] ?? point
    const c1 = [depuis[0] + (point[0] - avant[0]) / 6, depuis[1] + (point[1] - avant[1]) / 6]
    const c2 = [point[0] - (apres[0] - depuis[0]) / 6, point[1] - (apres[1] - depuis[1]) / 6]
    return `${chemin} C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)}, ${c2[0].toFixed(1)} ${c2[1].toFixed(1)}, ${point[0].toFixed(1)} ${point[1].toFixed(1)}`
  }, '')

  const centre = 90
  const dehors = 78
  const dedans = 52
  // L'angle de départ de chaque part se lit dans ce qui la précède : rien à reporter d'un rendu à l'autre.
  const avantChaque = PARTS.map((_, rang) => PARTS.slice(0, rang).reduce((total, [, part]) => total + part, 0))

  return (
    <div className="row charts-demo">
        <figure className="charts-demo-courbe">
          <svg viewBox={`0 0 ${largeur} ${hauteur}`} role="img" aria-label="Une progression de neuf points">
            <line className="charts-demo-axe" x1="8" y1={hauteur - 14} x2={largeur - 8} y2={hauteur - 14} />
            <path className="charts-demo-trait" d={courbe} filter="url(#ds-chart-groove)" />
          </svg>
          <figcaption>Le halo d’un trait : la courbe rayonne de sa propre teinte.</figcaption>
        </figure>

        <figure className="charts-demo-parts">
          <svg viewBox="0 0 180 180" role="img" aria-label="Une répartition en quatre parts">
            <g filter="url(#ds-chart-set)">
              {PARTS.map(([nom, part, teinte], rang) => {
                const delta = (part / 100) * Math.PI * 2
                const depart = -Math.PI / 2 + (avantChaque[rang] / 100) * Math.PI * 2
                const fin = depart + delta
                const bord = (rayon: number, a: number) =>
                  `${(centre + rayon * Math.cos(a)).toFixed(1)} ${(centre + rayon * Math.sin(a)).toFixed(1)}`
                const grand = delta > Math.PI ? 1 : 0
                return (
                  <path
                    key={nom}
                    className="charts-demo-part"
                    fill={teinte}
                    d={`M ${bord(dehors, depart)} A ${dehors} ${dehors} 0 ${grand} 1 ${bord(dehors, fin)} L ${bord(dedans, fin)} A ${dedans} ${dedans} 0 ${grand} 0 ${bord(dedans, depart)} Z`}
                  >
                    <title>{`${nom} · ${part} %`}</title>
                  </path>
                )
              })}
            </g>
          </svg>
          <figcaption>Le châssis : un liseré néon autour de la silhouette entière.</figcaption>
        </figure>
    </div>
  )
}

/** La même rangée dans deux largeurs : c'est l'ÉCART qui change, pas les boutons. */
function ButtonBarDemo() {
  const boutons = ['sun_thermometer', 'weather_sunny', 'leaf', 'weather_windy', 'water'] as const
  const rangee = (
    <ButtonBar label="Catégories">
      {boutons.map((icon) => (
        <IconButton key={icon} icon={icon} label={icon} />
      ))}
    </ButtonBar>
  )
  return (
    <div className="bar-widths">
      <div style={{ width: '100%' }}>{rangee}</div>
      <div style={{ width: '62%' }}>{rangee}</div>
      <div style={{ width: '38%' }}>{rangee}</div>
    </div>
  )
}

/** Trois écrans dans un cadre, et la barre de menu qui les choisit : le ruban glisse. */
function SlidesDemo() {
  const items: MenuItem<string>[] = [
    { id: 'un', icon: 'weather_sunny', label: 'Aperçu' },
    { id: 'deux', icon: 'map_marker_radius', label: 'Carte' },
    { id: 'trois', icon: 'leaf', label: 'Air' },
  ]
  const [at, setAt] = useState('un')
  const index = items.findIndex((item) => item.id === at)
  return (
    <div className="slides-demo">
      <Slides at={index}>
        {items.map((item) => (
          <div key={item.id} className="slides-card">
            {item.label}
          </div>
        ))}
      </Slides>
      <MenuBar label="Écrans" items={items} active={at} onSelect={setAt} />
    </div>
  )
}

function Demo({ id, title, intro, children }: { id: string; title: string; intro: string; children: ReactNode }) {
  return (
    <section className="demo" id={id} aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`}>{title}</h2>
      <p>{intro}</p>
      {children}
    </section>
  )
}

type RootAttribute = 'theme' | 'density' | 'scanlines'

/**
 * Pose un réglage sur <html>, où le DS le lit : `'system'` RETIRE l'attribut et rend la main à la
 * détection (`prefers-color-scheme`, `pointer: coarse`, rayures allumées), toute autre valeur la
 * force.
 *
 * Séparé du stockage ci-dessous, et c'est le thème qui l'impose : pendant un saut en hyperespace,
 * la valeur MÉMORISÉE est déjà la nouvelle, tandis que celle POSÉE sur <html> est encore l'ancienne.
 */
function useRootAttribute(attribute: RootAttribute, value: string) {
  useEffect(() => {
    const root = document.documentElement
    if (value === 'system') delete root.dataset[attribute]
    else root.dataset[attribute] = value
  }, [attribute, value])
}

/** Un réglage de la démo, mémorisé d'une visite à l'autre quand le stockage est disponible. */
function useStoredSetting<T extends string>(storageKey: string): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      return (localStorage.getItem(storageKey) as T | null) ?? ('system' as T)
    } catch {
      return 'system' as T
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, value)
    } catch {
      // Sans stockage, le réglage vaut pour la visite.
    }
  }, [storageKey, value])
  return [value, setValue]
}

/** Les deux à la fois : le cas ordinaire, où l'attribut suit le réglage sans délai. */
function useRootSetting<T extends string>(attribute: RootAttribute, storageKey: string): [T, (value: T) => void] {
  const [value, setValue] = useStoredSetting<T>(storageKey)
  useRootAttribute(attribute, value)
  return [value, setValue]
}

function SoundToggle() {
  const [on, setOn] = useState(true)
  return (
    <Button active={on} aria-pressed={on} icon={on ? 'volume_high' : 'volume_off'} onClick={() => setOn(!on)}>
      {on ? 'Sons activés' : 'Sons coupés'}
    </Button>
  )
}

function ImageRow({ variant }: { variant: ImageButtonVariant }) {
  const [on, setOn] = useState<Record<string, boolean>>({ Holo: true, Ambre: true })
  return (
    <div className="row">
      {LOGOS.map((logo) => (
        <ImageButton
          key={logo.name}
          variant={variant}
          name={logo.name}
          src={logo.src}
          pressed={!!on[logo.name]}
          onClick={() => setOn({ ...on, [logo.name]: !on[logo.name] })}
        />
      ))}
      <ImageButton variant={variant} name="Sans Image" pressed={false} />
    </div>
  )
}

/** Trois opérations à choisir : le bloc choisi s'allume, du geste de son bouton. */
function SelectionDemo() {
  const toutes = [
    { id: 'a', titre: 'Amundi Actions Monde ISR', detail: '08/01/2026 · achat · 200,24 €' },
    { id: 'b', titre: 'Fonds euros', detail: '08/03/2026 · frais · 6 172,84 €' },
    { id: 'c', titre: 'ETF S&P 500', detail: '08/02/2026 · dividende · 15 240,11 €' },
  ]
  const [lignes, setLignes] = useState(toutes)
  const [choisis, setChoisis] = useState<Set<string>>(new Set(['b']))
  const basculer = (id: string) =>
    setChoisis((avant) => {
      const apres = new Set(avant)
      if (apres.has(id)) apres.delete(id)
      else apres.add(id)
      return apres
    })
  // Le compte reste celui de la dernière sélection le temps du repli : la barre ne doit pas
  // annoncer « 0 sélectionnée » pendant qu'elle s'en va.
  const [compte, setCompte] = useState(choisis.size)
  if (choisis.size > 0 && choisis.size !== compte) setCompte(choisis.size)
  return (
    <div className="selection-demo">
      <Reveal open={choisis.size > 0}>
        <div className="selection-demo-actions">
          <strong>
            {compte} sélectionnée{compte > 1 ? 's' : ''}
          </strong>
          <div className="row">
            <Button size="sm">Reclasser</Button>
            <DeleteButton
              label="Supprimer"
              withLabel
              size="sm"
              onDelete={() => {
                setLignes((avant) => avant.filter((ligne) => !choisis.has(ligne.id)))
                setChoisis(new Set())
              }}
            />
            <Button size="sm" onClick={() => setChoisis(new Set())}>
              Annuler
            </Button>
          </div>
        </div>
      </Reveal>
      {lignes.map((ligne) => (
        <Selectable key={ligne.id} selected={choisis.has(ligne.id)} className="selection-demo-ligne">
          <div className="selection-demo-texte">
            <strong>{ligne.titre}</strong>
            <span>{ligne.detail}</span>
          </div>
          <SelectToggle selected={choisis.has(ligne.id)} onToggle={() => basculer(ligne.id)} label={`Sélectionner ${ligne.titre}`} />
        </Selectable>
      ))}
      {lignes.length < toutes.length && (
        <div className="row">
          <Button size="sm" onClick={() => setLignes(toutes)}>
            Tout rétablir
          </Button>
        </div>
      )}
    </div>
  )
}

/** Trois catégories à supprimer : un premier appui arme la poubelle, le second supprime. */
function DeleteDemo() {
  const toutes = ['Électricité', 'Eau', 'Internet + téléphones']
  const [restantes, setRestantes] = useState(toutes)
  return (
    <div className="selection-demo">
      {restantes.map((nom) => (
        <div key={nom} className="selection-demo-ligne">
          <div className="selection-demo-texte">
            <strong>{nom}</strong>
            <span>Un appui arme, le second supprime.</span>
          </div>
          <DeleteButton label={`Supprimer ${nom}`} onDelete={() => setRestantes((avant) => avant.filter((n) => n !== nom))} />
        </div>
      ))}
      <div className="row">
        {restantes.length < toutes.length ? (
          <Button size="sm" onClick={() => setRestantes(toutes)}>
            Tout rétablir
          </Button>
        ) : (
          <DeleteButton label="Tout effacer" withLabel size="sm" onDelete={() => setRestantes([])} />
        )}
      </div>
    </div>
  )
}

/** Trois groupes de réglages, comme une page de préférences s'en donne. */
function Depliantes() {
  return (
    <div className="stack">
      <Disclosure title="Portefeuille" hint="L'origine des prix et la famille des supports" icon="chart_donut">
        <div className="stack">
          <Select
            aria-label="Origine des prix"
            defaultValue="marche"
            options={[
              { value: 'marche', label: 'Cours de marché si plus récents' },
              { value: 'releve', label: 'VL de mes relevés' },
            ]}
          />
          <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: 13 }}>Plus frais, mais un cours de bourse n'est pas la valeur de part retenue par votre contrat.</p>
          <div className="row">
            <Button>Actions</Button>
            <Button>Obligations</Button>
            <Button>Fonds euros</Button>
          </div>
        </div>
      </Disclosure>
      <Disclosure title="Immobilier" hint="Le bien, les travaux, le prêt et le marché" icon="home">
        <div className="stack">
          <Input aria-label="Prix d'achat" defaultValue="245 000 €" />
          <Input aria-label="Frais de notaire" defaultValue="18 400 €" />
          <label className="row" style={{ gap: 12 }}>
            <Checkbox defaultChecked /> Résidence principale
          </label>
        </div>
      </Disclosure>
      <Disclosure title="Mes données" hint="Sauvegarde, restauration, effacement" icon="cloud">
        <Notice>Vos saisies restent dans ce navigateur : rien n'est envoyé ni conservé sur un serveur.</Notice>
      </Disclosure>
    </div>
  )
}

/** Deux sections qui s'allument, dépliées, du néon d'un élément choisi. */
function DepliantesEnfoncees() {
  return (
    <div className="stack stack-creux">
      <Disclosure title="Revenus" hint="Le salaire de chacun, mois par mois" icon="tray_arrow_down" sunken>
        <div className="stack">
          <Input aria-label="Salaire" defaultValue="2 405,17 €" />
          <div className="row">
            <Button>Ajouter une ligne</Button>
          </div>
        </div>
      </Disclosure>
      <Disclosure title="Données" hint="Synchronisation et sauvegarde" icon="cloud" sunken defaultOpen>
        <div className="row">
          <Button icon="tray_arrow_down">Télécharger</Button>
          <Button icon="tray_arrow_up">Restaurer</Button>
        </div>
      </Disclosure>
    </div>
  )
}

/** La section est le bouton : un appui sur l'en-tête l'allume tout entier et déplie le contenu dedans. */
function BoutonsDepliants() {
  return (
    <div className="stack">
      <DisclosureButton title="Personnes" hint="Mélanie et Yoann" icon="account">
        <div className="stack">
          <Input aria-label="Première personne" defaultValue="Mélanie" />
          <Input aria-label="Seconde personne" defaultValue="Yoann" />
        </div>
      </DisclosureButton>
      <DisclosureButton title="Données" hint="Synchronisation et sauvegarde" icon="cloud">
        <div className="row">
          <Button icon="tray_arrow_down">Télécharger</Button>
          <Button icon="tray_arrow_up">Restaurer</Button>
        </div>
      </DisclosureButton>
    </div>
  )
}

function Fields() {
  const [query, setQuery] = useState('')
  const [region, setRegion] = useState('FR')
  return (
    <div className="stack">
      <SearchField aria-label="Rechercher" placeholder="Film ou série" value={query} onChange={setQuery} onClear={() => setQuery('')} />
      <Input aria-label="Nom" placeholder="Nom" />
      <Select
        aria-label="Région"
        value={region}
        onChange={(event) => setRegion(event.target.value)}
        options={[
          { value: 'BE', label: 'Belgique' },
          { value: 'FR', label: 'France' },
          { value: 'CH', label: 'Suisse' },
        ]}
      />
      <label className="row" style={{ gap: 12 }}>
        <Checkbox defaultChecked /> Épisode vu
      </label>
    </div>
  )
}

const MENU: MenuItem<'home' | 'search' | 'profile'>[] = [
  { id: 'home', icon: 'home', label: 'Accueil' },
  { id: 'search', icon: 'magnify', label: 'Recherche' },
  { id: 'profile', icon: 'account', label: 'Profil' },
]

function Menu() {
  const [active, setActive] = useState<'home' | 'search' | 'profile'>('home')
  return (
    <div style={{ maxWidth: 420 }}>
      <MenuBar label="Sections" items={MENU} active={active} onSelect={setActive} />
    </div>
  )
}

function RangeDemo() {
  const [range, setRange] = useState('today')
  return (
    <div style={{ maxWidth: 420 }}>
      <FlatSelector
        label="Plage"
        value={range}
        onChange={setRange}
        options={[
          { id: 'today', label: "Aujourd'hui" },
          { id: 'tomorrow', label: 'Demain' },
          { id: 'week', label: '7j' },
          { id: 'fortnight', label: '14j' },
        ]}
      />
    </div>
  )
}

const PAYS = [
  { id: 'DE', label: 'Allemagne' },
  { id: 'BE', label: 'Belgique' },
  { id: 'CA', label: 'Canada' },
  { id: 'ES', label: 'Espagne' },
  { id: 'US', label: 'États-Unis' },
  { id: 'FR', label: 'France' },
  { id: 'IT', label: 'Italie' },
  { id: 'JP', label: 'Japon' },
  { id: 'GB', label: 'Royaume-Uni' },
  { id: 'CH', label: 'Suisse' },
]

function CountryDemo() {
  const [country, setCountry] = useState('FR')
  return (
    <div style={{ maxWidth: 420 }}>
      <FlatSelector label="Pays" multiline value={country} onChange={setCountry} options={PAYS} />
    </div>
  )
}

function ScreenDemo() {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState<'home' | 'search' | 'profile'>('search')
  return (
    <>
    <div className="screen-frame">
      <Screen>
        <Header>
          <SearchField aria-label="Rechercher" placeholder="Film ou série" value={query} onChange={setQuery} onClear={() => setQuery('')} />
        </Header>
        <Body>
          <div className="screen-cards">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="screen-card">
                {LOGOS[i % 4].name}
              </div>
            ))}
          </div>
        </Body>
        <Footer>
          <MenuBar label="Sections" items={MENU} active={active} onSelect={setActive} />
        </Footer>
      </Screen>
    </div>
    <p className="legend">
      Le cadre a la largeur d'un iPhone, pas sa densité : celle-ci se règle à la racine de la page.
      Pour voir cet écran tel qu'un téléphone le rend, choisissez « Confortable » ci-dessus, ou
      émulez un appareil tactile.
    </p>
    </>
  )
}

const PLATFORMS = Array.from({ length: 22 }, (_, i) => ({ id: i, name: `${LOGOS[i % 4].name} ${i + 1}`, src: LOGOS[i % 4].src }))

function Platforms() {
  const [picked, setPicked] = useState(() => new Set([0, 1, 2, 3, 4]))
  return (
    <div style={{ maxWidth: 380 }}>
      <FoldingGrid
        items={PLATFORMS}
        getKey={(item) => item.id}
        keepVisible={(item) => picked.has(item.id)}
        toggleLabel={`Toutes les plateformes (${PLATFORMS.length})`}
        renderItem={(item, fold) => (
          <ImageButton
            name={item.name}
            src={item.src}
            pressed={picked.has(item.id)}
            fold={fold}
            onClick={() => {
              const next = new Set(picked)
              if (next.has(item.id)) next.delete(item.id)
              else next.add(item.id)
              setPicked(next)
            }}
          />
        )}
      />
      <p className="after-fold">La suite de la page, poussée par le dépli.</p>
    </div>
  )
}

const COLORS = ['--color-bg', '--color-text', '--color-muted', '--color-primary', '--color-danger', '--color-border', '--grad-solar-to', '--grad-glacier-to', '--grad-fern-to']

export function App() {
  // LE THÈME PASSE PAR LE SAUT. Le bouton bascule `theme` tout de suite — c'est lui qu'on mémorise
  // —, mais ce qui est POSÉ sur <html> est la valeur retardée : la page ne change d'habillage
  // qu'une fois l'écran couvert par l'overlay, et on en ressort dans le nouveau thème.
  const [theme, setTheme] = useStoredSetting<Theme>('ds-theme')
  const { phase, value: themeApplique } = useHyperspaceJump(theme)
  useRootAttribute('theme', themeApplique)
  const [density, setDensity] = useRootSetting<Density>('density', 'ds-density')
  const [scanlines, setScanlines] = useRootSetting<Scanlines>('scanlines', 'ds-scanlines')
  return (
    <main className="site">
      {/* Ses identifiants sont fixes : il se rend UNE SEULE FOIS par page, et n'importe quel SVG
          les cite ensuite — ici les graphiques de deux sections. */}
      <ChartFilters />
      {phase && <HyperspaceJump phase={phase} />}
      <header className="site-head">
        <h1>Star Wars design system</h1>
        <p>
          Les jetons, les styles et les composants d'un design system natif Star Wars — version {pkg.version}. Des pilules, ce qui est carré est rond,
          deux polices et une seule graisse, un bestiaire de 157 glyphes, le grain d'un écran cathodique et des projections au signal instable.
          Touchez les commandes ; changez de thème pour voir le saut en hyperespace.
        </p>
        <div className="site-toolbar" role="group" aria-label="Thème">
          {THEMES.map((option) => (
            <Button key={option.id} size="sm" active={theme === option.id} aria-pressed={theme === option.id} onClick={() => setTheme(option.id)}>
              {option.label}
            </Button>
          ))}
        </div>
        <div className="site-toolbar" role="group" aria-label="Densité">
          {DENSITIES.map((option) => (
            <Button key={option.id} size="sm" active={density === option.id} aria-pressed={density === option.id} onClick={() => setDensity(option.id)}>
              {option.label}
            </Button>
          ))}
        </div>
        <div className="site-toolbar" role="group" aria-label="Rayures">
          {SCANLINES.map((option) => (
            <Button key={option.id} size="sm" active={scanlines === option.id} aria-pressed={scanlines === option.id} onClick={() => setScanlines(option.id)}>
              {option.label}
            </Button>
          ))}
        </div>
        <nav className="site-nav" aria-label="Sections">
          {SECTIONS.map((section) => (
            <a key={section.id} href={`#${section.id}`}>
              {section.title}
            </a>
          ))}
        </nav>
      </header>

      <Demo
        id="fondations"
        title="Fondations"
        intro="Plus d'ombre : tout ce qui se touche est cerné d'un liseré néon, celui du châssis de visée ramené à l'échelle d'une commande — un trait de 1,5 px, son halo au-dehors. Un appui ne l'enfonce pas, il le met plein feu : le halo s'élargit, un voile de lumière passe en dedans. Autour d'une commande, une gouttière de 72 px × k, que le halo occupe."
      >
        <div className="row">
          {[
            [0, 'var(--grad-solar-to)', 'Repos'],
            [1, 'var(--grad-solar-to)', 'Plein feu'],
            [1, 'var(--color-primary)', 'Primaire'],
            [1, 'var(--color-danger)', 'Danger'],
          ].map(([lit, teinte, label]) => (
            <figure className="swatch" key={label}>
              <div className="swatch-box ds-neon" style={{ '--lit': lit, '--neon-color': teinte } as CSSProperties} />
              <figcaption>{label}</figcaption>
            </figure>
          ))}
        </div>
        <h3>Couleurs</h3>
        <div className="colors">
          {COLORS.map((name) => (
            <div className="color" key={name}>
              <div className="color-chip" style={{ background: `var(${name})` }} />
              <code>{name}</code>
            </div>
          ))}
        </div>
      </Demo>

      <Demo
        id="typographie"
        title="Typographie"
        intro="Deux polices et une seule graisse. Le corps prend la SF Distant Galaxy (--font-body), les titres et les commandes son Alternate (--font-title) : des mots courts et capitaux ont la place de la variante large, un paragraphe entier se lirait comme une affiche. Aucune des deux n'a de gras — les sept font-weight: 700 du DS sont tombés à 400, parce qu'une graisse simulée par le navigateur épaissit le tracé et en brouille les contre-formes. La troisième police, la Starwars Kit, n'écrit pas des lettres mais des coques de vaisseaux : elle est exposée en jeton (--font-hull) et n'habille rien par défaut."
      >
        <h3>Titre de section</h3>
        <p>
          Un paragraphe ordinaire, en SF Distant Galaxy. La typographie ne suit pas l'échelle du support : 14, 15 et 16 px restent lisibles à 60 cm, et
          c'est pourquoi la densité ne déplace que les boîtes.
        </p>
        <p className="ds-holo">Et le même texte, projeté : teinte glacier, halo, signal instable.</p>
        <p className="hull-demo">Starwars Kit</p>
      </Demo>

      <Demo
        id="glyphes"
        title="Glyphes Star Wars"
        intro="La seconde police d'icônes du DS, à côté de la Symbols Nerd Font. Un seul composant les sert : Icon choisit la famille d'après le NOM, les deux listes étant disjointes — <Icon name=&quot;xwing&quot;/> s'écrit comme <Icon name=&quot;close&quot;/>, et une prop icon (bouton, menu, section dépliante, champ riche) accepte les deux."
      >
        <div className="row">
          <Button icon="xwing">Décoller</Button>
          <Button tone="danger" icon="deathstar">
            Détruire
          </Button>
          <IconButton icon="r2d2" label="Astromech" />
          <IconButton icon="close" label="Fermer" />
        </div>
        <h3>Les 157 glyphes</h3>
        <Glyphes />
      </Demo>

      <Demo
        id="visee"
        title="Visée et holo"
        intro="Le vocabulaire des écrans de ciblage. Le châssis (Frame) est le bord de l'écran lui-même : trait ambre de 2,5 px, rayon de 26 px, halo, et un balayage rouge qui le parcourt une seule fois. La lecture (Readout) est un panneau d'instrument, presque carré, dont les chiffres passent au rouge : l'encre dit le rôle. L'émetteur (HoloEmitter) projette ce qu'on lui donne — socle matériel, faisceau évasé qui s'arrête au sommet du sujet —, et le faisceau décroche avec lui, jamais le socle."
      >
        <Visee />
      </Demo>

      <Demo
        id="boutons"
        title="Boutons"
        intro="Un liseré néon au repos, plein feu pressés ou actifs : rien ne s'enfonce, le halo s'élargit et un voile de lumière passe en dedans. La lumière monte vite et pâlit plus lentement, sans rebond. Le primaire brille au glacier ; le bouton qui supprime, armé, au rouge."
      >
        <div className="row">
          <Button icon="tray_arrow_down">Sauvegarder</Button>
          <Button tone="primary" icon="check">
            Suivre
          </Button>
          <DeleteButton label="Effacer" withLabel onDelete={() => {}} />
          <Button tone="link">Choisir mes plateformes</Button>
          <Button disabled>Indisponible</Button>
        </div>
        <h3>Bascule</h3>
        <div className="row">
          <SoundToggle />
        </div>
        <h3>Icônes</h3>
        <div className="row">
          <IconButton icon="chevron_down" label="Déplier" />
          <IconButton icon="close" label="Fermer" large />
          <IconButton icon="refresh" label="Rafraîchir" active />
        </div>
      </Demo>

      <Demo
        id="images"
        title="Boutons à image"
        intro="Le bouton reste une surface du DS, l'image en est le contenu, posée au-dessus de son néon : le voile du plein feu se dessine autour d'elle. Éteinte tant que la bascule n'est pas allumée."
      >
        <h3>Sertie</h3>
        <ImageRow variant="set" />
        <h3>Pastille</h3>
        <ImageRow variant="chip" />
        <h3>Logo et nom</h3>
        <ImageRow variant="label" />
        <h3>Logo serti et nom</h3>
        <ImageRow variant="label-set" />
      </Demo>

      <Demo
        id="serties"
        title="Images serties"
        intro="Une image qu'on montre sans rien commander, un portrait : incrustée dans le chaton d'un bouton serti, sans la surface du bouton autour. Le chaton garde son tube, la lumière du DS qui cerne une image ; ce qui ne se touche pas ne passe jamais plein feu."
      >
        <h3>Taille du chaton</h3>
        <div className="row">
          {LOGOS.map((logo) => (
            <SetImage key={logo.name} name={logo.name} src={logo.src} />
          ))}
          <SetImage name="Sans Image" />
        </div>
        <h3>Portrait et nom</h3>
        <ul className="cast-demo">
          {LOGOS.slice(0, 2).map((logo) => (
            <li key={logo.name}>
              <SetImage name={logo.name} src={logo.src} size={44} decorative />
              <span>
                <strong>{logo.name}</strong>
                <br />
                <span className="cast-demo-role">Rôle</span>
              </span>
            </li>
          ))}
        </ul>
      </Demo>

      <Demo
        id="graphiques"
        title="Graphiques"
        intro="Un graphique n'est ni une commande ni une zone : quelques filtres lui suffisent. Plus de gravure : chaque marque est un tube néon et rayonne de sa propre teinte, comme un hologramme. Le halo d'un trait, pour une courbe — le trait flouté, posé deux fois sous lui, faute de quoi un trait mince n'en garderait qu'un voile. Celui d'une marque pleine, barre, symbole ou part, posé une fois et plus discret : elle retient tout son flou. Et le châssis, un liseré néon autour de la silhouette entière du graphique, à la teinte des commandes."
      >
        <Charts />
      </Demo>

      <Demo
        id="depliantes"
        title="Sections dépliantes"
        intro="Le système de la grille dépliante, pour un contenu quelconque : un intitulé, le contenu replié, et dessous le chevron de la grille, allumé tant que tout est affiché. Le dépli va ligne par ligne — un titre, un champ avec son libellé, une rangée de commandes côte à côte — et le néon de chaque commande s'amorce sitôt sa place faite : deux ratés, une retombée, puis il tient. Le repli est le dépli à l'envers, depuis le bas, et part dès l'appui : les tubes vacillent et s'éteignent. Avec `sunken`, la section dépliée s'allume tout entière, comme un élément choisi. Le bouton section dépliante (`DisclosureButton`) est une section en forme de bouton large : un appui sur son en-tête le met plein feu tout entier et déplie le contenu dedans."
      >
        <Depliantes />
        <h3>Qui s'allume</h3>
        <DepliantesEnfoncees />
        <h3>Bouton section dépliante</h3>
        <BoutonsDepliants />
      </Demo>

      <Demo
        id="selection"
        title="Sélection"
        intro="Ce qu'on choisit s'allume au lieu de se teinter, et ce qu'on peut en faire se déplie au-dessus, comme une section dépliante dont l'état tient lieu de chevron (Reveal). Le bouton qui choisit est un bouton à bascule — liseré au repos, puis plein feu, la case vide devenant cochée — et le bloc prend le néon plein feu du même geste. Pas de tube au repos : le bloc n'est pas une commande, il ne s'éclaire que choisi."
      >
        <SelectionDemo />
      </Demo>

      <Demo
        id="suppression"
        title="Suppression"
        intro="Supprimer se fait en deux appuis, sans boîte de dialogue. Au repos, la poubelle est à l'encre des commandes — une liste n'est pas une alerte. Le premier appui allume le bouton et l'arme : la poubelle passe au rouge, et son tube avec elle. Le second supprime. Armé, il désarme de lui-même au bout de trois secondes, ou dès qu'on touche ailleurs. Avec son libellé (« Tout effacer »), c'est un bouton à libellé, le nom rougissant avec la poubelle."
      >
        <DeleteDemo />
      </Demo>

      <Demo id="champs" title="Champs" intro="Des commandes, pas des zones : un liseré néon au repos, plein feu une fois engagées ou cochées. Texte à 16 px, pour qu'iOS ne zoome pas.">
        <Fields />
      </Demo>

      <Demo id="menu" title="Barre de menu" intro="Un cadre cerné de néon ; une pastille plein feu sous la destination courante, qui montre son libellé. D'une destination à l'autre, la pastille s'étire puis se rétracte. Chaque destination est une commande, à la hauteur de l'échelle du support.">
        <Menu />
      </Demo>

      <Demo
        id="selecteur"
        title="Sélecteur multiple plat"
        intro="Un choix parmi quelques-uns, côte à côte dans un cadre cerné de néon : la pastille plein feu s'étire jusqu'au nouveau choix puis se rétracte de l'ancien, comme la barre de menu, dans la hauteur d'une commande. Multiligne, les choix se replient sur autant de lignes qu'il en faut, et la pastille s'étire d'une ligne à l'autre : tous restent visibles, un toucher suffit, là où une liste déroulante en cache une douzaine."
      >
        <h3>Sur une ligne</h3>
        <RangeDemo />
        <h3>Multiligne</h3>
        <CountryDemo />
      </Demo>

      <Demo
        id="ecran"
        title="Écran"
        intro="Un en-tête et un pied fixes, un corps qui seul défile entre eux et passe dessous en s'effaçant en fondu (8 px). Le même écart, la place d'un halo, sous l'en-tête et au-dessus du pied."
      >
        <ScreenDemo />
      </Demo>

      <Demo
        id="rangee"
        title="Rangée de commandes"
        intro="Des commandes réparties sur toute la largeur qu'on leur donne : la place libre se partage à parts égales entre elles et aux deux bouts. L'écart est une mesure du conteneur, pas une constante — la même rangée, ici, dans trois largeurs. Quand la place manque, l'écart tombe à la marge des halos, puis la rangée se replie."
      >
        <ButtonBarDemo />
      </Demo>

      <Demo
        id="glissement"
        title="Écrans qui glissent"
        intro="Les écrans d'une app sont côte à côte : changer de destination fait glisser le ruban à gauche ou à droite selon l'ordre du menu — le mouvement dit où l'on va, pas seulement qu'on a changé. Tous restent montés (une carte garde son contexte) ; seul celui qu'on regarde est atteignable au doigt et au lecteur d'écran."
      >
        <SlidesDemo />
      </Demo>

      <Demo
        id="grille"
        title="Grille dépliante"
        intro="Repliée, une ligne, ou celles des éléments cochés. Le dépli va ligne par ligne : le cadre pousse la suite, puis le néon des boutons s'amorce — deux ratés, une retombée, puis il tient — pendant que la ligne suivante se découvre. Le repli est le dépli à l'envers : les tubes vacillent et s'éteignent."
      >
        <Platforms />
      </Demo>

      <Demo id="retours" title="Zones et messages" intro="Une zone porte une bordure fine, jamais de tube néon : la lumière est réservée aux commandes. Le chargement est un petit tube rond dont le halo pulse.">
        <div className="stack">
          <Zone>
            <strong>Une zone</strong> : une bordure fine.
          </Zone>
          <Notice tone="warn" title="Aucune plateforme cochée">
            : tout est en noir et blanc.
          </Notice>
          <Notice tone="ok" title="Sauvegarde restaurée">
            : 12 titres suivis.
          </Notice>
          <Spinner label="Plateformes…" />
        </div>
      </Demo>
    </main>
  )
}
