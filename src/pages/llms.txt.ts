// src/pages/llms.txt.ts
// Generuje /llms.txt podczas astro build
// Standard: https://llmstxt.org

import type { APIRoute } from 'astro';
import { SITE, CONTACT, SOCIAL } from '../config/site';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const posts = (await getCollection('posts', ({ data }) => data.published))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  const content = `# ${SITE.fullName}

> Restauracja nad Motławą w Gdańsku (${CONTACT.address}, ${CONTACT.city}), działająca od 2019 roku. Kuchnię prowadzi Chef Michał Rybak: dania przygotowywane od podstaw — wolno pieczona golonka, żeberka BBQ, ręcznie siekany tatar, ryby, makarony, pizza i smaki inspirowane kuchnią azjatycką. Jako pierwszy lokal na Pomorzu serwujemy niepasteryzowanego Pilsnera Urquell prosto z tanka. Organizujemy imprezy prywatne i firmowe: sala VIP do 50 osób lub cały lokal na wyłączność dla około 150 gości.

## Informacje praktyczne

- Adres: ${CONTACT.address}, ${CONTACT.city} — nad Motławą, tuż za Zieloną Bramą i Mostem Zielonym
- Godziny otwarcia: ${CONTACT.hours.join('; ')}
- Rezerwacja stolików: online (${CONTACT.reservationUrl}, maksymalnie 10 miejsc) lub telefonicznie ${CONTACT.phoneWork}
- Imprezy i eventy: ${CONTACT.phoneEvents}
- E-mail: ${CONTACT.email}
- Google Maps: ${CONTACT.mapsUrl}

## Główne strony

- [Menu](${SITE.finalUrl}/menu/): Pełna karta — przekąski, zupy, sałatki, makarony, pizza, dania główne, specjalności i desery, z cenami
- [Rezerwacje](${SITE.finalUrl}/reservations/): Rezerwacja stolika online lub telefonicznie
- [Imprezy i wydarzenia](${SITE.finalUrl}/events/): Sala VIP do 50 osób, cały lokal do 150 osób — imprezy prywatne i firmowe
- [Zapytanie o imprezę](${SITE.finalUrl}/events-booking/): Formularz wstępnej rezerwacji wydarzenia
- [O nas](${SITE.finalUrl}/about/): Historia Riverside, Chef Michał Rybak, Pilsner Urquell z tanka
- [Galeria](${SITE.finalUrl}/gallery/): Zdjęcia lokalu, tarasu, wnętrz, baru z tankiem i dań
- [FAQ](${SITE.finalUrl}/faq/): Rezerwacje, godziny otwarcia, menu, piwo z tanka, imprezy, dzieci i psy
- [Kontakt](${SITE.finalUrl}/contact/): Adres, telefony, mapa dojazdu

## Blog „Riverside od Kuchni”

${posts.map(p => `- [${p.data.title}](${SITE.finalUrl}/posts/${p.id}/): ${p.data.excerpt}`).join('\n')}

## Optional

- [Pełna treść dla modeli językowych](${SITE.finalUrl}/llms-full.txt): Menu z cenami, oferta imprez, FAQ i wszystkie wpisy w jednym pliku
- [Facebook](${SOCIAL.facebook})
- [Instagram](${SOCIAL.instagram})
- [TikTok](${SOCIAL.tiktok})
- [YouTube](${SOCIAL.youtube})
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
