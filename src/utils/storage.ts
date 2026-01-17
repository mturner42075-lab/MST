import localforage from 'localforage';
import type { Comic } from '../types';

// Configure localforage
const comicStore = localforage.createInstance({
  name: 'ComicBookCollector',
  storeName: 'comics',
});

export const storage = {
  // Get all comics
  async getAllComics(): Promise<Comic[]> {
    const comics: Comic[] = [];
    await comicStore.iterate<Comic, void>((value) => {
      comics.push(value);
    });
    return comics.sort((a, b) =>
      new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
    );
  },

  // Get a single comic by ID
  async getComic(id: string): Promise<Comic | null> {
    return await comicStore.getItem<Comic>(id);
  },

  // Add or update a comic
  async saveComic(comic: Comic): Promise<void> {
    await comicStore.setItem(comic.id, comic);
  },

  // Delete a comic
  async deleteComic(id: string): Promise<void> {
    await comicStore.removeItem(id);
  },

  // Clear all comics
  async clearAll(): Promise<void> {
    await comicStore.clear();
  },

  // Get unique values for filters
  async getUniquePublishers(): Promise<string[]> {
    const comics = await this.getAllComics();
    const publishers = new Set(comics.map(c => c.publisher).filter(Boolean));
    return Array.from(publishers) as string[];
  },

  async getUniqueSeries(): Promise<string[]> {
    const comics = await this.getAllComics();
    const series = new Set(comics.map(c => c.series).filter(Boolean));
    return Array.from(series) as string[];
  },

  async getUniqueAuthors(): Promise<string[]> {
    const comics = await this.getAllComics();
    const authors = new Set(comics.map(c => c.author).filter(Boolean));
    return Array.from(authors) as string[];
  },
};
