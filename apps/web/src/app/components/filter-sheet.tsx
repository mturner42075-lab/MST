'use client';

import React, { useState, useEffect } from 'react';
import type { ListFilters, Tag, IComicRepository } from '@comic-catalog/core';

interface FilterSheetProps {
  filters: ListFilters;
  tags: Tag[];
  onApply: (filters: ListFilters) => void;
  onClose: () => void;
  repo: IComicRepository;
}

export function FilterSheet({ filters, tags, onApply, onClose, repo }: FilterSheetProps) {
  const [draft, setDraft] = useState<ListFilters>({ ...filters });
  const [seriesList, setSeriesList] = useState<string[]>([]);
  const [publishersList, setPublishersList] = useState<string[]>([]);
  const [locationsList, setLocationsList] = useState<string[]>([]);

  useEffect(() => {
    repo.getDistinctSeries().then(setSeriesList);
    repo.getDistinctPublishers().then(setPublishersList);
    repo.getDistinctLocations().then(setLocationsList);
  }, [repo]);

  const handleClear = () => {
    setDraft({});
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white h-full shadow-xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button onClick={onClose} className="btn-ghost p-1 rounded-lg">
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-5">
          {/* Series */}
          <div>
            <label className="label">Series</label>
            <select
              className="input"
              value={draft.series || ''}
              onChange={(e) => setDraft({ ...draft, series: e.target.value || undefined })}
            >
              <option value="">All series</option>
              {seriesList.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Publisher */}
          <div>
            <label className="label">Publisher</label>
            <select
              className="input"
              value={draft.publisher || ''}
              onChange={(e) => setDraft({ ...draft, publisher: e.target.value || undefined })}
            >
              <option value="">All publishers</option>
              {publishersList.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="label">Location</label>
            <select
              className="input"
              value={draft.location || ''}
              onChange={(e) => setDraft({ ...draft, location: e.target.value || undefined })}
            >
              <option value="">All locations</option>
              {locationsList.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div>
              <label className="label">Tags</label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const selected = draft.tags?.includes(tag.id) || false;
                  return (
                    <button
                      key={tag.id}
                      onClick={() => {
                        const current = draft.tags || [];
                        const next = selected
                          ? current.filter((id) => id !== tag.id)
                          : [...current, tag.id];
                        setDraft({ ...draft, tags: next.length > 0 ? next : undefined });
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selected
                          ? 'bg-brand-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {tag.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Checkboxes */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={draft.missingCover || false}
                onChange={(e) => setDraft({ ...draft, missingCover: e.target.checked || undefined })}
                className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm text-gray-700">Missing cover</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={draft.missingBarcode || false}
                onChange={(e) => setDraft({ ...draft, missingBarcode: e.target.checked || undefined })}
                className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm text-gray-700">Missing barcode</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3">
          <button onClick={handleClear} className="btn btn-secondary flex-1">
            Clear All
          </button>
          <button onClick={() => onApply(draft)} className="btn btn-primary flex-1">
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
