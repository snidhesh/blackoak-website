#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const roots = ['src/app/[locale]', 'src/components'];
const exts = new Set(['.tsx', '.ts']);

const ALLOW_SUBSTRINGS = [
  'BlackOak',
  'Dubai',
  'AED',
  'DLD',
  'MOU',
  'NOC',
  'BRN',
  'WhatsApp',
  'Google Maps',
  'UAE',
  'UK',
  'FR',
  'EN',
  'AR',
  'pdf',
  'doc',
  'docx',
  'http://',
  'https://',
];

const hardcodedPatterns = [
  />\s*([A-Za-z][^<{]{2,})\s*</g,
  /\b(?:alt|aria-label|title|placeholder)\s*=\s*["']([A-Za-z][^"']{2,})["']/g,
];

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (exts.has(path.extname(entry.name))) out.push(full);
  }
  return out;
}

function shouldIgnoreLine(line) {
  return line.includes('i18n-ignore') || line.trim().startsWith('import ') || line.includes('dangerouslySetInnerHTML');
}

function isAllowedText(text) {
  const t = text.trim();
  if (!t) return true;
  if (/^[0-9\s.,:+\-–—%()]+$/.test(t)) return true;
  if (/^\{.*\}$/.test(t)) return true;
  if (ALLOW_SUBSTRINGS.some((s) => t.includes(s))) return true;
  return false;
}

const violations = [];
for (const root of roots) {
  for (const file of walk(root)) {
    const src = fs.readFileSync(file, 'utf8');
    const lines = src.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (shouldIgnoreLine(line)) continue;

      for (const pattern of hardcodedPatterns) {
        pattern.lastIndex = 0;
        let m;
        while ((m = pattern.exec(line)) !== null) {
          const text = m[1]?.trim();
          if (!text) continue;
          if (isAllowedText(text)) continue;
          violations.push({ file, line: i + 1, text });
        }
      }
    }
  }
}

if (violations.length) {
  console.error(`Found ${violations.length} potential hardcoded i18n literals:`);
  for (const v of violations.slice(0, 200)) {
    console.error(`${v.file}:${v.line} -> ${v.text}`);
  }
  process.exit(1);
}

console.log('No hardcoded i18n literals detected in localized app/components.');
