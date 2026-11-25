/**
 * A small JPEG reader used by check C7: after the photo pipeline has re-drawn a photo, does the file still carry
 * EXIF data, a GPS block, or a rotation flag? Reads only the marker segments; never decodes the picture.
 */
export interface JpegInfo {
  valid: boolean;
  width: number;
  height: number;
  hasExif: boolean;
  /** EXIF orientation 1 to 8, or null when absent. 1 means "upright". */
  orientation: number | null;
  hasGps: boolean;
}

const EMPTY: JpegInfo = { valid: false, width: 0, height: 0, hasExif: false, orientation: null, hasGps: false };

export function inspectJpeg(b: Uint8Array): JpegInfo {
  if (b.length < 4 || b[0] !== 0xff || b[1] !== 0xd8) return { ...EMPTY };
  const info: JpegInfo = { ...EMPTY, valid: true };
  let p = 2;
  while (p + 4 <= b.length) {
    if (b[p] !== 0xff) { p++; continue; }
    const marker = b[p + 1];
    if (marker === 0xff) { p++; continue; }
    if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) { p += 2; continue; }
    if (marker === 0xd9 || marker === 0xda) break; // end of image, or start of the picture data
    const len = (b[p + 2] << 8) | b[p + 3];
    const start = p + 4;
    if (marker === 0xe1 && len >= 8 && b[start] === 0x45 && b[start + 1] === 0x78 && b[start + 2] === 0x69 && b[start + 3] === 0x66) {
      info.hasExif = true;
      readExif(b, start + 6, Math.min(b.length, p + 2 + len), info);
    }
    if ((marker >= 0xc0 && marker <= 0xcf) && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc && start + 5 <= b.length) {
      info.height = (b[start + 1] << 8) | b[start + 2];
      info.width = (b[start + 3] << 8) | b[start + 4];
    }
    p += 2 + len;
  }
  return info;
}

function readExif(b: Uint8Array, t0: number, end: number, info: JpegInfo): void {
  if (t0 + 8 > end) return;
  const little = b[t0] === 0x49 && b[t0 + 1] === 0x49;
  const u16 = (o: number) => (little ? b[o] | (b[o + 1] << 8) : (b[o] << 8) | b[o + 1]);
  const u32 = (o: number) => (little ? (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0 : ((b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]) >>> 0);
  const ifd0 = t0 + u32(t0 + 4);
  if (ifd0 + 2 > end) return;
  const n = u16(ifd0);
  for (let i = 0; i < n; i++) {
    const e = ifd0 + 2 + i * 12;
    if (e + 12 > end) return;
    const tag = u16(e);
    if (tag === 0x0112) info.orientation = u16(e + 8);
    if (tag === 0x8825) info.hasGps = true;
  }
}
