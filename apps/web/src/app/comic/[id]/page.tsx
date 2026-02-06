'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useRepository } from '@comic-catalog/ui';
import type { Item, Tag } from '@comic-catalog/core';
import { ComicForm } from '../../components/comic-form';
import { CoverImage } from '../../components/cover-image';

export default function ComicDetailPage() {
  const repo = useRepository();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [item, setItem] = useState<Item | null>(null);
  const [itemTags, setItemTags] = useState<Tag[]>([]);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadItem = useCallback(async () => {
    setLoading(true);
    const found = await repo.getItem(id);
    if (found) {
      setItem(found);
      const tags = await repo.getItemTags(id);
      setItemTags(tags);
    }
    setLoading(false);
  }, [repo, id]);

  useEffect(() => {
    loadItem();
  }, [loadItem]);

  const handleDelete = async () => {
    if (!confirm('Delete this comic? This cannot be undone.')) return;
    await repo.deleteItem(id);
    router.push('/');
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !item) return;

    const arrayBuf = await file.arrayBuffer();
    const data = new Uint8Array(arrayBuf);
    await repo.attachCoverImage(item.id, {
      data,
      mime: file.type || 'image/jpeg',
    });
    await loadItem();
  };

  const handleRemoveCover = async () => {
    if (!item) return;
    await repo.deleteCoverImage(item.id);
    await loadItem();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-20">
        <h2 className="text-lg font-semibold text-gray-500">Comic not found</h2>
        <button onClick={() => router.push('/')} className="btn btn-primary mt-4">
          Back to Library
        </button>
      </div>
    );
  }

  if (editing) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Edit Comic</h1>
        <ComicForm
          initialData={item}
          initialTags={itemTags}
          onSave={async (data, tagIds) => {
            await repo.upsertItem({ ...data, id: item.id });
            await repo.setItemTags(item.id, tagIds);
            setEditing(false);
            await loadItem();
          }}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div>
      {/* Back button */}
      <button onClick={() => router.push('/')} className="btn btn-ghost mb-4 -ml-2">
        <span className="flex items-center gap-1">
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Library
        </span>
      </button>

      <div className="grid md:grid-cols-[280px_1fr] gap-6">
        {/* Cover */}
        <div>
          <div className="card aspect-[2/3] relative group">
            <CoverImage imageId={item.coverImageId} alt={`${item.series} #${item.issueNumber}`} />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <label className="btn btn-primary cursor-pointer text-xs">
                {item.coverImageId ? 'Change Cover' : 'Upload Cover'}
                <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
              </label>
              {item.coverImageId && (
                <button onClick={handleRemoveCover} className="btn btn-danger text-xs ml-2">
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Details */}
        <div>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{item.series}</h1>
              <p className="text-lg text-gray-500">
                #{item.issueNumber}
                {item.variant && <span className="text-gray-400"> ({item.variant})</span>}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(true)} className="btn btn-primary">
                Edit
              </button>
              <button onClick={handleDelete} className="btn btn-danger">
                Delete
              </button>
            </div>
          </div>

          <div className="card p-5 space-y-4">
            <DetailRow label="Publisher" value={item.publisher} />
            <DetailRow label="Release Date" value={item.releaseDate} />
            <DetailRow label="Writers" value={item.writers} />
            <DetailRow label="Artists" value={item.artists} />
            <DetailRow label="Condition" value={item.condition} />
            <DetailRow
              label="Purchase Price"
              value={item.purchasePrice != null ? `$${item.purchasePrice.toFixed(2)}` : null}
            />
            <DetailRow label="Location" value={item.location} />
            <DetailRow label="Barcode" value={item.barcode} />
            {item.notes && (
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Notes</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.notes}</p>
              </div>
            )}
            {itemTags.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {itemTags.map((tag) => (
                    <span key={tag.id} className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-medium">
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-4">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider w-32 flex-shrink-0 pt-0.5">{label}</p>
      <p className="text-sm text-gray-700">{value}</p>
    </div>
  );
}
