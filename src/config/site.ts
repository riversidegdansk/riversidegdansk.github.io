import settingsData from '../data/settings.json';

const parseHoursValue = (value: string | undefined): string => {
  if (!value) return '';
  const match = value.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
  return match ? `${match[1]}-${match[2]}` : '';
};

const hoursSchema = [
  `Mo ${parseHoursValue(settingsData.hours_monday)}`,
  `Tu ${parseHoursValue(settingsData.hours_tuesday)}`,
  `We ${parseHoursValue(settingsData.hours_wednesday)}`,
  `Th ${parseHoursValue(settingsData.hours_thursday)}`,
  `Fr ${parseHoursValue(settingsData.hours_friday)}`,
  `Sa ${parseHoursValue(settingsData.hours_saturday)}`,
  `Su ${parseHoursValue(settingsData.hours_sunday)}`,
].filter((slot) => slot.includes('-')).join('; ');

// Godziny w formacie schema.org (OpeningHoursSpecification) — dla danych strukturalnych restauracji.
const DAYS = [
  ['Monday',    settingsData.hours_monday],
  ['Tuesday',   settingsData.hours_tuesday],
  ['Wednesday', settingsData.hours_wednesday],
  ['Thursday',  settingsData.hours_thursday],
  ['Friday',    settingsData.hours_friday],
  ['Saturday',  settingsData.hours_saturday],
  ['Sunday',    settingsData.hours_sunday],
] as const;

const openingHoursSpecification = DAYS.flatMap(([day, value]) => {
  const [opens, closes] = parseHoursValue(value).split('-');
  return opens && closes
    ? [{ '@type': 'OpeningHoursSpecification', dayOfWeek: `https://schema.org/${day}`, opens, closes }]
    : [];
});

// „80-748 Gdańsk” → kod pocztowy i miejscowość osobno (schema.org PostalAddress).
const cityMatch = settingsData.city.match(/^(\d{2}-\d{3})\s+(.+)$/);

export const SITE = {
  name: 'Riverside. Dym i Ogień',
  fullName: 'Restauracja Riverside. Dym i Ogień',
  alternateName: ['Riverside Dym i Ogień', 'Riverside Gdańsk'],
  description: 'Riverside. Dym i Ogień — restauracja nad Motławą w Gdańsku. Kuchnia na żywym ogniu, piwo Pilsner Urquell prosto z tanka.',
  url: 'https://www.riversidegdansk.pl',
  finalUrl: 'https://www.riversidegdansk.pl',
  lang: 'pl',
  locale: 'pl_PL',
  themeColor: '#C95A1A',
  bgColor: '#111315',
  ogImage: 'https://res.cloudinary.com/riverside/image/upload/f_auto,q_auto,w_1200,h_630,c_fill/riverside-og-default',
} as const;

export const CONTACT = {
  address:      settingsData.address,
  city:         settingsData.city,
  postalCode:   cityMatch?.[1] ?? '',
  locality:     cityMatch?.[2] ?? settingsData.city,
  phone:        settingsData.phone,
  phoneWork:    settingsData.phone_bot,
  phoneEvents:    settingsData.phone_manager,
  phoneHref:    `tel:${settingsData.phone.replace(/\s/g, '')}`,
  phoneWorkHref:`tel:${settingsData.phone_bot.replace(/\s/g, '')}`,
  phoneEventsHref:`tel:${settingsData.phone_manager.replace(/\s/g, '')}`,
  email:        settingsData.email,
  emailHref:    `mailto:${settingsData.email}`,
  reservationUrl: settingsData.reservation_url,
  hours: [
    settingsData.hours_monday,
    settingsData.hours_tuesday,
    settingsData.hours_wednesday,
    settingsData.hours_thursday,
    settingsData.hours_friday,
    settingsData.hours_saturday,
    settingsData.hours_sunday,
  ],
  region: 'pomorskie',
  country: 'PL',
  nip: '',
  regon: '',
  hoursSchema,
  openingHoursSpecification,
  lat: 54.34801648908613,
  lng: 18.656882571164516,
  mapsUrl: 'https://maps.app.goo.gl/8UKffkh9tswHGx647',
  mapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2325.5164748128354!2d18.6568933!3d54.3478539!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x46fd73971ce21083%3A0x6ec5626f9bca4c7d!2sRiverside%20Dym%20i%20Ogie%C5%84!5e0!3m2!1spl!2spl!4v1786628571645!5m2!1spl!2spl',
} as const;

export const SOCIAL = {
  facebook:   'https://www.facebook.com/riversidegdansk/',
  instagram:  'https://www.instagram.com/riversidegdansk/',
  tiktok:     'https://www.tiktok.com/@riverside_gdansk',
  googleMaps: 'https://maps.app.goo.gl/HJFKB67eAdpTHTi57',
  youtube:    'https://www.youtube.com/@riversidegdansk',
} as const;

