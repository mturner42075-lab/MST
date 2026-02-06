'use client';

import React, { useState, useEffect } from 'react';
import { useRepository } from '@comic-catalog/ui';
import type { Item, Tag } from '@comic-catalog/core';
import { ConditionOptions } from '@comic-catalog/core';

interface ComicFormProps {
  initialData?: Partial<Item>;
  initialTags?: Tag[];
  onSave: (
    data: Partial<Item> & { series: string; issueNumber: string },
    tagIds: string[],
  ) => Promise<void>;
  onCancel?: () => void;
}

export function ComicForm({ initialData, initialTags, onSave, onCancel }: ComicFormProps) {
  const repo = useRepository();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [series, setSeries] = useState(initialData?.series || '');
  const [issueNumber, setIssueNumber] = useState(initialData?.issueNumber || '');
  const [variant, setVariant] = useState(initialData?.variant || '');
  const [publisher, setPublisher] = useState(initialData?.publisher || '');
  const [releaseDate, setReleaseDate] = useState(initialData?.releaseDate || '');
  const [writers, setWriters] = useState(initialData?.writers || '');
  const [artists, setArtists] = useState(initialData?.artists || '');
  const [condition, setCondition] = useState(initialData?.condition || '');
  const [purchasePrice, setPurchasePrice] = useState(
    initialData?.purchasePrice != null ? String(initialData.purchasePrice) : '',
  );
  const [location, setLocation] = useState(initialData?.location || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [barcode, setBarcode] = useState(initialData?.barcode || '');

  // Tags
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    initialTags?.map((t) => t.id) || [],
  );
  const [newTagName, setNewTagName] = useState('');

  useEffect(() => {
    repo.listTags().then(setAllTags);
  }, [repo]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!series.trim()) errs.series = 'Series is required';
    if (!issueNumber.trim()) errs.issueNumber = 'Issue number is required';
    if (purchasePrice && isNaN(parseFloat(purchasePrice))) {
      errs.purchasePrice = 'Must be a valid number';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);

    try {
      await onSave(
        {
          ...initialData,
          series: series.trim(),
          issueNumber: issueNumber.trim(),
          variant: variant.trim() || null,
          publisher: publisher.trim() || null,
          releaseDate: releaseDate || null,
          writers: writers.trim(),
          artists: artists.trim(),
          condition: condition || null,
          purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
          location: location.trim() || null,
          notes: notes.trim() || null,
          barcode: barcode.trim() || null,
        },
        selectedTagIds,
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;
    const tag = await repo.upsertTag(newTagName.trim());
    setAllTags((prev) => (prev.some((t) => t.id === tag.id) ? prev : [...prev, tag]));
    setSelectedTagIds((prev) => (prev.includes(tag.id) ? prev : [...prev, tag.id]));
    setNewTagName('');
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-5 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Series *" error={errors.series}>
          <input className="input" value={series} onChange={(e) => setSeries(e.target.value)} placeholder="e.g., The Amazing Spider-Man" />
        </Field>
        <Field label="Issue Number *" error={errors.issueNumber}>
          <input className="input" value={issueNumber} onChange={(e) => setIssueNumber(e.target.value)} placeholder="e.g., 300" />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Variant">
          <input className="input" value={variant} onChange={(e) => setVariant(e.target.value)} placeholder="e.g., Newsstand Edition" />
        </Field>
        <Field label="Publisher">
          <input className="input" value={publisher} onChange={(e) => setPublisher(e.target.value)} placeholder="e.g., Marvel Comics" />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Release Date">
          <input type="date" className="input" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} />
        </Field>
        <Field label="Condition">
          <select className="input" value={condition} onChange={(e) => setCondition(e.target.value)}>
            <option value="">Select condition</option>
            {ConditionOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Writers">
          <input className="input" value={writers} onChange={(e) => setWriters(e.target.value)} placeholder="Comma-separated names" />
        </Field>
        <Field label="Artists">
          <input className="input" value={artists} onChange={(e) => setArtists(e.target.value)} placeholder="Comma-separated names" />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Purchase Price ($)" error={errors.purchasePrice}>
          <input className="input" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} placeholder="0.00" />
        </Field>
        <Field label="Location">
          <input className="input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., Box A, Shelf 3" />
        </Field>
      </div>

      <Field label="Barcode">
        <input className="input" value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="UPC/EAN barcode" />
      </Field>

      <Field label="Notes">
        <textarea className="input min-h-[80px]" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any additional notes..." />
      </Field>

      {/* Tags */}
      <div>
        <label className="label">Tags</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {allTags.map((tag) => {
            const selected = selectedTagIds.includes(tag.id);
            return (
              <button
                type="button"
                key={tag.id}
                onClick={() =>
                  setSelectedTagIds((prev) =>
                    selected ? prev.filter((id) => id !== tag.id) : [...prev, tag.id],
                  )
                }
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
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
        <div className="flex gap-2">
          <input
            className="input flex-1"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="New tag..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
          />
          <button type="button" onClick={handleAddTag} className="btn btn-secondary">
            Add Tag
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving ? 'Saving...' : 'Save Comic'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
