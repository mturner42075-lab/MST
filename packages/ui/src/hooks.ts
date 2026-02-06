import { createContext, useContext } from 'react';
import type { IComicRepository } from '@comic-catalog/core';

export const RepositoryContext = createContext<IComicRepository | null>(null);

export function useRepository(): IComicRepository {
  const repo = useContext(RepositoryContext);
  if (!repo) {
    throw new Error('useRepository must be used within a RepositoryContext.Provider');
  }
  return repo;
}
