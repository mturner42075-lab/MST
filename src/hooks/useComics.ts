import { useState, useEffect, useCallback } from 'react';
import type { Comic, ComicFilter } from '../types';
import { storage } from '../utils/storage';

export function useComics() {
  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ComicFilter>({ searchTerm: '' });

  // Load comics from storage
  const loadComics = useCallback(async () => {
    setLoading(true);
    try {
      const allComics = await storage.getAllComics();
      setComics(allComics);
    } catch (error) {
      console.error('Error loading comics:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load comics on mount
  useEffect(() => {
    loadComics();
  }, [loadComics]);

  // Add a new comic
  const addComic = useCallback(async (comic: Omit<Comic, 'id' | 'dateAdded'>) => {
    const newComic: Comic = {
      ...comic,
      id: crypto.randomUUID(),
      dateAdded: new Date().toISOString(),
    };
    await storage.saveComic(newComic);
    await loadComics();
    return newComic;
  }, [loadComics]);

  // Update an existing comic
  const updateComic = useCallback(async (id: string, updates: Partial<Comic>) => {
    const existing = await storage.getComic(id);
    if (!existing) return;

    const updated: Comic = {
      ...existing,
      ...updates,
      id, // Ensure ID doesn't change
      dateAdded: existing.dateAdded, // Preserve original date
    };
    await storage.saveComic(updated);
    await loadComics();
  }, [loadComics]);

  // Delete a comic
  const deleteComic = useCallback(async (id: string) => {
    await storage.deleteComic(id);
    await loadComics();
  }, [loadComics]);

  // Filter comics based on current filter
  const filteredComics = comics.filter(comic => {
    const matchesSearch = !filter.searchTerm ||
      comic.title.toLowerCase().includes(filter.searchTerm.toLowerCase()) ||
      comic.series?.toLowerCase().includes(filter.searchTerm.toLowerCase()) ||
      comic.author?.toLowerCase().includes(filter.searchTerm.toLowerCase()) ||
      comic.publisher?.toLowerCase().includes(filter.searchTerm.toLowerCase());

    const matchesPublisher = !filter.publisher || comic.publisher === filter.publisher;
    const matchesSeries = !filter.series || comic.series === filter.series;
    const matchesAuthor = !filter.author || comic.author === filter.author;

    const matchesTags = !filter.tags?.length ||
      filter.tags.some(tag => comic.tags?.includes(tag));

    return matchesSearch && matchesPublisher && matchesSeries && matchesAuthor && matchesTags;
  });

  return {
    comics: filteredComics,
    allComics: comics,
    loading,
    filter,
    setFilter,
    addComic,
    updateComic,
    deleteComic,
    refreshComics: loadComics,
  };
}
