import React, { createContext, useContext } from 'react';
import type { CardsRepo } from './cardsRepo';
import type { CategoriesRepo } from './categoriesRepo';
import type { SettingsRepo } from './settingsRepo';
import type { Db } from './db';

export interface AppData {
  db: Db;
  cards: CardsRepo;
  categories: CategoriesRepo;
  settings: SettingsRepo;
}

const Ctx = createContext<AppData | null>(null);

export function AppDataProvider({ data, children }: { data: AppData; children: React.ReactNode }) {
  return <Ctx.Provider value={data}>{children}</Ctx.Provider>;
}

export function useData(): AppData {
  const v = useContext(Ctx);
  if (!v) throw new Error('useData must be used inside AppDataProvider');
  return v;
}
