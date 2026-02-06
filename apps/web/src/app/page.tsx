'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRepository } from '@comic-catalog/ui';
import type { Item, ListFilters, Tag } from '@comic-catalog/core';
import { CoverImage } from './components/cover-image';
import { FilterSheet } from './components/filter-sheet';

type ViewMode = 'grid' | 'list';

export default function LibraryPage() {
  const repo = useRepository();
  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>('grid');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<ListFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const result = await repo.listItems({ search, filters, limit: 200 });
      setItems(result.items);
      setTotal(result.total);
    } finally {
      setLoading(false);
    }
  }, [repo, search, filters]);

  useEffect(() => {
    loadItems();
    repo.listTags().then(setTags);
  }, [loadItems, repo]);

  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== undefined && v !== false && (!Array.isArray(v) || v.length > 0),
  ).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Library</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {total} comic{total !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/comic/new" className="btn btn-primary no-underline">
          + Add Comic
        </Link>
      </div>

      {/* Search + Filters + View Toggle */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search series, publisher, creators..."
            className="input pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowFilters(true)}
          className={`btn ${activeFilterCount > 0 ? 'btn-primary' : 'btn-secondary'} flex items-center gap-1.5`}
        >
          <FilterIcon size={16} />
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-white text-brand-700 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setView('grid')}
            className={`p-1.5 rounded-md transition-colors ${view === 'grid' ? 'bg-white shadow-sm' : ''}`}
          >
            <GridIcon size={18} />
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-1.5 rounded-md transition-colors ${view === 'list' ? 'bg-white shadow-sm' : ''}`}
          >
            <ListIcon size={18} />
          </button>
        </div>
      </div>

      {/* Items */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse text-gray-400">Loading...</div>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-gray-300 mb-4">
            <BookStackIcon size={64} />
          </div>
          <h2 className="text-lg font-semibold text-gray-500 mb-2">No comics yet</h2>
          <p className="text-gray-400 mb-4">Start building your collection by adding your first comic.</p>
          <Link href="/comic/new" className="btn btn-primary no-underline inline-block">
            Add Your First Comic
          </Link>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {items.map((item) => (
            <GridCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <ListCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Filter Sheet */}
      {showFilters && (
        <FilterSheet
          filters={filters}
          tags={tags}
          onApply={(f) => {
            setFilters(f);
            setShowFilters(false);
          }}
          onClose={() => setShowFilters(false)}
          repo={repo}
        />
      )}
    </div>
  );
}

function GridCard({ item }: { item: Item }) {
  return (
    <Link href={`/comic/${item.id}`} className="card group hover:shadow-md transition-shadow no-underline">
      <div className="aspect-[2/3] bg-gray-100 relative overflow-hidden">
        <CoverImage imageId={item.coverImageId} alt={`${item.series} #${item.issueNumber}`} />
      </div>
      <div className="p-3">
        <p className="font-semibold text-sm text-gray-900 truncate">{item.series}</p>
        <p className="text-xs text-gray-500">#{item.issueNumber}{item.variant ? ` (${item.variant})` : ''}</p>
        {item.publisher && <p className="text-xs text-gray-400 mt-0.5">{item.publisher}</p>}
      </div>
    </Link>
  );
}

function ListCard({ item }: { item: Item }) {
  return (
    <Link href={`/comic/${item.id}`} className="card flex items-center p-3 gap-3 hover:shadow-md transition-shadow no-underline">
      <div className="w-12 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
        <CoverImage imageId={item.coverImageId} alt={`${item.series} #${item.issueNumber}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-900 truncate">
          {item.series} #{item.issueNumber}
          {item.variant ? <span className="text-gray-400 font-normal"> ({item.variant})</span> : ''}
        </p>
        {item.publisher && <p className="text-xs text-gray-500">{item.publisher}</p>}
        {item.condition && <p className="text-xs text-gray-400">{item.condition}</p>}
      </div>
      {item.purchasePrice != null && (
        <span className="text-sm font-medium text-gray-600">${item.purchasePrice.toFixed(2)}</span>
      )}
    </Link>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function FilterIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

function GridIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function ListIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function BookStackIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="inline-block">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
      <path d="M8 7h6M8 11h4" />
    </svg>
  );
}
