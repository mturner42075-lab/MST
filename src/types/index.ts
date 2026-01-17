export interface Comic {
  id: string;
  title: string;
  issueNumber?: string;
  series?: string;
  publisher?: string;
  author?: string;
  artist?: string;
  releaseDate?: string;
  description?: string;
  coverImage?: string;
  fileData?: string; // Base64 encoded CBZ/CBR file
  fileName?: string;
  dateAdded: string;
  tags?: string[];
  grade?: string;
  notes?: string;
}

export interface ComicFilter {
  searchTerm: string;
  publisher?: string;
  series?: string;
  author?: string;
  tags?: string[];
}

export interface ComicAPIResult {
  id: number;
  title: string;
  issue_number: string;
  description: string;
  cover_date: string;
  image: {
    original_url: string;
    medium_url: string;
    small_url: string;
  };
  volume: {
    name: string;
  };
  publisher?: {
    name: string;
  };
}
