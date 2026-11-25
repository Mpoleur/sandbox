import type { Migration } from './runner';

/**
 * Version 2: adds a harmless column and a setting. It was written for the milestone 2 update test (to prove that a newer
 * APK over an older one runs a database upgrade and keeps the cards) and is kept in every later release, because that test
 * left the test phone's database at version 2. Never edit it.
 */
export const m002Marker: Migration = {
  version: 2,
  name: 'update marker (from the milestone 2 update test, kept)',
  async up(tx) {
    await tx.exec('ALTER TABLE cards ADD COLUMN update_test_marker TEXT');
    await tx.run("INSERT OR REPLACE INTO settings (key, value) VALUES ('updateTestMigrated', '1')");
  },
};
