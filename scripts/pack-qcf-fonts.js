import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';

const FONTS_DIR = path.join(process.cwd(), 'public', 'fonts', 'qcf');
const ZIP_OUTPUT = path.join(process.cwd(), 'public', 'fonts', 'qcf-fonts.zip');
const MANIFEST_OUTPUT = path.join(process.cwd(), 'public', 'fonts', 'qcf-fonts-manifest.json');
const TOTAL_PAGES = 604;
const MIN_FONT_SIZE = 30000;
const WOFF2_MAGIC = [0x77, 0x4F, 0x46, 0x32];

function validateWoff2(filePath) {
  const stat = fs.statSync(filePath);
  if (stat.size < MIN_FONT_SIZE) {
    throw new Error(`corrupt (too small): ${filePath} (${stat.size} bytes)`);
  }
  const fd = fs.openSync(filePath, 'r');
  const buf = Buffer.alloc(4);
  fs.readSync(fd, buf, 0, 4, 0);
  fs.closeSync(fd);
  if (buf[0] !== WOFF2_MAGIC[0] || buf[1] !== WOFF2_MAGIC[1] || buf[2] !== WOFF2_MAGIC[2] || buf[3] !== WOFF2_MAGIC[3]) {
    throw new Error(`invalid woff2 magic: ${filePath}`);
  }
  return stat.size;
}

// Simple ZIP writer (no compression for fonts - woff2 already compressed)
// Using STORE method (no compression) because woff2 files are already compressed
// and re-compressing them gives negligible gains while adding CPU cost
function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = crc ^ buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (0xEDB88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function writeZip(entries) {
  const localHeaders = [];
  const centralHeaders = [];
  const fileData = [];

  let offset = 0;

  for (const entry of entries) {
    const nameBuf = Buffer.from(entry.name, 'utf8');
    const data = entry.data;
    const crc = crc32(data);
    const size = data.length;

    // Local file header (signature + version + flags + compression + modtime + moddate + crc + compressed + uncompressed + nameLen + extraLen + name)
    const localHeader = Buffer.alloc(30 + nameBuf.length);
    localHeader.writeUInt32LE(0x04034b50, 0);   // signature
    localHeader.writeUInt16LE(20, 4);            // version needed
    localHeader.writeUInt16LE(0, 6);             // flags
    localHeader.writeUInt16LE(0, 8);             // compression: 0 = STORE
    localHeader.writeUInt16LE(0, 10);            // mod time
    localHeader.writeUInt16LE(0x0021, 12);       // mod date (valid DOS date)
    localHeader.writeUInt32LE(crc, 14);          // crc32
    localHeader.writeUInt32LE(size, 18);         // compressed size
    localHeader.writeUInt32LE(size, 22);         // uncompressed size
    localHeader.writeUInt16LE(nameBuf.length, 26); // name length
    localHeader.writeUInt16LE(0, 28);            // extra length
    nameBuf.copy(localHeader, 30);

    localHeaders.push({ header: localHeader, offset });
    fileData.push(data);
    offset += localHeader.length + data.length;
  }

  // Central directory
  let cdOffset = 0;
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const nameBuf = Buffer.from(entry.name, 'utf8');
    const data = entry.data;
    const crc = crc32(data);
    const size = data.length;
    const lh = localHeaders[i];

    const cdHeader = Buffer.alloc(46 + nameBuf.length);
    cdHeader.writeUInt32LE(0x02014b50, 0);       // central signature
    cdHeader.writeUInt16LE(20, 4);               // version made by
    cdHeader.writeUInt16LE(20, 6);               // version needed
    cdHeader.writeUInt16LE(0, 8);                // flags
    cdHeader.writeUInt16LE(0, 10);               // compression: STORE
    cdHeader.writeUInt16LE(0, 12);               // mod time
    cdHeader.writeUInt16LE(0x0021, 14);          // mod date
    cdHeader.writeUInt32LE(crc, 16);             // crc32
    cdHeader.writeUInt32LE(size, 20);            // compressed size
    cdHeader.writeUInt32LE(size, 24);            // uncompressed size
    cdHeader.writeUInt16LE(nameBuf.length, 28);  // name length
    cdHeader.writeUInt16LE(0, 30);               // extra length
    cdHeader.writeUInt16LE(0, 32);               // comment length
    cdHeader.writeUInt16LE(0, 34);               // disk number
    cdHeader.writeUInt16LE(0, 36);               // internal attrs
    cdHeader.writeUInt32LE(0, 38);               // external attrs
    cdHeader.writeUInt32LE(lh.offset, 42);       // local header offset
    nameBuf.copy(cdHeader, 46);
    centralHeaders.push(cdHeader);
    cdOffset += cdHeader.length;
  }

  // End of central directory record
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);             // EOCD signature
  eocd.writeUInt16LE(0, 4);                      // disk number
  eocd.writeUInt16LE(0, 6);                      // disk with CD
  eocd.writeUInt16LE(entries.length, 8);         // entries on disk
  eocd.writeUInt16LE(entries.length, 10);        // total entries
  eocd.writeUInt32LE(cdOffset, 12);              // CD size
  eocd.writeUInt32LE(offset, 16);                // CD offset
  eocd.writeUInt16LE(0, 20);                     // comment length

  // Combine all parts
  const totalSize = localHeaders.reduce((s, lh) => s + lh.header.length, 0)
    + fileData.reduce((s, d) => s + d.length, 0)
    + centralHeaders.reduce((s, cd) => s + cd.length, 0)
    + eocd.length;

  const result = Buffer.alloc(totalSize);
  let pos = 0;
  for (let i = 0; i < entries.length; i++) {
    localHeaders[i].header.copy(result, pos); pos += localHeaders[i].header.length;
    fileData[i].copy(result, pos); pos += fileData[i].length;
  }
  for (const cd of centralHeaders) {
    cd.copy(result, pos); pos += cd.length;
  }
  eocd.copy(result, pos);

  return result;
}

