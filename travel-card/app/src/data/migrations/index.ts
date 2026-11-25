import { m001 } from './m001_initial';
import { m002Marker } from './m002_updateTest';
import type { Migration } from './runner';

/**
 * Every release carries migrations 1 and 2. Migration 2 first appeared in the milestone 2 update-test build and has
 * already run on the test phone, so it stays forever as a harmless step (a database must never be "newer" than the app).
 */
export const MIGRATIONS: Migration[] = [m001, m002Marker];

export function getMigrations(): Migration[] {
  return MIGRATIONS;
}

export { m001, m002Marker };
