import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

// Minimal CRC32 implementation for PNG chunks
function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  return table;
}

const crcTable = createCRC32Table();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(8 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  const crcVal = crc32(typeAndData);
  chunk.writeUInt32BE(crcVal, 8 + len);
  return chunk;
}

function createPng(width, height, renderPixel) {
  // PNG signature
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR: width(4), height(4), depth(1)=8, colorType(1)=6 (RGBA), comp(1)=0, filter(1)=0, interlace(1)=0
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8);  // 8 bits per channel
  ihdr.writeUInt8(6, 9);  // RGBA
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Raw image data: height rows, each row has 1 filter byte (0) + width * 4 bytes RGBA
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter None
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = renderPixel(x, y, width, height);
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

// Brand icon generator: "Quem Resolve"
// Premium dark slate background (#0F172A) with vibrant orange (#F97316) wrench/checkmark or badge
function renderBrandIcon(x, y, width, height) {
  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.46; // Rounded squircle/badge
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Rounded squircle background
  // Slate-900 background #0f172a
  const bgR = 15, bgG = 23, bgB = 42;

  // Outer border check
  if (dist > radius) {
    // Check if within rounded rect
    const cornerRadius = width * 0.22;
    const innerW = width / 2 - cornerRadius;
    const innerH = height / 2 - cornerRadius;
    const qx = Math.max(0, Math.abs(dx) - innerW);
    const qy = Math.max(0, Math.abs(dy) - innerH);
    const qdist = Math.sqrt(qx * qx + qy * qy);
    if (qdist > cornerRadius) {
      return [0, 0, 0, 0]; // Transparent outer
    }
  }

  // Inside badge:
  // Circular orange accent ring or solid badge
  // Let's create an elegant icon:
  // Center logo: Diamond or Hexagon with vibrant Orange #f97316 to #ea580c
  const innerRadius = width * 0.30;
  
  // Wrench or checkmark shape:
  // Checkmark in center:
  // Point A (-0.14*w, 0.02*h) -> Point B (-0.02*w, 0.14*h) -> Point C (0.16*w, -0.12*h)
  const normX = (x - cx) / width;
  const normY = (y - cy) / height;

  // Let's check distance to checkmark segments
  const thick = 0.055;
  // Seg 1: from (-0.14, 0.02) to (-0.02, 0.14)
  const d1 = distToSegment(normX, normY, -0.14, 0.01, -0.02, 0.14);
  // Seg 2: from (-0.02, 0.14) to (0.18, -0.12)
  const d2 = distToSegment(normX, normY, -0.02, 0.14, 0.18, -0.12);

  // Circular orange background shield
  if (dist < innerRadius) {
    // Orange badge
    const grad = (normY + 0.3) / 0.6;
    const oR = Math.round(249 - grad * 15);
    const oG = Math.round(115 - grad * 27);
    const oB = Math.round(22 - grad * 10);

    // If on checkmark: white #ffffff
    if (d1 < thick || d2 < thick) {
      return [255, 255, 255, 255];
    }
    return [oR, oG, oB, 255];
  }

  // Border ring of orange shield
  if (dist >= innerRadius && dist < innerRadius + width * 0.025) {
    return [249, 115, 22, 120];
  }

  return [bgR, bgG, bgB, 255];
}

function distToSegment(px, py, x1, y1, x2, y2) {
  const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  if (l2 === 0) return Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1));
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  const projX = x1 + t * (x2 - x1);
  const projY = y1 + t * (y2 - y1);
  return Math.sqrt((px - projX) * (px - projX) + (py - projY) * (py - projY));
}

// Generate files
const publicDir = path.resolve('public');
fs.mkdirSync(publicDir, { recursive: true });

console.log('Generating PWA icons...');
const icon192 = createPng(192, 192, renderBrandIcon);
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), icon192);
console.log('Created public/icon-192.png (' + icon192.length + ' bytes)');

const icon512 = createPng(512, 512, renderBrandIcon);
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), icon512);
console.log('Created public/icon-512.png (' + icon512.length + ' bytes)');

const appleTouchIcon = createPng(180, 180, renderBrandIcon);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleTouchIcon);
console.log('Created public/apple-touch-icon.png (' + appleTouchIcon.length + ' bytes)');

const favicon = createPng(64, 64, renderBrandIcon);
fs.writeFileSync(path.join(publicDir, 'favicon.png'), favicon);
console.log('Created public/favicon.png (' + favicon.length + ' bytes)');
