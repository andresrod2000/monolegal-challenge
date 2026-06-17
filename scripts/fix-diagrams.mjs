import fs from 'node:fs';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';

const dir = path.join(process.cwd(), 'docs', 'diagrams');

function fixBrokenWords(text) {
  const replacements = [
    ['automticas', 'automaticas'],
    ['desactivacin', 'desactivacion'],
    ['crtico', 'critico'],
    ['envo', 'envio'],
    ['asncrono', 'asincrono'],
    ['sncrona', 'sincrona'],
    ['sncrono', 'sincrono'],
    ['ASNCRONO', 'ASINCRONO'],
    ['GESTIN', 'GESTION'],
    ['SNCRONA', 'SINCRONA'],
    ['Pirmide', 'Piramide'],
    ['Patrn', 'Patron'],
    ['presentacin', 'presentacion'],
    ['ndices:', 'Indices:'],
    ['Rplica', 'Replica'],
    ['sncrono', 'sincrono'],
    ['interactua la solucion', 'interactua la solucion'],
  ];

  let out = text.replace(/\uFFFD/g, '');
  for (const [from, to] of replacements) {
    out = out.split(from).join(to);
  }
  return out.replace(/\s{2,}/g, ' ').trim();
}

/** Texto visible solo ASCII para resvg. */
function toAscii(text) {
  return fixBrokenWords(
    text
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .replace(/[\u0000-\u001f\u007f-\u009f]/g, '')
      .replace(/[\u2013\u2014\u00b7\u2022\u2212]/g, ' | ')
      .replace(/[^\x20-\x7E]/g, ''),
  );
}

function sanitizeSvg(svg) {
  let out = svg.replace(/<\?xml[^?]*\?>\s*/i, '');
  out = '<?xml version="1.0" encoding="UTF-8"?>\n' + out;

  out = out.replace(/font-family="[^"]*"/g, 'font-family="Arial, Helvetica, sans-serif"');

  out = out.replace(/(<text[^>]*>)([\s\S]*?)(<\/text>)/g, (_, open, content, close) => {
    return `${open}${toAscii(content)}${close}`;
  });

  out = out.replace(/(<tspan[^>]*>)([\s\S]*?)(<\/tspan>)/g, (_, open, content, close) => {
    return `${open}${toAscii(content)}${close}`;
  });

  return out;
}

for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.svg'))) {
  const filePath = path.join(dir, file);
  const raw = fs.readFileSync(filePath, 'utf8');
  const svg = sanitizeSvg(raw);
  fs.writeFileSync(filePath, svg, 'utf8');

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
    font: {
      defaultFontFamily: 'Arial',
      sansSerifFamily: 'Arial',
      serifFamily: 'Times New Roman',
      monospaceFamily: 'Courier New',
    },
  });
  fs.writeFileSync(filePath.replace(/\.svg$/, '.png'), resvg.render().asPng());
  console.log('OK', file);
}
