import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('aquarium cover and preview fallback use the shared shark vector', async () => {
  const [cover, preview, styles] = await Promise.all([
    readFile(new URL('./BookCard.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../PlacePreviews/PlaceVisual.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../../index.css', import.meta.url), 'utf8'),
  ]);

  assert.match(cover, /aquarium-shark\.svg/);
  assert.match(cover, /src={aquariumShark}/);
  assert.match(preview, /aquarium-shark\.svg/);
  assert.match(preview, /src={aquariumShark}/);
  assert.match(preview, /w-\[68\.834%\] max-w-\[255px\]/);

  const artwork = await readFile(new URL('../PlacePreviews/aquarium-shark.svg', import.meta.url), 'utf8');
  assert.match(artwork, /width="255" height="160" viewBox="45 20 255 160"/);
  assert.match(artwork, /fill="#73b4e1"/);
  assert.match(artwork, /stroke="#111633" stroke-width="4\.2"/);
  assert.match(artwork, /M54 91\s+C58 77/);
  assert.match(artwork, /M64 118 C79 128 99 131 114 126/);
  assert.match(styles, /\.destination-book__shark\s*\{[^}]*width: clamp\(144px, 42vw, 160px\);/s);
  assert.match(styles, /\.destination-book__in-shark\s*\{[^}]*width: 87\.6px;[^}]*max-width: 62%;/s);
});
