// Spis zasobów Media Library (zdjęcia + wideo) do pliku cloudinary-inventory.json.
// Uruchamiasz lokalnie, sekret podajesz tylko w swoim terminalu:
//   PowerShell:  $env:CLOUDINARY_URL="cloudinary://API_KEY:API_SECRET@riverside"; node scripts/cloudinary-inventory.mjs
//   Bash:        CLOUDINARY_URL="cloudinary://API_KEY:API_SECRET@riverside" node scripts/cloudinary-inventory.mjs
// Plik wynikowy nie zawiera żadnych kluczy — tylko public_id, wymiary, czas trwania, foldery i tagi.
import { writeFileSync } from 'node:fs';

const url = process.env.CLOUDINARY_URL;
if (!url) {
  console.error('Brak zmiennej CLOUDINARY_URL.');
  process.exit(1);
}

const { username: key, password: secret, hostname: cloud } = new URL(url);
const auth = 'Basic ' + Buffer.from(`${decodeURIComponent(key)}:${decodeURIComponent(secret)}`).toString('base64');

async function list(type) {
  const out = [];
  let cursor;
  do {
    const qs = new URLSearchParams({ max_results: '500', tags: 'true', context: 'true' });
    if (cursor) qs.set('next_cursor', cursor);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/resources/${type}?${qs}`, {
      headers: { Authorization: auth },
    });
    if (!res.ok) throw new Error(`${type}: HTTP ${res.status} ${await res.text()}`);
    const data = await res.json();
    out.push(...data.resources);
    cursor = data.next_cursor;
  } while (cursor);

  return out.map(r => ({
    public_id:  r.public_id,
    type:       r.resource_type,
    format:     r.format,
    width:      r.width,
    height:     r.height,
    duration:   r.duration ?? null,
    folder:     r.asset_folder ?? r.folder ?? '',
    tags:       r.tags ?? [],
    alt:        r.context?.custom?.alt ?? '',
    created_at: r.created_at,
  }));
}

const assets = [...await list('image'), ...await list('video')];
writeFileSync('cloudinary-inventory.json', JSON.stringify(assets, null, 2));
console.log(`Zapisano ${assets.length} zasobów do cloudinary-inventory.json`);
