import { randomUUID } from 'expo-crypto';
import { File } from 'expo-file-system';
import { DRAFT_SETTING_KEY, parseDraft, type EditorDraft } from './core/draft';
import { getUserVersion } from './data/db';
import { createCardsRepo } from './data/cardsRepo';
import { createCategoriesRepo } from './data/categoriesRepo';
import { createSettingsRepo } from './data/settingsRepo';
import type { AppData } from './data/AppData';
import { getMigrations } from './data/migrations';
import { migrate } from './data/migrations/runner';
import { openExpoDb } from './platform/expoDb';
import { cleanupOrphans, deletePhotoFiles, documentFolder, importPhoto, type ImportedPhoto } from './platform/photoStore';
import { pendingPhoto } from './platform/picker';

export interface Recovery {
  draft: EditorDraft;
  photo: ImportedPhoto;
}

/** Facts about this start, shown on the milestone 2 check area of the home screen (checks C6, C8, C12). */
export interface BootInfo {
  versionBefore: number;
  versionAfter: number;
  databaseDirectory: string;
  photosFolder: string;
  safetyCopyMade: boolean;
  orphansRemoved: number;
  recovered: boolean;
}

export interface BootResult {
  data: AppData;
  recovery: Recovery | null;
  info: BootInfo;
}

const deps = { newId: () => randomUUID(), now: () => new Date().toISOString() };
export const appDeps = deps;

/**
 * Start-up (Technical Analysis 11.2): open the database, run missing upgrades, delete photo files no card uses,
 * and recover a photo picked while Android had closed the app. A failure here shows the error screen; nothing is wiped.
 */
export async function boot(): Promise<BootResult> {
  const { db, directory, fileName } = await openExpoDb();
  const versionBefore = await getUserVersion(db);
  let safetyCopyMade = false;
  await migrate(db, getMigrations(), deps, {
    beforeMigrate: async (from) => {
      const dir = directory.startsWith('file://') ? directory : `file://${directory}`;
      const src = new File(dir.endsWith('/') ? dir : `${dir}/`, fileName);
      const copy = new File(dir.endsWith('/') ? dir : `${dir}/`, `${fileName}.before-v${from}`);
      if (copy.exists) copy.delete();
      await src.copy(copy);
      safetyCopyMade = true;
    },
  });
  const versionAfter = await getUserVersion(db);
  const cards = createCardsRepo(db, deps);
  const settings = createSettingsRepo(db);
  const categories = createCategoriesRepo(db, { newId: () => `c_${randomUUID()}` });

  // Files of an unsaved draft must survive the clean-up, because the draft may be restored below.
  const draft = parseDraft(await settings.get(DRAFT_SETTING_KEY));
  const referenced = await cards.referencedFiles();
  const keep = new Set(referenced);
  if (draft?.photoFile) keep.add(draft.photoFile);
  if (draft?.thumbFile) keep.add(draft.thumbFile);
  const orphansRemoved = cleanupOrphans(keep);

  let recovery: Recovery | null = null;
  const pending = await pendingPhoto();
  if (pending && draft) {
    try {
      const photo = await importPhoto(pending);
      recovery = { draft, photo };
    } catch {
      recovery = null;
    }
  }
  if (!recovery && draft) {
    // A draft with no picked photo belongs to an editor that was closed normally or lost: drop it and its unsaved files.
    if (draft.photoFile && !referenced.has(draft.photoFile)) deletePhotoFiles(draft.photoFile, draft.thumbFile);
    await settings.remove(DRAFT_SETTING_KEY);
  }
  return {
    data: { db, cards, categories, settings },
    recovery,
    info: {
      versionBefore,
      versionAfter,
      databaseDirectory: directory,
      photosFolder: documentFolder(),
      safetyCopyMade,
      orphansRemoved,
      recovered: !!recovery,
    },
  };
}
