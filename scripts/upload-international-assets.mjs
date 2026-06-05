// One-shot uploader for international listing assets (images + floor-plan PDFs).
// Reads source files from a folder, optimises images with sharp, uploads
// everything to Vercel Blob, and writes a JSON manifest mapping source
// filenames → blob URLs. Run locally with BLOB_READ_WRITE_TOKEN set.
//
// Usage:
//   BLOB_READ_WRITE_TOKEN=… node scripts/upload-international-assets.mjs \
//     "workFile/Broker Kit_Baccarat Hotel & Residences Maldives/" \
//     international/baccarat-maldives
//
// After upload, copy the URLs from scripts/output/<slug>-blob-manifest.json
// into the matching property entry in src/content/{en,fr,ar}/international-properties.json.

import { readdir, mkdir, writeFile, stat } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';
import { put } from '@vercel/blob';
import sharp from 'sharp';

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
if (!TOKEN) {
  console.error('Missing BLOB_READ_WRITE_TOKEN env var.');
  process.exit(1);
}

const [sourceFolder, blobPrefix] = process.argv.slice(2);
if (!sourceFolder || !blobPrefix) {
  console.error('Usage: node scripts/upload-international-assets.mjs <source-folder> <blob-prefix>');
  process.exit(1);
}

const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.tif', '.tiff', '.webp']);
const PDF_EXT = '.pdf';
const MAX_WIDTH = 1600;
const JPEG_QUALITY = 85;

function slugifyFilename(name) {
  return name
    .toLowerCase()
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function walkFiles(dir, base = dir, out = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkFiles(full, base, out);
    } else {
      const relative = full.slice(base.length).replace(/^\//, '');
      out.push({ full, relative, name: entry.name });
    }
  }
  return out;
}

async function processImage(buffer, ext) {
  const pipeline = sharp(buffer, { failOn: 'none' })
    .resize({ width: MAX_WIDTH, withoutEnlargement: true });
  if (ext === '.png') {
    return { buffer: await pipeline.png({ quality: JPEG_QUALITY }).toBuffer(), contentType: 'image/png', outExt: '.png' };
  }
  return { buffer: await pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer(), contentType: 'image/jpeg', outExt: '.jpg' };
}

async function main() {
  const files = await walkFiles(sourceFolder);
  const manifest = { source: sourceFolder, blobPrefix, images: {}, floorPlans: {} };

  for (const file of files) {
    const ext = extname(file.name).toLowerCase();
    const isImage = IMAGE_EXT.has(ext);
    const isPdf = ext === PDF_EXT;
    if (!isImage && !isPdf) continue;

    const { size } = await stat(file.full);
    const slug = slugifyFilename(file.name);

    if (isImage) {
      const { readFile } = await import('node:fs/promises');
      const raw = await readFile(file.full);
      const { buffer, contentType, outExt } = await processImage(raw, ext);
      const blobKey = `${blobPrefix}/${slug}${outExt}`;
      const { url } = await put(blobKey, buffer, {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType,
        token: TOKEN,
      });
      manifest.images[file.relative] = { url, slug, sourceSize: size, optimisedSize: buffer.length };
      console.log(`✓ image ${file.relative} → ${url} (${(buffer.length / 1024).toFixed(0)} KB)`);
    } else if (isPdf) {
      const { readFile } = await import('node:fs/promises');
      const raw = await readFile(file.full);
      const blobKey = `${blobPrefix}/floor-plans/${slug}.pdf`;
      const { url } = await put(blobKey, raw, {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/pdf',
        token: TOKEN,
      });
      manifest.floorPlans[file.relative] = { url, slug, size };
      console.log(`✓ pdf   ${file.relative} → ${url}`);
    }
  }

  const outDir = join(process.cwd(), 'scripts', 'output');
  await mkdir(outDir, { recursive: true });
  const manifestName = `${basename(blobPrefix)}-blob-manifest.json`;
  const outPath = join(outDir, manifestName);
  await writeFile(outPath, JSON.stringify(manifest, null, 2));
  console.log(`\nWrote manifest: ${outPath}`);
  console.log(`Uploaded ${Object.keys(manifest.images).length} images + ${Object.keys(manifest.floorPlans).length} PDFs.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
