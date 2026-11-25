import { randomUUID } from 'expo-crypto';
import { Directory, File, Paths } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { inspectJpeg, type JpegInfo } from '../core/jpegInfo';
import { isPhotoFileName, orphanFiles } from '../core/photoCleanup';

// Photo pipeline (Technical Analysis section 8). Two constants may be tuned later; they only affect new photos.
export const PHOTO_LONG_EDGE = 1600;
export const PHOTO_QUALITY = 0.8;
export const THUMB_LONG_EDGE = 320;
export const THUMB_QUALITY = 0.7;
/** Photos with a longer side than this are decoded at reduced size first, so a 50 megapixel photo cannot exhaust memory. */
const DECODE_LIMIT = 2400;

const photosDir = () => new Directory(Paths.document, 'photos');
const thumbsDir = () => new Directory(Paths.document, 'thumbs');

function ensureDirs(): void {
  photosDir().create({ idempotent: true, intermediates: true });
  thumbsDir().create({ idempotent: true, intermediates: true });
}

export const photoUri = (file: string): string => new File(photosDir(), file).uri;
export const thumbUri = (file: string): string => new File(thumbsDir(), file).uri;
export const documentFolder = (): string => Paths.document.uri;

export interface ImportedPhoto {
  photoFile: string;
  thumbFile: string;
  /** What the stored file looks like inside (check C7): size, EXIF, GPS, rotation flag. */
  info: JpegInfo;
}

async function reencode(uri: string, width: number, height: number, longEdge: number, quality: number): Promise<{ uri: string; width: number; height: number }> {
  const long = Math.max(width, height);
  const ctx = ImageManipulator.manipulate(uri, long > DECODE_LIMIT ? { maxWidth: DECODE_LIMIT, maxHeight: DECODE_LIMIT } : undefined);
  // Shrink so the long side is at most longEdge; never enlarge. When the size is unknown, shrink by width as a safe guess.
  if (width > 0 && height > 0) {
    if (long > longEdge) ctx.resize(width >= height ? { width: longEdge } : { height: longEdge });
  } else {
    ctx.resize({ width: longEdge });
  }
  const ref = await ctx.renderAsync();
  const out = await ref.saveAsync({ format: SaveFormat.JPEG, compress: quality });
  return { uri: out.uri, width: out.width, height: out.height };
}

function removeQuietly(uri: string): void {
  try {
    const f = new File(uri);
    if (f.exists) f.delete();
  } catch {
    // Leftovers in the cache folder are harmless; Android clears them.
  }
}

/**
 * Takes the picked or captured photo (a file in the cache folder), shrinks and re-draws it as a JPEG, makes the
 * thumbnail, copies both into the permanent folders, and checks the copies. Only then is the photo "attached".
 * Re-drawing also drops the original's metadata, which check C7 verifies on the real file.
 */
export async function importPhoto(asset: { uri: string; width: number; height: number }): Promise<ImportedPhoto> {
  ensureDirs();
  const id = randomUUID();
  const photoFile = `${id}.jpg`;
  const thumbFile = `${id}.jpg`;
  const big = await reencode(asset.uri, asset.width, asset.height, PHOTO_LONG_EDGE, PHOTO_QUALITY);
  const small = await reencode(big.uri, big.width, big.height, THUMB_LONG_EDGE, THUMB_QUALITY);
  const bigCache = big.uri;
  const smallCache = small.uri;
  const photoDest = new File(photosDir(), photoFile);
  const thumbDest = new File(thumbsDir(), thumbFile);
  await new File(bigCache).copy(photoDest);
  await new File(smallCache).copy(thumbDest);
  removeQuietly(bigCache);
  if (smallCache !== bigCache) removeQuietly(smallCache);
  removeQuietly(asset.uri);
  if (!photoDest.exists || !thumbDest.exists || (photoDest.size ?? 0) === 0 || (thumbDest.size ?? 0) === 0) {
    deletePhotoFiles(photoFile, thumbFile);
    throw new Error('The photo files could not be written.');
  }
  const info = inspectJpeg(await photoDest.bytes());
  return { photoFile, thumbFile, info };
}

/** Copies a stored photo and its thumbnail under new names (Duplicate card). */
export async function copyPhotoFiles(photoFile: string, thumbFile: string): Promise<{ photoFile: string; thumbFile: string }> {
  ensureDirs();
  const id = randomUUID();
  const np = `${id}.jpg`;
  await new File(photosDir(), photoFile).copy(new File(photosDir(), np));
  await new File(thumbsDir(), thumbFile).copy(new File(thumbsDir(), np));
  return { photoFile: np, thumbFile: np };
}

export function deletePhotoFiles(photoFile: string | null, thumbFile: string | null): void {
  try {
    if (photoFile && isPhotoFileName(photoFile)) {
      const f = new File(photosDir(), photoFile);
      if (f.exists) f.delete();
    }
    if (thumbFile && isPhotoFileName(thumbFile)) {
      const f = new File(thumbsDir(), thumbFile);
      if (f.exists) f.delete();
    }
  } catch {
    // The next start removes leftovers.
  }
}

/** At every start: delete photo files that no card refers to. Returns how many were removed. */
export function cleanupOrphans(referenced: Set<string>): number {
  let removed = 0;
  ensureDirs();
  for (const [dir, make] of [[photosDir(), (n: string) => new File(photosDir(), n)], [thumbsDir(), (n: string) => new File(thumbsDir(), n)]] as const) {
    const names = dir.list().filter((e): e is File => e instanceof File).map((f) => f.name).filter(isPhotoFileName);
    for (const name of orphanFiles(names, referenced)) {
      try {
        make(name).delete();
        removed++;
      } catch {
        // ignore; retried at the next start
      }
    }
  }
  return removed;
}
