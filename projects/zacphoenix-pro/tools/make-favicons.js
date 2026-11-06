// Build ZP monogram favicons: outlined SVG + PNG sizes.
// usage: node make.js <font.ttf> <outDir>
const opentype = require('opentype.js');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const [fontPath, outDir] = process.argv.slice(2);
const font = opentype.loadSync(fontPath);
const ORANGE = '#FB4704', INK_WHITE = '#FFFFFF';

// glyph outlines for `text` at fontSize, letter-spacing ls (em), centered in a box of `size`
function glyphPath(text, size, scale, ls) {
  const fs_ = size * scale;
  let x = 0; const parts = [];
  const glyphs = font.stringToGlyphs(text);
  glyphs.forEach((g, i) => {
    parts.push(g.getPath(x, 0, fs_));
    x += g.advanceWidth * fs_ / font.unitsPerEm;
    if (i < glyphs.length - 1) x += ls * fs_;
  });
  const p = new opentype.Path(); parts.forEach(q => p.extend(q));
  const bb = p.getBoundingBox();
  const dx = (size - (bb.x2 - bb.x1)) / 2 - bb.x1;
  const dy = (size - (bb.y2 - bb.y1)) / 2 - bb.y1;
  const moved = new opentype.Path();
  p.commands.forEach(c => {
    const n = { ...c };
    ['x', 'x1', 'x2'].forEach(k => { if (k in n) n[k] += dx; });
    ['y', 'y1', 'y2'].forEach(k => { if (k in n) n[k] += dy; });
    moved.commands.push(n);
  });
  return moved.toPathData(2);
}

function svg(size, { radius = 0.2, text = 'ZP', scale = 0.5, ls = -0.06 } = {}) {
  const r = (size * radius).toFixed(2);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">` +
    `<rect width="${size}" height="${size}" rx="${r}" fill="${ORANGE}"/>` +
    `<path fill="${INK_WHITE}" d="${glyphPath(text, size, scale, ls)}"/></svg>`;
}

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'favicon.svg'), svg(64));
  const jobs = [
    ['favicon-16.png', 16, { radius: 0.18, scale: 0.56 }],
    ['favicon-32.png', 32, {}],
    ['favicon-48.png', 48, {}],
    ['apple-touch-icon.png', 180, { radius: 0 }],
    ['icon-192.png', 192, {}],
    ['icon-512.png', 512, {}],
  ];
  for (const [name, size, opts] of jobs) {
    // render from a 4x vector for crisp small sizes
    const big = svg(size * 4, opts);
    await sharp(Buffer.from(big)).resize(size, size).png().toFile(path.join(outDir, name));
  }
  console.log('done');
})();
