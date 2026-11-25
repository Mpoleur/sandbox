/** Files on disk that no card refers to are leftovers (a crash between copying a photo and saving its card). */
export function orphanFiles(onDisk: string[], referenced: Set<string>): string[] {
  return onDisk.filter((f) => !referenced.has(f));
}

/** File names are <uuid>.jpg in photos/ and thumbs/. Names are checked before anything is deleted. */
export function isPhotoFileName(name: string): boolean {
  return /^[0-9a-fA-F-]{36}\.jpg$/.test(name);
}
