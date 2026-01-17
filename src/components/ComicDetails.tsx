import type { Comic } from '../types';

interface ComicDetailsProps {
  comic: Comic;
  onClose: () => void;
  onEdit: () => void;
  onRead?: () => void;
}

export function ComicDetails({ comic, onClose, onEdit, onRead }: ComicDetailsProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full my-8">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {comic.title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column - Image */}
            <div>
              {comic.coverImage ? (
                <img
                  src={comic.coverImage}
                  alt={comic.title}
                  className="w-full rounded-lg shadow-lg"
                />
              ) : (
                <div className="w-full h-96 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <svg className="w-24 h-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              )}
            </div>

            {/* Right Column - Details */}
            <div className="space-y-4">
              {comic.issueNumber && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">Issue Number</h3>
                  <p className="text-lg text-gray-900 dark:text-white">#{comic.issueNumber}</p>
                </div>
              )}

              {comic.series && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">Series</h3>
                  <p className="text-lg text-gray-900 dark:text-white">{comic.series}</p>
                </div>
              )}

              {comic.publisher && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">Publisher</h3>
                  <p className="text-lg text-gray-900 dark:text-white">{comic.publisher}</p>
                </div>
              )}

              {comic.author && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">Author</h3>
                  <p className="text-lg text-gray-900 dark:text-white">{comic.author}</p>
                </div>
              )}

              {comic.artist && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">Artist</h3>
                  <p className="text-lg text-gray-900 dark:text-white">{comic.artist}</p>
                </div>
              )}

              {comic.releaseDate && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">Release Date</h3>
                  <p className="text-lg text-gray-900 dark:text-white">
                    {new Date(comic.releaseDate).toLocaleDateString()}
                  </p>
                </div>
              )}

              {comic.grade && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">Grade</h3>
                  <p className="text-lg text-gray-900 dark:text-white">{comic.grade}</p>
                </div>
              )}

              {comic.tags && comic.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {comic.tags.map(tag => (
                      <span
                        key={tag}
                        className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {comic.description && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Description</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{comic.description}</p>
            </div>
          )}

          {/* Notes */}
          {comic.notes && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Notes</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{comic.notes}</p>
            </div>
          )}

          {/* Date Added */}
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Added to collection: {new Date(comic.dateAdded).toLocaleDateString()}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            {comic.fileData && onRead && (
              <button
                onClick={onRead}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Read Comic
              </button>
            )}
            <button
              onClick={onEdit}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Edit
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
