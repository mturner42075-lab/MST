'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { RepositoryContext } from '@comic-catalog/ui';
import { WebRepository } from '@comic-catalog/repo/web';

export function Providers({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const repo = useMemo(() => new WebRepository(), []);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-gray-400 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <RepositoryContext.Provider value={repo}>
      {children}
    </RepositoryContext.Provider>
  );
}
