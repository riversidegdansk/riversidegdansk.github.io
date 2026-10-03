// src/pages/llms-full.txt.ts
// Rozszerzona wersja llms.txt z pełną treścią kluczowych stron
// Przeznaczona dla modeli które indeksują głębiej

import type { APIRoute } from 'astro';
import { faqAnswerText } from '../utils/faq';
import { SITE, CONTACT, SOCIAL } from '../config/site';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const faqEntries = await getCollection('faq');
  const dishes     = await getCollection('menu',  ({ data }) => data.published);
  const posts      = await getCollection('posts', ({ data }) => data.published);

  const sortedFaq   = faqEntries.sort((a, b) => a.data.order - b.data.order);
  const sortedPosts = posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  // Menu pogrupowane jak na stronie /menu: kategorie wg najniższego „order”, dania wg „order”.
  const categories = new Map<string, typeof dishes>();
  for (const dish of [...dishes].sort((a, b) => a.data.order - b.data.order)) {
    const list = categories.get(dish.data.category) ?? [];
    list.push(dish);
    categories.set(dish.data.category, list);
  }
  const menuText = [...categories.entries()].map(([category, list]) =>
    `### ${category}\n\n` + list.map(({ data }) => {
      const meta = [data.weight, data.tags.length ? data.tags.join(', ') : ''].filter(Boolean).join(' · ');
      return `- **${data.name}** — ${data.price}${meta ? ` (${meta})` : ''}${data.description ? `\n  ${data.description.trim()}` : ''}`;
    }).join('\n')
  ).join('\n\n');

  const content = `# ${SITE.fullName} — pełna treść

Wygenerowano: ${new Date().toISOString()}
URL: ${SITE.finalUrl}

---

## O restauracji

Riverside. Dym i Ogień działa nad Motławą, w samym sercu Gdańska, od 2019 roku. Od początku stawiamy na kuchnię opartą na jakości i przygotowywaniu dań od podstaw, bez kompromisów i półproduktów.

Kuchnię prowadzi Chef Michał Rybak — szef kuchni znany także z TikToka (@rybalikeachef). Menu łączy różnorodne inspiracje: od ręcznie siekanego tatara, przez ryby, makarony i pizzę, wolno pieczoną golonkę (ok. 12 godzin przygotowania) i żeberka BBQ w autorskim sosie, po smaki inspirowane kuchnią azjatycką. Obok sprawdzonych dań regularnie pojawiają się nowe kompozycje.

W 2019 roku Riverside jako pierwszy lokal na Pomorzu zaczął serwować niepasteryzowanego Pilsnera Urquell prosto z tanka — świeżego i zawsze w odpowiedniej temperaturze.

Lokalizacja: ${CONTACT.address}, ${CONTACT.city}. Z Długiego Targu przez Zieloną Bramę i Most Zielony — restauracja jest tuż za mostem, z widokiem na Motławę, Żuraw i Zieloną Bramę. Taras jest oszklony i ogrzewany, dostępny przez cały rok. Psy są mile widziane.

---

## Godziny otwarcia

${CONTACT.hours.map(h => `- ${h}`).join('\n')}

---

## Rezerwacje

- Online: ${CONTACT.reservationUrl} (system zjedz.my, maksymalnie 10 miejsc w jednej rezerwacji)
- Telefonicznie: ${CONTACT.phoneWork}
- Większe grupy i imprezy: ${SITE.finalUrl}/events/

---

## Menu

Aktualna karta: ${SITE.finalUrl}/menu/

${menuText}

---

## Imprezy i wydarzenia

Organizujemy imprezy prywatne (urodziny, komunie, chrzciny, wesela, jubileusze) i wydarzenia firmowe (spotkania, integracje, kolacje biznesowe, szkolenia) dla grup od kilkunastu do 150 osób, z widokiem na Motławę.

- **Sala VIP** — do 50 gości. Mniejsze spotkania biznesowe, prywatne kolacje, jubileusze, warsztaty w zamkniętym gronie.
- **Cały lokal na wyłączność** — około 150 gości. Duże eventy firmowe, bankiety i gale, pełna prywatność.

Nie obsługujemy koncertów i głośnych atrakcji — stawiamy na komfort i prywatność. Na życzenie: nagłośnienie, oprawa tematyczna, menu degustacyjne.

Zapytanie o imprezę: ${SITE.finalUrl}/events-booking/ · telefon ${CONTACT.phoneEvents} · e-mail ${CONTACT.email}

---

## FAQ — pełne odpowiedzi

${sortedFaq.map(f => `### ${f.data.question}\n\n${faqAnswerText(f.data.answer)}`).join('\n\n---\n\n')}

---

## Blog „Riverside od Kuchni”

${sortedPosts.length > 0
  ? sortedPosts.map(p => `### ${p.data.title} (${p.data.date.toLocaleDateString('pl-PL')})\n\n${p.data.excerpt}\n\nURL: ${SITE.finalUrl}/posts/${p.id}/`).join('\n\n')
  : 'Brak opublikowanych postów.'}

---

## Dane kontaktowe

- **Nazwa:** ${SITE.fullName}
- **Adres:** ${CONTACT.address}, ${CONTACT.city}
- **Rezerwacje:** ${CONTACT.phoneWork}
- **Imprezy:** ${CONTACT.phoneEvents}
- **E-mail:** ${CONTACT.email}
- **Google Maps:** ${CONTACT.mapsUrl}
- **Facebook:** ${SOCIAL.facebook}
- **Instagram:** ${SOCIAL.instagram}
- **TikTok:** ${SOCIAL.tiktok}
- **YouTube:** ${SOCIAL.youtube}
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
