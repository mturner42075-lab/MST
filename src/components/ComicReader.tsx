import { useState, useEffect } from 'react';
import type { Comic } from '../types';
import { readCBZ, base64ToFile, cleanupPages } from '../utils/comicReader';
import type { ComicPage } from '../utils/comicReader';

interface ComicReaderProps {
  comic: Comic;
  onClose: () => void;
}

export function ComicReader({ comic, onClose }: ComicReaderProps) {
  const [pages, setPages] = useState<ComicPage[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadComic = async () => {
      if (!comic.fileData) {
        setError('No comic file available');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const file = base64ToFile(comic.fileData, comic.fileName || 'comic.cbz');
        const extractedPages = await readCBZ(file);
        setPages(extractedPages);
        setError(null);
      } catch (err) {
        console.error('Error loading comic:', err);
        setError(err instanceof Error ? err.message : 'Failed to load comic');
      } finally {
        setLoading(false);
      }
    };

    loadComic();

    // Cleanup on unmount
    return () => {
      if (pages.length > 0) {
        cleanupPages(pages);
      }
    };
  }, [comic.fileData, comic.fileName]);

  const goToNextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') goToNextPage();
    if (e.key === 'ArrowLeft') goToPrevPage();
    if (e.key === 'Escape') onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black z-50 flex flex-col"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Header */}
      <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{comic.title}</h2>
          {pages.length > 0 && (
            <p className="text-sm text-gray-400">
              Page {currentPage + 1} of {pages.length}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-300 text-2xl font-bold px-4"
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center overflow-hidden relative">
        {loading && (
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading comic...</p>
          </div>
        )}

        {error && (
          <div className="text-white text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded"
            >
              Close
            </button>
          </div>
        )}

        {!loading && !error && pages.length > 0 && (
          <>
            {/* Current Page Image */}
            <img
              src={pages[currentPage].url}
              alt={`Page ${currentPage + 1}`}
              className="max-w-full max-h-full object-contain"
            />

            {/* Navigation Buttons */}
            {currentPage > 0 && (
              <button
                onClick={goToPrevPage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-4 rounded-full"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {currentPage < pages.length - 1 && (
              <button
                onClick={goToNextPage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-4 rounded-full"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </>
        )}
      </div>

      {/* Footer with Page Navigation */}
      {!loading && !error && pages.length > 0 && (
        <div className="bg-gray-900 text-white p-4">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 0}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded"
            >
              Previous
            </button>

            <input
              type="range"
              min="0"
              max={pages.length - 1}
              value={currentPage}
              onChange={(e) => setCurrentPage(parseInt(e.target.value))}
              className="flex-1 max-w-md"
            />

            <button
              onClick={goToNextPage}
              disabled={currentPage === pages.length - 1}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded"
            >
              Next
            </button>
          </div>

          <p className="text-center text-sm text-gray-400 mt-2">
            Use arrow keys or buttons to navigate
          </p>
        </div>
      )}
    </div>
  );
}
