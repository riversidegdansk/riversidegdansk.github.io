import { CLOUDINARY } from '../config/site';

interface TransformOptions {
  width?:       number;
  height?:      number;
  crop?:        'fill' | 'fit' | 'scale' | 'crop' | 'thumb' | 'pad';
  gravity?:     'auto' | 'face' | 'center' | 'north' | 'south';
  format?:      'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  quality?:     'auto' | 'auto:best' | 'auto:good' | number;
  aspectRatio?: string;
}

export function cloudinaryUrl(publicIdOrUrl: string, opts: TransformOptions = {}): string {
  if (!publicIdOrUrl) return '';

  const {
    width,
    height,
    crop = 'fill',
    gravity = 'auto',
    format = 'auto',
    quality = 'auto',
    aspectRatio,
  } = opts;

  const t: string[] = [`f_${format}`, `q_${quality}`];

  if (width) t.push(`w_${width}`);
  if (height) t.push(`h_${height}`);
  if (aspectRatio) t.push(`ar_${aspectRatio}`);

  if (width || height || aspectRatio) {
    t.push(`c_${crop}`, `g_${gravity}`);
  }

  const transform = t.join(',');

  // Nowy format z CMS: pełny URL Cloudinary
  if (publicIdOrUrl.startsWith('https://res.cloudinary.com/')) {
    return publicIdOrUrl.replace(
      '/image/upload/',
      `/image/upload/${transform}/`
    );
  }

  // Awaryjnie: inny pełny URL — zwracamy bez przebudowy
  if (
    publicIdOrUrl.startsWith('http://') ||
    publicIdOrUrl.startsWith('https://')
  ) {
    return publicIdOrUrl;
  }

  // Stary format: sam public ID
  return `${CLOUDINARY.baseUrl}/${CLOUDINARY.cloudName}/image/upload/${transform}/${publicIdOrUrl}`;
}

export function cloudinarySrcset(
  publicId: string,
  widths: number[] = [400, 800, 1200, 1600],
  opts: Omit<TransformOptions, 'width'> = {},
): string {
  return widths.map(w => `${cloudinaryUrl(publicId, { ...opts, width: w })} ${w}w`).join(', ');
}

const VIDEO_EXTENSIONS = ['mp4', 'webm', 'mov', 'm4v', 'ogv', 'avi', 'mkv', 'flv', 'wmv'];

