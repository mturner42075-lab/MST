import { useState } from 'react';
import type { Comic } from './types';
import { useComics } from './hooks/useComics';
import { ComicCard } from './components/ComicCard';
import { ComicForm } from './components/ComicForm';
import { ComicDetails } from './components/ComicDetails';
import { ComicReader } from './components/ComicReader';
import { SearchFilter } from './components/SearchFilter';

function App() {
  const {
    comics,
    loading,
    filter,
    setFilter,
    addComic,
    updateComic,
    deleteComic,
  } = useComics();

  const [showForm, setShowForm] = useState(false);
  const [editingComic, setEditingComic] = useState<Comic | undefined>();
  const [viewingComic, setViewingComic] = useState<Comic | undefined>();
  const [readingComic, setReadingComic] = useState<Comic | undefined>();

  const handleAddComic = async (comicData: Omit<Comic, 'id' | 'dateAdded'>) => {
    await addComic(comicData);
    setShowForm(false);
  };

  const handleUpdateComic = async (comicData: Omit<Comic, 'id' | 'dateAdded'>) => {
    if (editingComic) {
      await updateComic(editingComic.id, comicData);
      setEditingComic(undefined);
      setViewingComic(undefined);
    }
  };

  const handleViewComic = (comic: Comic) => {
    setViewingComic(comic);
  };

  const handleEditComic = (comic: Comic) => {
    setEditingComic(comic);
    setViewingComic(undefined);
  };

  const handleReadComic = (comic: Comic) => {
    if (comic.fileData) {
      setReadingComic(comic);
      setViewingComic(undefined);
    }
  };

  const handleDeleteComic = async (id: string) => {
    await deleteComic(id);
    setViewingComic(undefined);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Comic Book Collector
              </h1>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Comic
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search and Filter */}
        <SearchFilter filter={filter} onFilterChange={setFilter} />

        {/* Stats */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-700 dark:text-gray-300">
            {loading ? (
              'Loading...'
            ) : (
              <>
                Showing <span className="font-bold">{comics.length}</span> comic{comics.length !== 1 ? 's' : ''}
              </>
            )}
          </p>
        </div>

        {/* Comics Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : comics.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No comics in your collection
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Start building your collection by adding your first comic!
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Add Your First Comic
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {comics.map(comic => (
              <ComicCard
                key={comic.id}
                comic={comic}
                onView={handleViewComic}
                onEdit={handleEditComic}
                onDelete={handleDeleteComic}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      {showForm && (
        <ComicForm
          onSave={handleAddComic}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingComic && (
        <ComicForm
          comic={editingComic}
          onSave={handleUpdateComic}
          onCancel={() => setEditingComic(undefined)}
        />
      )}

      {viewingComic && (
        <ComicDetails
          comic={viewingComic}
          onClose={() => setViewingComic(undefined)}
          onEdit={() => handleEditComic(viewingComic)}
          onRead={() => handleReadComic(viewingComic)}
        />
      )}

      {readingComic && (
        <ComicReader
          comic={readingComic}
          onClose={() => setReadingComic(undefined)}
        />
      )}
    </div>
  );
}

export default App;
