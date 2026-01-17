# Comic Book Collector App

A modern web application for managing your comic book collection, built with React, TypeScript, and Tailwind CSS.

## Features

### Collection Management
- Add, edit, and delete comics from your collection
- Store detailed information including title, issue number, series, publisher, author, artist, and more
- Grade comics using standard comic grading scales
- Add custom tags and notes to organize your collection

### CBZ File Reader
- Upload and store CBZ (Comic Book ZIP) files
- Built-in reader with page navigation
- Keyboard shortcuts for easy reading (Arrow keys to navigate, ESC to close)
- Fullscreen reading experience

### Search & Filter
- Search across title, series, author, and publisher
- Advanced filtering by publisher, series, and author
- Real-time search results
- Clear visual indication of active filters

### API Integration
- Search for comic metadata using the Comic Vine API (mock data included for demo)
- Auto-populate comic details from search results
- Fetch cover images and descriptions

### Additional Features
- Dark mode support
- Responsive design for all screen sizes
- Persistent storage using IndexedDB (via localforage)
- Clean, modern UI with Tailwind CSS

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd MST
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

### Adding a Comic

1. Click the "Add Comic" button in the header
2. Fill in the comic details (title is required)
3. Optionally use the "Search Comic Database" feature to auto-populate fields
4. Upload a CBZ file if you have a digital copy
5. Click "Add Comic" to save

### Reading a Comic

1. Click on any comic card to view details
2. If a CBZ file is attached, click "Read Comic"
3. Use the arrow keys or navigation buttons to browse pages
4. Press ESC to exit the reader

### Searching and Filtering

1. Use the search bar to find comics by title, series, author, or publisher
2. Click "Filters" to access advanced filtering options
3. Select specific publishers, series, or authors to narrow results
4. Click "Clear" to reset all filters

## Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Storage**: LocalForage (IndexedDB)
- **File Handling**: JSZip for CBZ reading
- **HTTP Client**: Axios for API calls
- **Routing**: React Router DOM

## Project Structure

```
src/
├── components/          # React components
│   ├── ComicCard.tsx   # Individual comic display
│   ├── ComicForm.tsx   # Add/edit comic form
│   ├── ComicDetails.tsx # Detailed comic view
│   ├── ComicReader.tsx # CBZ file reader
│   └── SearchFilter.tsx # Search and filter UI
├── hooks/              # Custom React hooks
│   └── useComics.ts    # Comic collection management
├── types/              # TypeScript type definitions
│   └── index.ts        # All type interfaces
├── utils/              # Utility functions
│   ├── storage.ts      # IndexedDB storage operations
│   ├── comicReader.ts  # CBZ file reading
│   └── comicAPI.ts     # API integration
├── App.tsx             # Main application component
└── main.tsx            # Application entry point
```

## API Integration

The app includes mock data for demonstration purposes. To use real data from Comic Vine:

1. Get an API key from [Comic Vine](https://comicvine.gamespot.com/api/)
2. Update the `comicAPI.ts` file to use your API key
3. Note: You may need a proxy server to avoid CORS issues

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Future Enhancements

- User authentication and cloud sync
- Export/import collection data
- Wishlist functionality
- Price tracking and valuation
- Series completion tracking
- Mobile app versions
- CBR (RAR) file support
- Multiple reading modes (single page, double page)

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