// Rozstrzyga typ zasobu po ścieżce Cloudinary (/video/upload/ vs /image/upload/)
// albo, dla starego formatu (sam public ID), po rozszerzeniu pliku.
export function isVideoAsset(publicIdOrUrl: string): boolean {
  if (!publicIdOrUrl) return false;
  if (publicIdOrUrl.includes('/video/upload/')) return true;
  if (publicIdOrUrl.includes('/image/upload/')) return false;

  const ext = publicIdOrUrl.split(/[?#]/)[0].split('.').pop()?.toLowerCase();
  return !!ext && VIDEO_EXTENSIONS.includes(ext);
}

interface MediaTransformOptions {
  width?:       number;
  height?:      number;
  crop?:        'fill' | 'fit' | 'scale' | 'crop' | 'thumb' | 'pad';
  gravity?:     'auto' | 'face' | 'center' | 'north' | 'south';
  aspectRatio?: string;
  quality?:     'auto' | 'auto:best' | 'auto:good' | number;
  // Sekundy (4) albo procent długości filmu ('25p').
  startOffset?: number | string;
}

interface VideoTransformOptions extends MediaTransformOptions {
  format?:    'auto' | 'mp4' | 'webm' | 'ogv';
  endOffset?: number | string;
}

export function cloudinaryVideoUrl(publicIdOrUrl: string, opts: VideoTransformOptions = {}): string {
  if (!publicIdOrUrl) return '';

  const {
    width,
    height,
    crop = 'fill',
    gravity = 'auto',
    format = 'auto',
    quality = 'auto',
    aspectRatio,
    startOffset,
    endOffset,
  } = opts;

  const t: string[] = [`f_${format}`, `q_${quality}`];

  if (width) t.push(`w_${width}`);
  if (height) t.push(`h_${height}`);
  if (aspectRatio) t.push(`ar_${aspectRatio}`);

  let transform = t.join(',');

  if (width || height || aspectRatio) {
    transform += `,c_${crop}`;
    // g_auto dla wideo wymaga bycia w osobnym, samodzielnym komponencie transformacji.
    transform += gravity === 'auto' ? '/g_auto' : `,g_${gravity}`;
  }

  // Przycięcie fragmentu filmu — osobny komponent transformacji, przed formatowaniem.
  const trim = [
    startOffset !== undefined ? `so_${startOffset}` : '',
    endOffset   !== undefined ? `eo_${endOffset}`   : '',
  ].filter(Boolean).join(',');
  if (trim) transform = `${trim}/${transform}`;

  if (publicIdOrUrl.startsWith('https://res.cloudinary.com/')) {
    // Normalizujemy na /video/upload/ (na wypadek błędnie zapisanego /image/upload/) i wstawiamy transformację.
    const normalized = publicIdOrUrl.replace('/image/upload/', '/video/upload/');
    return normalized.replace('/video/upload/', `/video/upload/${transform}/`);
  }

  if (publicIdOrUrl.startsWith('http://') || publicIdOrUrl.startsWith('https://')) {
    return publicIdOrUrl;
  }

  return `${CLOUDINARY.baseUrl}/${CLOUDINARY.cloudName}/video/upload/${transform}/${publicIdOrUrl}`;
}

// Klatka z wideo jako JPG — Cloudinary generuje ją, dostarczając plik wideo z rozszerzeniem .jpg.
export function cloudinaryVideoPoster(publicIdOrUrl: string, opts: MediaTransformOptions = {}): string {
  if (!publicIdOrUrl) return '';

  const {
    width,
    height,
    crop = 'fill',
    gravity = 'auto',
    quality = 'auto',
    aspectRatio,
    startOffset = 0,
  } = opts;

  // f_auto: kadr jako WebP/AVIF tam, gdzie przeglądarka je obsługuje (rozszerzenie .jpg zostaje jako zapas).
  const t: string[] = ['f_auto', `q_${quality}`, `so_${startOffset}`];

  if (width) t.push(`w_${width}`);
  if (height) t.push(`h_${height}`);
  if (aspectRatio) t.push(`ar_${aspectRatio}`);

  let transform = t.join(',');

  if (width || height || aspectRatio) {
    transform += `,c_${crop}`;
    // g_auto dla wideo wymaga bycia w osobnym, samodzielnym komponencie transformacji.
    transform += gravity === 'auto' ? '/g_auto' : `,g_${gravity}`;
  }

  const stripExt = (s: string) => s.replace(/\.[a-z0-9]+$/i, '');

  if (publicIdOrUrl.startsWith('https://res.cloudinary.com/')) {
    const normalized = stripExt(publicIdOrUrl.replace('/image/upload/', '/video/upload/'));
    return `${normalized.replace('/video/upload/', `/video/upload/${transform}/`)}.jpg`;
  }

  if (publicIdOrUrl.startsWith('http://') || publicIdOrUrl.startsWith('https://')) {
    return publicIdOrUrl;
  }

  return `${CLOUDINARY.baseUrl}/${CLOUDINARY.cloudName}/video/upload/${transform}/${stripExt(publicIdOrUrl)}.jpg`;
}

// Miniatura niezależna od typu zasobu: dla wideo zwraca klatkę-plakat, dla zdjęcia — zwykły URL.
export function cloudinaryThumbUrl(publicIdOrUrl: string, opts: MediaTransformOptions = {}): string {
  if (!publicIdOrUrl) return '';
  return isVideoAsset(publicIdOrUrl)
    ? cloudinaryVideoPoster(publicIdOrUrl, opts)
    : cloudinaryUrl(publicIdOrUrl, opts);
}

export interface ResolvedMedia {
  type:   'image' | 'video';
  url:    string;
  poster: string | null;
}

// Punkt wejścia dla pól galerii mieszających zdjęcia i wideo — rozstrzyga typ i buduje właściwe URL-e.
export function resolveMedia(publicIdOrUrl: string, opts: MediaTransformOptions = {}): ResolvedMedia {
  const video = isVideoAsset(publicIdOrUrl);
  return {
    type:   video ? 'video' : 'image',
    url:    video ? cloudinaryVideoUrl(publicIdOrUrl, opts) : cloudinaryUrl(publicIdOrUrl, opts),
    poster: video ? cloudinaryVideoPoster(publicIdOrUrl, opts) : null,
  };
}

// ── Presety zdjęć responsywnych ───────────────────────────────────────────
// Jedno miejsce, w którym ustalamy wymiarowanie zdjęć w całym serwisie:
//   aspectRatio — kadr przycinany przez Cloudinary (brak = oryginalne proporcje),
//   widths      — szerokości plików w srcset,
//   sizes       — jak szeroko zdjęcie jest wyświetlane w danym układzie strony
//                 (na tej podstawie przeglądarka wybiera plik z srcset).
export interface ImagePreset {
  aspectRatio?: string;
  widths:       number[];
  sizes:        string;
}

export const IMAGE_PRESETS = {
  // Zdjęcie obok tekstu w sekcji dwukolumnowej (O nas, Rezerwacje, „Tego musisz spróbować”)
  // Na telefonie zdjęcie ma marginesy karty (~85% szerokości ekranu) — stąd 85vw i plik 700 px.
  section:     { aspectRatio: '4:3',  widths: [400, 700, 900, 1200], sizes: '(min-width: 1024px) 42vw, 85vw' },
  // Zdjęcie na pół szerokości kontenera (typy imprez)
  half:        { aspectRatio: '4:3',  widths: [600, 900, 1200], sizes: '(min-width: 1024px) 50vw, 100vw' },
  // Karta wpisu w siatce 3 kolumn
  card:        { aspectRatio: '4:3',  widths: [400, 600, 800],  sizes: '(min-width: 768px) 33vw, 100vw' },
  // Pionowy portret (sekcja „Planujesz imprezę?”)
  portrait:    { aspectRatio: '3:4',  widths: [400, 700, 900],  sizes: '(min-width: 1280px) 24rem, (min-width: 1024px) 42vw, (min-width: 480px) 20rem, 80vw' },
  // Kwadratowa miniatura 80 px (menu)
  thumb:       { aspectRatio: '1:1',  widths: [80, 160, 240],   sizes: '80px' },
  // Pełny ekran (slider) — bez przycinania, kadr robi CSS object-cover
  hero:        {                      widths: [768, 1280, 1920, 2560], sizes: '100vw' },
  // Okładka wpisu: 16:9 od tabletu, 4:3 na telefonie
  cover:       { aspectRatio: '16:9', widths: [768, 1200, 1600], sizes: '(min-width: 1280px) 1216px, 100vw' },
  coverMobile: { aspectRatio: '4:3',  widths: [400, 640],        sizes: '100vw' },
  // Zdjęcie w treści wpisu (kolumna 672 px) — oryginalne proporcje
  content:     {                      widths: [480, 768, 1200], sizes: '(min-width: 768px) 672px, 100vw' },
} satisfies Record<string, ImagePreset>;

export type ImagePresetName = keyof typeof IMAGE_PRESETS;

export interface ResponsiveImage {
  src:     string;
  srcset:  string;
  sizes:   string;
  width?:  number;
  height?: number;
}

// Atrybuty <img> dla presetu (z opcjonalnymi nadpisaniami). width/height wynikają z kadru —
// przeglądarka rezerwuje miejsce przed pobraniem zdjęcia, więc treść nie „skacze” (CLS).
export function responsiveImage(
  publicIdOrUrl: string,
  preset: ImagePresetName,
  overrides: Partial<ImagePreset> = {},
): ResponsiveImage {
  const { aspectRatio, widths, sizes } = { ...IMAGE_PRESETS[preset], ...overrides } as ImagePreset;
  const opts = aspectRatio ? { aspectRatio, crop: 'fill' as const } : {};
  const fallbackWidth = widths[Math.min(1, widths.length - 1)];

  const result: ResponsiveImage = {
    src:    cloudinaryUrl(publicIdOrUrl, { ...opts, width: fallbackWidth }),
    srcset: cloudinarySrcset(publicIdOrUrl, widths, opts),
    sizes,
  };

  if (aspectRatio) {
    const [w, h] = aspectRatio.split(':').map(Number);
    result.width  = Math.max(...widths);
    result.height = Math.round((result.width * h) / w);
  }

  return result;
}
