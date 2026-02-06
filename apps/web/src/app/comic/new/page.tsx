'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRepository } from '@comic-catalog/ui';
import { ComicForm } from '../../components/comic-form';

export default function AddComicPage() {
  const repo = useRepository();
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillBarcode = searchParams.get('barcode') || '';

  return (
    <div>
      <button onClick={() => router.push('/')} className="btn btn-ghost mb-4 -ml-2">
        <span className="flex items-center gap-1">
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Library
        </span>
      </button>

      <h1 className="text-2xl font-bold mb-6">Add Comic</h1>
      <ComicForm
        initialData={prefillBarcode ? { barcode: prefillBarcode } : undefined}
        onSave={async (data, tagIds) => {
          const item = await repo.upsertItem(data);
          if (tagIds.length > 0) {
            await repo.setItemTags(item.id, tagIds);
          }
          router.push(`/comic/${item.id}`);
        }}
        onCancel={() => router.push('/')}
      />
    </div>
  );
}
