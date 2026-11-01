import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { root, sha256, jsonBytes, assert, main } from './lib.mjs';

// Package asset compilation from the approved existing mark; no new artwork.
main(async () => {
  const source = await readFile(join(root, 'assets/logo-source.png'));
  const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  assert(info.width === 512 && info.height === 512, 'Unexpected approved logo source dimensions.');
  const background = [10, 10, 10];
  const foreground = [178, 154, 107];
  const vector = foreground.map((value, i) => value - background[i]);
  const norm = vector.reduce((sum, value) => sum + value * value, 0);
  const mask = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0; i < data.length; i += 4) {
    const coverage = Math.max(0, Math.min(1, vector.reduce((sum, value, channel) => sum + (data[i + channel] - background[channel]) * value, 0) / norm));
    mask[i] = mask[i + 1] = mask[i + 2] = 255;
    mask[i + 3] = Math.round(coverage * data[i + 3]);
  }
  const color = await sharp(source).resize(192, 192).flatten({ background: '#0A0A0A' }).removeAlpha().png({ compressionLevel: 9 }).toBuffer();
  const resized = await sharp(mask, { raw: { width: info.width, height: info.height, channels: 4 } }).resize(32, 32).raw().toBuffer();
  for (let i = 0; i < resized.length; i += 4) resized[i] = resized[i + 1] = resized[i + 2] = 255;
  const outline = await sharp(resized, { raw: { width: 32, height: 32, channels: 4 } }).png({ compressionLevel: 9 }).toBuffer();
  await writeFile(join(root, 'appPackage/color.png'), color);
  await writeFile(join(root, 'appPackage/outline.png'), outline);
  await writeFile(join(root, 'assets/provenance.json'), jsonBytes({
    source: 'claude/assets/logo.png in dennis430/ultiwrite-plugins',
    bundledSource: 'assets/logo-source.png',
    sourceSha256: sha256(source),
    sourceDimensions: [512, 512],
    method: 'Deterministic format and size export of the existing approved gold Uw mark. Color retains the opaque background. Outline maps the existing gold glyph coverage to white with transparent background, preserving its geometry.',
    backgroundRGB: background,
    foregroundRGB: foreground,
    outputs: { 'appPackage/color.png': { dimensions: [192, 192], sha256: sha256(color) }, 'appPackage/outline.png': { dimensions: [32, 32], sha256: sha256(outline) } },
  }));
  console.log('Compiled Microsoft 192px color and 32px white outline assets from the existing approved mark.');
});
