import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Minimal standard PNG builder without external dependencies
function createPng(width, height, colorRgba, innerDrawFn) {
  // CRC table
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[n] = c;
  }
  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(4 + 4 + len + 4);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);
    const crcVal = crc32(buf.subarray(4, 8 + len));
    buf.writeUInt32BE(crcVal, 8 + len);
    return buf;
  }

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: 6 (RGBA)
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Scanlines: width * 4 + 1 filter byte per line
  const scanlineLen = width * 4 + 1;
  const rawData = Buffer.alloc(scanlineLen * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLen;
    rawData[rowOffset] = 0; // Filter: 0 (None)
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      let r = colorRgba[0];
      let g = colorRgba[1];
      let b = colorRgba[2];
      let a = colorRgba[3];

      if (innerDrawFn) {
        const custom = innerDrawFn(x, y, width, height);
        if (custom) {
          r = custom[0];
          g = custom[1];
          b = custom[2];
          a = custom[3];
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// GMC Brand palette: deep forest green (#1B4332), emerald (#2D6A4F), lotus (#52B788), gold (#E9A822)
function drawGmcIcon(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const maxR = w * 0.45;

  // Background gradient: dark forest to deep green
  const normY = y / h;
  const bgR = Math.round(15 + normY * 12);
  const bgG = Math.round(41 + normY * 26);
  const bgB = Math.round(30 + normY * 19);

  // Pulse ring 1
  if (Math.abs(dist - w * 0.35) < Math.max(1, w * 0.008)) {
    return [82, 183, 136, 180];
  }
  // Pulse ring 2 (inner gold)
  if (Math.abs(dist - w * 0.24) < Math.max(1, w * 0.006)) {
    return [233, 168, 34, 200];
  }

  // Central lotus/leaf emblem
  // Normalized coords relative to center
  const lx = dx / (w * 0.22);
  const ly = (dy - h * 0.02) / (h * 0.25);
  // Leaf shape equation: (x^2 + (y - sqrt(|x|))^2 <= 1)
  const leafBound = Math.pow(lx, 2) + Math.pow(ly - 0.2 * Math.sqrt(Math.abs(lx)), 2);

  if (leafBound <= 0.6) {
    // Leaf body
    return [82, 183, 136, 255];
  } else if (leafBound <= 0.75) {
    // Leaf glow edge
    return [45, 106, 79, 255];
  }

  // Golden apex jewel
  const jx = dx;
  const jy = dy + h * 0.18;
  if (Math.sqrt(jx * jx + jy * jy) <= w * 0.035) {
    return [233, 168, 34, 255];
  }

  return [bgR, bgG, bgB, 255];
}

const outDir = path.resolve('public');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Generate 192x192
const p192 = createPng(192, 192, [27, 67, 50, 255], drawGmcIcon);
fs.writeFileSync(path.join(outDir, 'pwa-192x192.png'), p192);

// Generate 512x512
const p512 = createPng(512, 512, [27, 67, 50, 255], drawGmcIcon);
fs.writeFileSync(path.join(outDir, 'pwa-512x512.png'), p512);

// Generate Maskable 512x512 (with extra safe zone padding)
const pMaskable = createPng(512, 512, [27, 67, 50, 255], (x, y, w, h) => {
  // Center is scaled down slightly by 0.8 to respect 15% safe padding
  const cx = w / 2;
  const cy = h / 2;
  const nx = (x - cx) * 1.25 + cx;
  const ny = (y - cy) * 1.25 + cy;
  if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
    return drawGmcIcon(nx, ny, w, h);
  }
  return [27, 67, 50, 255];
});
fs.writeFileSync(path.join(outDir, 'pwa-maskable-512x512.png'), pMaskable);

// Generate Apple Touch Icon (180x180)
const pApple = createPng(180, 180, [27, 67, 50, 255], drawGmcIcon);
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), pApple);

// Generate favicon.ico / favicon.png
fs.writeFileSync(path.join(outDir, 'favicon.png'), p192);

console.log('Successfully generated all PWA icons in /public:');
console.log('- /public/pwa-192x192.png');
console.log('- /public/pwa-512x512.png');
console.log('- /public/pwa-maskable-512x512.png');
console.log('- /public/apple-touch-icon.png');
