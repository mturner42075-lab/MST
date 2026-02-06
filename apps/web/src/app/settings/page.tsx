'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRepository } from '@comic-catalog/ui';
import type { StorageInfo } from '@comic-catalog/core';

export default function SettingsPage() {
  const repo = useRepository();
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    repo.getStorageInfo().then(setStorageInfo);
  }, [repo]);

  const handleExport = async () => {
    setExporting(true);
    setMessage(null);
    try {
      const zipBytes = await repo.exportBackup();
      const blob = new Blob([zipBytes.buffer as ArrayBuffer], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `comic-catalog-backup-${new Date().toISOString().slice(0, 10)}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: 'Backup exported successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: `Export failed: ${err instanceof Error ? err.message : 'Unknown error'}` });
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('Import will replace ALL existing data. Continue?')) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setImporting(true);
    setMessage(null);
    try {
      const arrayBuf = await file.arrayBuffer();
      const zipBytes = new Uint8Array(arrayBuf);
      await repo.importBackup(zipBytes);
      const info = await repo.getStorageInfo();
      setStorageInfo(info);
      setMessage({ type: 'success', text: `Backup imported successfully! ${info.itemCount} comics restored.` });
    } catch (err) {
      setMessage({ type: 'error', text: `Import failed: ${err instanceof Error ? err.message : 'Unknown error'}` });
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* Storage Info */}
      <section className="card p-5 mb-4">
        <h2 className="font-semibold text-gray-800 mb-3">Storage</h2>
        {storageInfo ? (
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Comics" value={storageInfo.itemCount} />
            <StatCard label="Tags" value={storageInfo.tagCount} />
            <StatCard label="Images" value={storageInfo.imageCount} />
            {storageInfo.estimatedSizeBytes != null && (
              <div className="col-span-3 text-sm text-gray-500">
                Estimated storage used: {formatBytes(storageInfo.estimatedSizeBytes)}
              </div>
            )}
          </div>
        ) : (
          <div className="animate-pulse text-gray-400 text-sm">Loading...</div>
        )}
      </section>

      {/* Import / Export */}
      <section className="card p-5 mb-4">
        <h2 className="font-semibold text-gray-800 mb-3">Backup & Restore</h2>
        <p className="text-sm text-gray-500 mb-4">
          Export your entire collection as a ZIP file, or import from a previous backup.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="btn btn-primary flex items-center justify-center gap-2"
          >
            <DownloadIcon size={16} />
            {exporting ? 'Exporting...' : 'Export Backup'}
          </button>

          <label className={`btn btn-secondary flex items-center justify-center gap-2 cursor-pointer ${importing ? 'opacity-50' : ''}`}>
            <UploadIcon size={16} />
            {importing ? 'Importing...' : 'Import Backup'}
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip"
              onChange={handleImport}
              disabled={importing}
              className="hidden"
            />
          </label>
        </div>

        {message && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}
      </section>

      {/* About */}
      <section className="card p-5">
        <h2 className="font-semibold text-gray-800 mb-3">About</h2>
        <p className="text-sm text-gray-500 mb-1">
          <strong>Comic Catalog</strong> v0.1.0
        </p>
        <p className="text-sm text-gray-400">
          A local-only comic book collection manager. Your data stays on your device.
        </p>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center p-3 bg-gray-50 rounded-lg">
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

function DownloadIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function UploadIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}
