import { useState, useEffect } from 'react';
import type { ComicFilter } from '../types';
import { storage } from '../utils/storage';

interface SearchFilterProps {
  filter: ComicFilter;
  onFilterChange: (filter: ComicFilter) => void;
}

export function SearchFilter({ filter, onFilterChange }: SearchFilterProps) {
  const [publishers, setPublishers] = useState<string[]>([]);
  const [series, setSeries] = useState<string[]>([]);
  const [authors, setAuthors] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    const loadFilterOptions = async () => {
      const [pubs, sers, auths] = await Promise.all([
        storage.getUniquePublishers(),
        storage.getUniqueSeries(),
        storage.getUniqueAuthors(),
      ]);
      setPublishers(pubs);
      setSeries(sers);
      setAuthors(auths);
    };
    loadFilterOptions();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filter, searchTerm: e.target.value });
  };

  const handlePublisherChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filter, publisher: e.target.value || undefined });
  };

  const handleSeriesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filter, series: e.target.value || undefined });
  };

  const handleAuthorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filter, author: e.target.value || undefined });
  };

  const handleClearFilters = () => {
    onFilterChange({ searchTerm: '' });
  };

  const hasActiveFilters = filter.searchTerm || filter.publisher || filter.series || filter.author;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
      {/* Search Bar */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={filter.searchTerm}
            onChange={handleSearchChange}
            placeholder="Search comics by title, series, author, or publisher..."
            className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          {showAdvanced ? 'Hide Filters' : 'Filters'}
        </button>

        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Publisher
            </label>
            <select
              value={filter.publisher || ''}
              onChange={handlePublisherChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Publishers</option>
              {publishers.map(pub => (
                <option key={pub} value={pub}>{pub}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Series
            </label>
            <select
              value={filter.series || ''}
              onChange={handleSeriesChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Series</option>
              {series.map(ser => (
                <option key={ser} value={ser}>{ser}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Author
            </label>
            <select
              value={filter.author || ''}
              onChange={handleAuthorChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Authors</option>
              {authors.map(auth => (
                <option key={auth} value={auth}>{auth}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
