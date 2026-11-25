import * as ImagePicker from 'expo-image-picker';

export interface PickedAsset {
  uri: string;
  width: number;
  height: number;
}

export type PickOutcome =
  | { status: 'ok'; asset: PickedAsset }
  | { status: 'cancelled' }
  | { status: 'denied' }
  | { status: 'error'; message: string };

function fromResult(r: ImagePicker.ImagePickerResult): PickOutcome {
  if (r.canceled || !r.assets || r.assets.length === 0) return { status: 'cancelled' };
  const a = r.assets[0];
  return { status: 'ok', asset: { uri: a.uri, width: a.width ?? 0, height: a.height ?? 0 } };
}

// quality 1: the photo is compressed only once, by the photo pipeline. No editing, no EXIF requested.
const OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  quality: 1,
  exif: false,
  allowsEditing: false,
  allowsMultipleSelection: false,
};

/** Opens the camera. Asks for the CAMERA permission on first use (Technical Analysis 8.1). */
export async function takePhoto(): Promise<PickOutcome> {
  try {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return { status: 'denied' };
    return fromResult(await ImagePicker.launchCameraAsync(OPTIONS));
  } catch (e) {
    return { status: 'error', message: e instanceof Error ? e.message : String(e) };
  }
}

/** Opens Android's photo picker. It needs no permission. */
export async function choosePhoto(): Promise<PickOutcome> {
  try {
    return fromResult(await ImagePicker.launchImageLibraryAsync(OPTIONS));
  } catch (e) {
    return { status: 'error', message: e instanceof Error ? e.message : String(e) };
  }
}

/**
 * Android may close the app while the camera or gallery is open. At the next start this returns the photo that was
 * picked meanwhile (or null). Technical Analysis 8.4.
 */
export async function pendingPhoto(): Promise<PickedAsset | null> {
  try {
    const r = await ImagePicker.getPendingResultAsync();
    if (!r || 'code' in r) return null;
    const out = fromResult(r);
    return out.status === 'ok' ? out.asset : null;
  } catch {
    return null;
  }
}
