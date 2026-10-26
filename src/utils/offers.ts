import { getCollection, type CollectionEntry } from 'astro:content';

export type Offer = CollectionEntry<'offers'>;
export type OfferStatus = 'draft' | 'live' | 'expired';

const DAY = 24 * 60 * 60 * 1000;

// Menu okazjonalne jest widoczne od publikacji do końca dnia showUntil.
// Wyłączenie odbywa się przy codziennym rebuildzie (.github/workflows/deploy.yml, schedule).
export const offerStatus = ({ data }: Offer, now = new Date()): OfferStatus => {
  if (!data.published) return 'draft';
  if (now.valueOf() >= data.showUntil.valueOf() + DAY) return 'expired';
  return 'live';
};

const byOrder = (a: Offer, b: Offer) =>
  a.data.order - b.data.order || a.data.showUntil.valueOf() - b.data.showUntil.valueOf();

// Na www: tylko aktualne. W `astro dev`: wszystkie, ze znaczkiem statusu — do podglądu.
export const getVisibleOffers = async () =>
  (await getCollection('offers', (e) => import.meta.env.DEV || offerStatus(e) === 'live')).sort(byOrder);

// Podgląd dla redakcji na www (/menu/podglad/<nazwa>/, noindex): szkice.
export const getPreviewOffers = async () =>
  (await getCollection('offers', (e) => offerStatus(e) === 'draft')).sort(byOrder);

const fmt = (date: Date) =>
  date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });

// „23 grudnia 2026”
export const offerUntil = ({ data }: Offer) => fmt(data.showUntil);

export const offerStatusLabel = (offer: Offer): string | null => {
  switch (offerStatus(offer)) {
    case 'draft':     return 'Szkic — niewidoczny na stronie';
    case 'expired':   return `Zakończone ${fmt(offer.data.showUntil)}`;
    default:          return null;
  }
};
