// One-shot optimiser for the Baccarat Maldives broker-kit images and PDFs.
// Outputs to /public so the site can serve them directly without Vercel Blob.
// Run: node scripts/optimize-baccarat-assets.mjs

import { readFile, writeFile, copyFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const SRC = '/Users/blackoak/Documents/GitHub/blackoak-website/workFile/Broker Kit_Baccarat Hotel & Residences Maldives';
const OUT_IMG = '/Users/blackoak/Documents/GitHub/blackoak-website/public/images/international/baccarat-maldives';
const OUT_PDF = '/Users/blackoak/Documents/GitHub/blackoak-website/public/floor-plans/baccarat-maldives';

const IMAGE_PICKS = [
  ['Hero Image.jpg', 'hero.jpg'],
  ['025078_Maldives_01_Arrival_Pavilion_Final_Baccarat_Logo.jpg', '01-arrival-pavilion.jpg'],
  ['025078_Maldives_03_Marina_Final High Res.jpg', '02-marina.jpg'],
  ['03_Villa_Front_Day_Final_EDIT.jpg', '03-villa-front-day.jpg'],
  ['01_Villa_Front_Night_Final_EDIT.jpg', '04-villa-front-night.jpg'],
  ['2BR Villa (day).jpg', '05-2br-villa-day.jpg'],
  ['Living & Dining.jpg', '06-living-dining.jpg'],
  ['Primary Suite 01.jpg', '07-primary-suite.jpg'],
  ['Primary En-Suite 01.jpg', '08-primary-en-suite.jpg'],
  ['Spa_Final.jpg', '09-spa.jpg'],
  ['HKS_Baccarat Maldives_View 03_A04.jpg', '10-art-gallery.jpg'],
];

const FLOOR_PLANS = [
  ['2 bedroom beach villa floor plan final.pdf', '2br-beach.pdf'],
  ['3 bedroom beach villa floor plan final.pdf', '3br-beach.pdf'],
  ['4 bedroom villa floor plan final.pdf', '4br-villa.pdf'],
  ['Water Villa (2-bedroom).pdf', '2br-water.pdf'],
  ['Water Villa (3-bedroom).pdf', '3br-water.pdf'],
  ['Water Villa (4-bedroom).pdf', '4br-water.pdf'],
];

await mkdir(OUT_IMG, { recursive: true });
await mkdir(OUT_PDF, { recursive: true });

for (const [src, dst] of IMAGE_PICKS) {
  const srcPath = join(SRC, src);
  const dstPath = join(OUT_IMG, dst);
  const buf = await readFile(srcPath);
  const optimised = await sharp(buf, { failOn: 'none' })
    .resize({ width: 1600, withoutEnlargement: true })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();
  await writeFile(dstPath, optimised);
  console.log(`✓ ${src} → ${dst} (${(optimised.length / 1024).toFixed(0)} KB)`);
}

let pdfFolder;
for (const [src, dst] of FLOOR_PLANS) {
  // Floor plans live in /Floor Plans/ subfolder
  pdfFolder ??= join(SRC, 'Floor Plans');
  const srcPath = join(pdfFolder, src);
  const dstPath = join(OUT_PDF, dst);
  await copyFile(srcPath, dstPath);
  console.log(`✓ floor plan ${src} → ${dst}`);
}

console.log('\nDone.');
