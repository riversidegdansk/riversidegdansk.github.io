// Zamienia bloki-komentarze w treści postów na zdjęcia i filmy z Cloudinary.
// Komentarz pozostaje niewidoczny, dopóki nie ma prawdziwego public_id —
// placeholdery „DO_UZUPELNIENIA_…” są pomijane (z ostrzeżeniem w konsoli buildu).
//
// <!-- MEDIA:image
// public_id: "riverside-…-galeria-tank-fot-9"
// alt: "Opis zdjęcia"
// caption: "Podpis (opcjonalnie)"
// crop: "16:9"                      (opcjonalnie — przycięcie kadru)
// -->
//
// <!-- MEDIA:video
// public_id: "riverside-…-sekcja-video-piwo-tank-1"
// poster: "riverside-…-galeria-tank-fot-9"   (zdjęcie; albo poster_offset: "22p" — klatka z filmu)
// start: "16p"  end: "32p"          (opcjonalnie — fragment filmu, sekundy lub procent)
// ratio: "9:16"                     (domyślnie 9:16 — filmy z social mediów)
// caption: "Podpis"
// -->
//
// <!-- STOPFRAME
// video: "riverside-…-post-jak-zapiekac-brioche"
// offset: "64p"                     (sekundy lub procent długości filmu)
// alt: "Opis klatki"
// caption: "Podpis (opcjonalnie)"
// crop: "4:3"                       (opcjonalnie)
// -->
// STOPFRAME przyjmuje też public_id zdjęcia zamiast video + offset.

import {
  cloudinaryUrl,
  cloudinarySrcset,
  cloudinaryVideoUrl,
  cloudinaryVideoPoster,
  IMAGE_PRESETS,
} from '../utils/cloudinary.ts';

const BLOCK = /^<!--\s*(MEDIA:image|MEDIA:video|STOPFRAME)\b([\s\S]*?)-->\s*$/;
const PLACEHOLDER = /DO_UZUPELNIENIA|^cloudinary video$/i;
// Wymiarowanie zdjęć w treści wpisu — preset „content” z utils/cloudinary.ts.
const { widths: WIDTHS, sizes: SIZES } = IMAGE_PRESETS.content;

function parseFields(body) {
  const fields = {};
  for (const line of body.split('\n')) {
    const m = line.match(/^\s*([a-z_]+)\s*:\s*(.*?)\s*$/i);
    if (!m) continue;
    fields[m[1]] = m[2].replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
  }
  return fields;
}

const esc = (s = '') =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const isReal = id => !!id && !PLACEHOLDER.test(id);
const toCssRatio = r => r.replace(':', ' / ');

function figure(kind, inner, caption) {
  const cap = caption ? `<figcaption>${esc(caption)}</figcaption>` : '';
  return `<figure class="post-media post-media--${kind}">${inner}${cap}</figure>`;
}

function renderImage(f) {
  const opts = f.crop ? { aspectRatio: f.crop, crop: 'fill' } : {};
  const style = f.crop ? ` style="aspect-ratio: ${toCssRatio(f.crop)}"` : '';
  return figure('image',
    `<img src="${cloudinaryUrl(f.public_id, { ...opts, width: 1200 })}"` +
    ` srcset="${cloudinarySrcset(f.public_id, WIDTHS, opts)}" sizes="${SIZES}"` +
    ` alt="${esc(f.alt)}" loading="lazy" decoding="async"${style}>`,
    f.caption);
}

function renderFrame(f) {
  const opts = { startOffset: f.offset || 0, ...(f.crop ? { aspectRatio: f.crop, crop: 'fill' } : {}) };
  const style = f.crop ? ` style="aspect-ratio: ${toCssRatio(f.crop)}"` : '';
  const srcset = WIDTHS.map(w => `${cloudinaryVideoPoster(f.video, { ...opts, width: w })} ${w}w`).join(', ');
  return figure('image',
    `<img src="${cloudinaryVideoPoster(f.video, { ...opts, width: 1200 })}"` +
    ` srcset="${srcset}" sizes="${SIZES}"` +
    ` alt="${esc(f.alt)}" loading="lazy" decoding="async"${style}>`,
    f.caption);
}

function renderVideo(f) {
  const ratio = f.ratio || '9:16';
  const size = { width: 720, aspectRatio: ratio, crop: 'fill' };
  const poster = isReal(f.poster)
    ? cloudinaryUrl(f.poster, size)
    : cloudinaryVideoPoster(f.public_id, { ...size, startOffset: f.poster_offset || f.start || 0 });
  const src = cloudinaryVideoUrl(f.public_id, {
    ...size,
    ...(f.start ? { startOffset: f.start } : {}),
    ...(f.end ? { endOffset: f.end } : {}),
  });
  const label = f.alt || f.caption;
  const vertical = (() => { const [w, h] = ratio.split(':').map(Number); return h > w; })();
  return figure(vertical ? 'video post-media--vertical' : 'video',
    `<video src="${src}" poster="${poster}" controls playsinline preload="none"` +
    ` style="aspect-ratio: ${toCssRatio(ratio)}"${label ? ` aria-label="${esc(label)}"` : ''}></video>`,
    f.caption);
}

// Plugin mdast dla Sätteri (domyślny procesor Markdown w Astro 7).
export const postMediaPlugin = {
  name: 'post-media',
  html(node, ctx) {
    const m = node.value.trim().match(BLOCK);
    if (!m) return;
    const [, kind, body] = m;
    const f = parseFields(body);
    const id = kind === 'STOPFRAME' ? (f.video || f.public_id) : f.public_id;
    if (!isReal(id)) {
      console.warn(`[post-media] pominięto ${kind} bez public_id w ${ctx.fileURL?.pathname.split('/').pop() ?? 'poście'}`);
      return;
    }
    const value =
      kind === 'MEDIA:video' ? renderVideo(f) :
      kind === 'STOPFRAME' && f.video ? renderFrame(f) :
      renderImage(f);
    ctx.replaceNode(node, { type: 'html', value });
  },
};
