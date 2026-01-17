import type { Comic } from '../types';

interface ComicCardProps {
  comic: Comic;
  onView: (comic: Comic) => void;
  onEdit: (comic: Comic) => void;
  onDelete: (id: string) => void;
}

export function ComicCard({ comic, onView, onEdit, onDelete }: ComicCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      <div
        className="h-64 bg-gray-200 dark:bg-gray-700 cursor-pointer relative overflow-hidden"
        onClick={() => onView(comic)}
      >
        {comic.coverImage ? (
          <img
            src={comic.coverImage}
            alt={comic.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        )}
        {comic.fileData && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
            CBZ
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">
          {comic.title}
        </h3>

        {comic.issueNumber && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Issue #{comic.issueNumber}
          </p>
        )}

        {comic.series && (
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {comic.series}
          </p>
        )}

        {comic.publisher && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {comic.publisher}
          </p>
        )}

        {comic.releaseDate && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {new Date(comic.releaseDate).toLocaleDateString()}
          </p>
        )}

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onView(comic)}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
          >
            View
          </button>
          <button
            onClick={() => onEdit(comic)}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => {
              if (confirm(`Delete "${comic.title}"?`)) {
                onDelete(comic.id);
              }
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
