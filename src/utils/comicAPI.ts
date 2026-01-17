import axios from 'axios';
import type { ComicAPIResult } from '../types';

// Note: Comic Vine API requires an API key. Users would need to get their own from:
// https://comicvine.gamespot.com/api/
// For demo purposes, we'll create a mock API

const COMIC_VINE_API_BASE = 'https://comicvine.gamespot.com/api';

/**
 * Search for comics using Comic Vine API
 * Note: This is a demo implementation. In production, you'd need:
 * 1. A valid API key
 * 2. Proxy server to avoid CORS issues
 * 3. Rate limiting
 */
export async function searchComics(query: string, apiKey?: string): Promise<ComicAPIResult[]> {
  // If no API key provided, return mock data for demo
  if (!apiKey) {
    return getMockComics(query);
  }

  try {
    const response = await axios.get(`${COMIC_VINE_API_BASE}/search/`, {
      params: {
        api_key: apiKey,
        format: 'json',
        query: query,
        resources: 'issue',
        limit: 10,
      },
    });

    return response.data.results || [];
  } catch (error) {
    console.error('Error fetching from Comic Vine API:', error);
    return getMockComics(query);
  }
}

/**
 * Get comic details by ID
 */
export async function getComicDetails(id: number, apiKey?: string): Promise<ComicAPIResult | null> {
  if (!apiKey) {
    return null;
  }

  try {
    const response = await axios.get(`${COMIC_VINE_API_BASE}/issue/4000-${id}/`, {
      params: {
        api_key: apiKey,
        format: 'json',
      },
    });

    return response.data.results;
  } catch (error) {
    console.error('Error fetching comic details:', error);
    return null;
  }
}

/**
 * Mock comic data for demo purposes
 */
function getMockComics(query: string): ComicAPIResult[] {
  const mockData: ComicAPIResult[] = [
    {
      id: 1,
      title: 'The Amazing Spider-Man',
      issue_number: '1',
      description: 'First appearance of Spider-Man in his own series!',
      cover_date: '1963-03-01',
      image: {
        original_url: 'https://via.placeholder.com/400x600/3b82f6/ffffff?text=Spider-Man+%231',
        medium_url: 'https://via.placeholder.com/300x450/3b82f6/ffffff?text=Spider-Man+%231',
        small_url: 'https://via.placeholder.com/150x225/3b82f6/ffffff?text=Spider-Man+%231',
      },
      volume: {
        name: 'The Amazing Spider-Man',
      },
      publisher: {
        name: 'Marvel Comics',
      },
    },
    {
      id: 2,
      title: 'Batman',
      issue_number: '1',
      description: 'The debut of the Dark Knight in his own title!',
      cover_date: '1940-04-01',
      image: {
        original_url: 'https://via.placeholder.com/400x600/1f2937/ffffff?text=Batman+%231',
        medium_url: 'https://via.placeholder.com/300x450/1f2937/ffffff?text=Batman+%231',
        small_url: 'https://via.placeholder.com/150x225/1f2937/ffffff?text=Batman+%231',
      },
      volume: {
        name: 'Batman',
      },
      publisher: {
        name: 'DC Comics',
      },
    },
    {
      id: 3,
      title: 'X-Men',
      issue_number: '1',
      description: 'The strangest super-heroes of all!',
      cover_date: '1963-09-01',
      image: {
        original_url: 'https://via.placeholder.com/400x600/ef4444/ffffff?text=X-Men+%231',
        medium_url: 'https://via.placeholder.com/300x450/ef4444/ffffff?text=X-Men+%231',
        small_url: 'https://via.placeholder.com/150x225/ef4444/ffffff?text=X-Men+%231',
      },
      volume: {
        name: 'X-Men',
      },
      publisher: {
        name: 'Marvel Comics',
      },
    },
  ];

  // Simple filter based on query
  if (!query) return mockData;

  const lowerQuery = query.toLowerCase();
  return mockData.filter(comic =>
    comic.title.toLowerCase().includes(lowerQuery) ||
    comic.volume.name.toLowerCase().includes(lowerQuery) ||
    comic.publisher?.name.toLowerCase().includes(lowerQuery)
  );
}
