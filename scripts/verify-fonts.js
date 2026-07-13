import fs from 'fs';
import path from 'path';

const FONTS_DIR = path.join(process.cwd(), 'public', 'fonts', 'qcf');
const SURA_NAMES_PATH = path.join(process.cwd(), 'public', 'fonts', 'sura_names.woff2');
const TOTAL_PAGES = 604;
const MIN_FONT_SIZE = 30000;
const MIN_SURA_SIZE = 50000;
const WOFF2_MAGIC = [0x77, 0x4F, 0x46, 0x32]; // wOF2

const errors = [];

function checkWoff2(filePath, minSize) {
  const stat = fs.statSync(filePath);
  if (stat.size < minSize) {
    return `too small (${stat.size} bytes, min ${minSize})`;
  }
  const fd = fs.openSync(filePath, 'r');
  const buf = Buffer.alloc(4);
  fs.readSync(fd, buf, 0, 4, 0);
  fs.closeSync(fd);
  if (buf[0] !== WOFF2_MAGIC[0] || buf[1] !== WOFF2_MAGIC[1] || buf[2] !== WOFF2_MAGIC[2] || buf[3] !== WOFF2_MAGIC[3]) {
    return `invalid woff2 magic (got ${buf.toString('hex')})`;
  }
  return null;
}

for (let i = 1; i <= TOTAL_PAGES; i++) {
  const num = String(i).padStart(3, '0');
  const filePath = path.join(FONTS_DIR, `p${num}.woff2`);

  if (!fs.existsSync(filePath)) {
    errors.push(`missing: p${num}.woff2`);
    continue;
  }

  const err = checkWoff2(filePath, MIN_FONT_SIZE);
  if (err) {
    errors.push(`p${num}.woff2: ${err}`);
  }
}

if (!fs.existsSync(SURA_NAMES_PATH)) {
  errors.push('missing: sura_names.woff2');
} else {
  const err = checkWoff2(SURA_NAMES_PATH, MIN_SURA_SIZE);
  if (err) {
    errors.push(`sura_names.woff2: ${err}`);
  }
}

if (errors.length > 0) {
  console.error('FAILED: font verification errors:');
  errors.forEach(e => console.error(`  - ${e}`));
  console.error(`\nTotal errors: ${errors.length}`);
  process.exit(1);
} else {
  const totalSize = [...Array(TOTAL_PAGES).keys()].reduce((acc, i) => {
    const f = path.join(FONTS_DIR, `p${String(i + 1).padStart(3, '0')}.woff2`);
    return acc + fs.statSync(f).size;
  }, 0);
  const suraSize = fs.statSync(SURA_NAMES_PATH).size;
  console.log(`SUCCESS: all ${TOTAL_PAGES} QCF fonts + sura_names.woff2 are valid`);
  console.log(`  QCF total: ${(totalSize / 1024 / 1024).toFixed(2)} MB (${(totalSize / TOTAL_PAGES / 1024).toFixed(1)} KB avg)`);
  console.log(`  SuraNames: ${(suraSize / 1024).toFixed(1)} KB`);
}