function main() {
  console.log('=== Validating and packing 604 QCF fonts into single zip ===\n');

  const entries = [];
  const manifest = {
    version: 'v2_qcf_v1',
    totalFonts: TOTAL_PAGES,
    createdAt: new Date().toISOString(),
    fonts: [],
  };

  let totalUncompressed = 0;
  let errors = 0;

  for (let i = 1; i <= TOTAL_PAGES; i++) {
    const num = String(i).padStart(3, '0');
    const fileName = `p${num}.woff2`;
    const filePath = path.join(FONTS_DIR, fileName);

    if (!fs.existsSync(filePath)) {
      console.error(`MISSING: ${fileName}`);
      errors++;
      continue;
    }

    try {
      const size = validateWoff2(filePath);
      const data = fs.readFileSync(filePath);
      const hash = createHash('sha256').update(data).digest('hex').substring(0, 16);

      entries.push({ name: fileName, data });
      manifest.fonts.push({
        page: i,
        name: fileName,
        size,
        sha256: hash,
      });
      totalUncompressed += size;

      if (i % 100 === 0) {
        console.log(`[validated] ${i}/${TOTAL_PAGES} fonts`);
      }
    } catch (err) {
      console.error(`FAILED ${fileName}: ${err.message}`);
      errors++;
    }
  }

  if (errors > 0) {
    console.error(`\nFAILED: ${errors} errors found. Aborting.`);
    process.exit(1);
  }

  if (entries.length !== TOTAL_PAGES) {
    console.error(`\nFAILED: expected ${TOTAL_PAGES} entries, got ${entries.length}`);
    process.exit(1);
  }

  console.log(`\n[ok] All ${TOTAL_PAGES} fonts validated (${(totalUncompressed / 1024 / 1024).toFixed(2)} MB uncompressed)`);

  // Write zip
  console.log('\n=== Writing zip archive (STORE method, no re-compression) ===');
  const zipBuffer = writeZip(entries);
  fs.writeFileSync(ZIP_OUTPUT, zipBuffer);

  const zipSize = fs.statSync(ZIP_OUTPUT).size;
  console.log(`[ok] Zip written: ${(zipSize / 1024 / 1024).toFixed(2)} MB (${zipSize} bytes)`);

  // Write manifest
  manifest.zipSize = zipSize;
  manifest.uncompressedSize = totalUncompressed;
  fs.writeFileSync(MANIFEST_OUTPUT, JSON.stringify(manifest, null, 2));
  console.log(`[ok] Manifest written: ${MANIFEST_OUTPUT}`);

  // Verify zip by reading it back
  console.log('\n=== Verifying zip integrity ===');
  const verifyBuffer = fs.readFileSync(ZIP_OUTPUT);

  // Check EOCD signature
  const eocdOffset = verifyBuffer.length - 22;
  const eocdSig = verifyBuffer.readUInt32LE(eocdOffset);
  if (eocdSig !== 0x06054b50) {
    console.error('FAILED: EOCD signature mismatch');
    process.exit(1);
  }

  const cdOffset = verifyBuffer.readUInt32LE(eocdOffset + 16);
  const cdEntries = verifyBuffer.readUInt16LE(eocdOffset + 10);

  if (cdEntries !== TOTAL_PAGES) {
    console.error(`FAILED: zip contains ${cdEntries} entries, expected ${TOTAL_PAGES}`);
    process.exit(1);
  }

  // Walk central directory and verify each entry
  let pos = cdOffset;
  let verified = 0;
  for (let i = 0; i < cdEntries; i++) {
    const sig = verifyBuffer.readUInt32LE(pos);
    if (sig !== 0x02014b50) {
      console.error(`FAILED: central directory entry ${i} signature mismatch`);
      process.exit(1);
    }
    const crc = verifyBuffer.readUInt32LE(pos + 16);
    const compSize = verifyBuffer.readUInt32LE(pos + 20);
    const uncompSize = verifyBuffer.readUInt32LE(pos + 24);
    const nameLen = verifyBuffer.readUInt16LE(pos + 28);
    const extraLen = verifyBuffer.readUInt16LE(pos + 30);
    const commentLen = verifyBuffer.readUInt16LE(pos + 32);
    const localOffset = verifyBuffer.readUInt32LE(pos + 42);
    const name = verifyBuffer.slice(pos + 46, pos + 46 + nameLen).toString('utf8');

    // Verify against manifest
    const manifestEntry = manifest.fonts[i];
    if (manifestEntry.name !== name) {
      console.error(`FAILED: entry ${i} name mismatch: ${name} vs ${manifestEntry.name}`);
      process.exit(1);
    }

    // Read local file header to get data
    const lfhSig = verifyBuffer.readUInt32LE(localOffset);
    if (lfhSig !== 0x04034b50) {
      console.error(`FAILED: local header signature mismatch for ${name}`);
      process.exit(1);
    }
    const lfhNameLen = verifyBuffer.readUInt16LE(localOffset + 26);
    const lfhExtraLen = verifyBuffer.readUInt16LE(localOffset + 28);
    const dataOffset = localOffset + 30 + lfhNameLen + lfhExtraLen;
    const data = verifyBuffer.slice(dataOffset, dataOffset + uncompSize);

    // Verify CRC
    const dataCrc = crc32(data);
    if (dataCrc !== crc) {
      console.error(`FAILED: CRC mismatch for ${name}: ${dataCrc} vs ${crc}`);
      process.exit(1);
    }

    // Verify magic bytes
    if (data[0] !== WOFF2_MAGIC[0] || data[1] !== WOFF2_MAGIC[1] || data[2] !== WOFF2_MAGIC[2] || data[3] !== WOFF2_MAGIC[3]) {
      console.error(`FAILED: woff2 magic mismatch for ${name}`);
      process.exit(1);
    }

    // Verify hash matches manifest
    const hash = createHash('sha256').update(data).digest('hex').substring(0, 16);
    if (hash !== manifestEntry.sha256) {
      console.error(`FAILED: hash mismatch for ${name}`);
      process.exit(1);
    }

    verified++;
    pos += 46 + nameLen + extraLen + commentLen;
  }

  console.log(`[ok] Verified ${verified}/${TOTAL_PAGES} fonts in zip (CRC + magic + hash all match)`);

  console.log('\n=== SUCCESS ===');
  console.log(`  Fonts in zip: ${TOTAL_PAGES}`);
  console.log(`  Zip size: ${(zipSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Uncompressed: ${(totalUncompressed / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Compression: STORE (no re-compression, woff2 already compressed)`);
  console.log(`  Manifest: ${path.basename(MANIFEST_OUTPUT)}`);
  console.log(`  Output: ${ZIP_OUTPUT}`);
}

main();