export const CLOUDINARY = {
  cloudName: 'riverside',
  baseUrl: 'https://res.cloudinary.com',
} as const;

export const FORMSPARK = {
  formId: import.meta.env.PUBLIC_FORMSPARK_FORM_ID,
  eventsFormId: import.meta.env.PUBLIC_FORMSPARK_EVENTS_FORM_ID,
  url: 'https://submit-form.com',
} as const;

export const TURNSTILE = {
  siteKey: import.meta.env.PUBLIC_TURNSTILE_SITE_KEY,
} as const;

export const NAV = [
  { label: 'Start',                href: '/' },
  { label: 'O nas',                href: '/about' },
  { label: 'Menu',                 href: '/menu' },
  { label: 'Imprezy',              href: '/events' },
  { label: 'Galeria',              href: '/gallery' },
  { label: 'Riverside od Kuchni',  href: '/posts' },
  { label: 'FAQ',                  href: '/faq' },
  { label: 'Kontakt',              href: '/contact' },
] as const;

export const NAV_CTA = {
  label: 'Zarezerwuj stolik',
  href: '/reservations',
} as const;

export const FOOTER_NAV = [
  { label: 'Menu',                  href: '/menu' },
  { label: 'O nas',                 href: '/about' },
  { label: 'Imprezy',               href: '/events' },
  { label: 'Rezerwacje',            href: NAV_CTA.href },
  { label: 'Galeria',               href: '/gallery' },
  { label: 'Riverside od Kuchni',   href: '/posts' },
  { label: 'FAQ',                   href: '/faq' },
  { label: 'Kontakt',               href: '/contact' },
] as const;

export const FOOTER_LEGAL = [
  { label: 'Polityka prywatności',  href: '/privacy' },
] as const;

export const BUSINESS = {
  type:               ['LocalBusiness', 'Restaurant'] as const,
  priceRange:         '$$',
  currenciesAccepted: 'PLN',
  paymentAccepted:    'Cash, Credit Card, Bank Transfer',
  areaServed:         'Gdańsk',
} as const;

export const SAME_AS = Object.values(SOCIAL).filter(Boolean);

// Szef kuchni — osoba w danych strukturalnych (autor przepisów, E-E-A-T).
export const CHEF = {
  name:     'Michał Rybak',
  jobTitle: 'Szef kuchni',
  image:    'riverside-dym-ogien-gdansk-chef-michal-rybak',
  url:      '/posts/06-chef-michal-rybak/',
  sameAs:   ['https://www.tiktok.com/@rybalikeachef'],
} as const;

// Kuchnie i zdjęcia restauracji do danych strukturalnych (Restaurant).
export const RESTAURANT = {
  servesCuisine: ['Polska', 'Europejska', 'Włoska', 'Grill', 'Azjatycka'],
  images: [
    'riverside-dym-ogien-gdansk-galeria-otoczenie-fot-2',
    'riverside-dym-ogien-gdansk-galeria-wnetrza-fot-5',
    'riverside-dym-ogien-gdansk-galeria-tank-fot-12',
    'riverside-dym-ogien-gdansk-sekcja-menu-golonka',
  ],
} as const;

export const MEDIA = {
  logo: {
    src:       '/images/logo-riverside-biale-transparent-czerwone-plomienie.webp',
    alt:       'Logo Restauracji Riverside. Dym i Ogień z Gdańska',
    width:     150,
    height:    150,
    navWidth:  150,
    navHeight: 150,
  },
  favicon: {
  ico:            '/favicons/favicon.ico',
  svg:            '/favicons/favicon.svg',
  appleTouchIcon: '/favicons/apple-touch-icon.png',
  icon96:         '/favicons/favicon-96x96.png',
  icon192:        '/favicons/web-app-manifest-192x192.png',
  icon512:        '/favicons/web-app-manifest-512x512.png',
  manifest:       '/favicons/site.webmanifest',
},
} as const;

export const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

// Ścieżki stron zawsze z końcowym „/” — tak jak w canonical i sitemapie
// (GitHub Pages przekierowuje /menu na /menu/, co kosztuje dodatkowe przejście).
export function withBase(path: string): string {
  const cut = path.search(/[?#]/);
  const pathname = cut === -1 ? path : path.slice(0, cut);
  const suffix = cut === -1 ? '' : path.slice(cut);
  const isPage = pathname !== '' && !pathname.endsWith('/') && !/\.[a-z0-9]+$/i.test(pathname);
  return `${BASE}${isPage ? `${pathname}/` : pathname}${suffix}`;
}

export const ANALYTICS = {
  gtmId: '',
} as const;