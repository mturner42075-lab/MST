# CLAUDE.md — AI Assistant Guide for MST (Comic Book Collector)

This file provides context for AI assistants (Claude, Copilot, etc.) working in this codebase.

---

## Project Overview

**MST** is a client-side web application for managing and reading digital comic book collections. It requires no backend server — all data is stored locally in the browser using IndexedDB. The app is built with React 19, TypeScript, Vite, and Tailwind CSS.

**Core capabilities:**
- Add, edit, and delete comics with rich metadata
- Upload and read CBZ (Comic Book ZIP) files in-browser
- Search and filter the collection in real-time
- Auto-populate metadata via Comic Vine API (mock data included for demos)
- Persistent storage with no login required

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | React 19 |
| Language | TypeScript 5.9 (strict mode) |
| Build Tool | Vite 7 |
| Styling | Tailwind CSS 4 |
| Storage | localforage (IndexedDB wrapper) |
| HTTP Client | Axios |
| File Handling | JSZip (CBZ parsing) |
| Routing | React Router DOM 7 (installed, not yet used) |
| Linting | ESLint 9 (flat config) + typescript-eslint |

---

## Repository Structure

```
MST/
├── src/
│   ├── components/          # React UI components (PascalCase filenames)
│   │   ├── ComicCard.tsx    # Grid card for a single comic
│   │   ├── ComicForm.tsx    # Add/edit form with API search + CBZ upload
│   │   ├── ComicDetails.tsx # Full-detail modal view
│   │   ├── ComicReader.tsx  # Fullscreen CBZ page reader
│   │   └── SearchFilter.tsx # Search bar + advanced filter panel
│   ├── hooks/
│   │   └── useComics.ts     # Primary state/data hook (CRUD, filtering)
│   ├── types/
│   │   └── index.ts         # All shared TypeScript interfaces
│   ├── utils/
│   │   ├── storage.ts       # IndexedDB operations via localforage
│   │   ├── comicAPI.ts      # Comic Vine API + mock data
│   │   └── comicReader.ts   # CBZ parsing with JSZip
│   ├── App.tsx              # Root component, modal state management
│   ├── main.tsx             # React entry point (StrictMode)
│   ├── index.css            # Tailwind directives (@tailwind base/components/utilities)
│   └── App.css              # Legacy styles (minimal, mostly unused)
├── public/
│   └── vite.svg
├── index.html               # HTML entry point (Vite injects bundles here)
├── vite.config.ts           # Vite config (React plugin only)
├── tsconfig.json            # Project references root
├── tsconfig.app.json        # App TypeScript config (strict, ES2022 target)
├── tsconfig.node.json       # Node/Vite config TypeScript settings
├── eslint.config.js         # ESLint flat config
├── tailwind.config.js       # Tailwind content paths
├── postcss.config.js        # PostCSS with Tailwind + autoprefixer
├── package.json
└── README.md
```

---

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173, hot reload)
npm run dev

# Type-check and build for production (output: dist/)
npm run build

# Lint all TypeScript/TSX files
npm run lint

# Preview production build locally
npm run preview
```

**No test runner is configured.** There are currently no test files in the project.

---

## TypeScript Interfaces (src/types/index.ts)

These are the three core interfaces used throughout the app:

```typescript
// A comic in the collection
interface Comic {
  id: string;               // UUID
  title: string;            // Required
  issueNumber?: string;
  series?: string;
  publisher?: string;
  author?: string;
  artist?: string;
  releaseDate?: string;
  description?: string;
  coverImage?: string;      // URL or base64 data URI
  fileData?: string;        // Base64-encoded CBZ file contents
  fileName?: string;
  dateAdded: string;        // ISO timestamp
  tags?: string[];
  grade?: string;           // e.g. "NM", "VF", "9.8"
  notes?: string;
}

// Active search/filter state
interface ComicFilter {
  searchTerm: string;
  publisher?: string;
  series?: string;
  author?: string;
  tags?: string[];
}

// Shape of Comic Vine API response
interface ComicAPIResult {
  id: number;
  title: string;
  issue_number: string;
  description: string;
  cover_date: string;
  image: { original_url: string; medium_url: string; small_url: string };
  volume: { name: string };
  publisher?: { name: string };
}
```

---

## Key Architectural Decisions

### Client-only storage
All data lives in the browser's IndexedDB via `localforage`. There is no backend, no authentication, and no network sync. CBZ file contents are stored as base64 strings — large files will consume significant browser storage.

### State management via custom hook
`useComics` (`src/hooks/useComics.ts`) is the single source of truth for the comic collection. It exposes CRUD operations and filtered results. Components receive state and callbacks as props from `App.tsx`.

### CBZ reading
CBZ files are ZIP archives containing image files. `comicReader.ts` uses JSZip to extract pages, sort them alphabetically, and convert them to base64 data URIs for display. Supported image extensions: `jpg`, `jpeg`, `png`, `gif`, `webp`, `bmp`.

### API integration
`comicAPI.ts` is designed to call the Comic Vine API but ships with mock data so the app works without an API key. To enable real API data, add your Comic Vine API key and a CORS proxy URL to that file.

---

## Code Conventions

### File and naming conventions
- **Components**: `PascalCase.tsx` (e.g., `ComicCard.tsx`)
- **Hooks**: `camelCase.ts` with `use` prefix (e.g., `useComics.ts`)
- **Utilities**: `camelCase.ts` (e.g., `comicReader.ts`)
- **Types**: centralized in `src/types/index.ts`; add new interfaces there

### Styling
- Use **Tailwind CSS utility classes** exclusively for styling
- Support `dark:` variants for dark mode where applicable
- `App.css` is legacy — do not add new styles there
- Do not introduce CSS-in-JS libraries (styled-components, emotion, etc.)

### TypeScript
- Strict mode is enabled — do not use `any` unless absolutely necessary
- All new code must pass `tsc -b` with zero errors
- Unused variables and parameters are treated as errors by the compiler
- Place new shared interfaces in `src/types/index.ts`

### ESLint
- ESLint v9 flat config is used (`eslint.config.js`)
- React Hooks rules are enforced — always include correct `useEffect` dependency arrays
- React Refresh rules are enforced — export only components from component files
- Run `npm run lint` and resolve all warnings/errors before committing

### Component patterns
- Use **functional components** with React hooks only — no class components
- Keep components focused; extract logic into hooks or utils when it grows
- Modal/overlay state (open, selected comic) is managed in `App.tsx` and passed as props

---

## Storage Layer (src/utils/storage.ts)

The storage utilities wrap `localforage` (IndexedDB):

- `saveComic(comic)` — upserts a comic by `id`
- `getComics()` — loads all comics
- `deleteComic(id)` — removes by id
- `getUniqueValues(key)` — extracts unique values for a field (used to populate filter dropdowns)

All functions are async and return Promises. Handle errors at the call site.

---

## Component Responsibilities

| Component | Responsibility |
|-----------|---------------|
| `App.tsx` | Root layout, modal open/close state, passes callbacks to children |
| `ComicCard` | Displays a comic in the grid; fires `onSelect` and `onDelete` callbacks |
| `ComicForm` | Form for creating/editing comics; handles CBZ file upload and API search |
| `ComicDetails` | Read-only modal showing all comic fields; opens reader |
| `ComicReader` | Fullscreen page-by-page CBZ reader; keyboard navigation (←/→/ESC) |
| `SearchFilter` | Controlled search input + collapsible advanced filter panel |
| `useComics` | Hook: loads from storage, exposes filtered list, handles CRUD operations |

---

## Common Development Tasks

### Add a new field to a Comic
1. Add the field to the `Comic` interface in `src/types/index.ts`
2. Add an input to `ComicForm.tsx`
3. Display it in `ComicDetails.tsx`
4. If it's a filterable field, update `ComicFilter` interface and `useComics.ts` filter logic
5. Update `SearchFilter.tsx` if it needs a UI control

### Add a new component
1. Create `src/components/NewComponent.tsx`
2. Use functional component syntax with TypeScript props interface
3. Style with Tailwind utility classes
4. Export only the component from the file (ESLint react-refresh rule)

### Enable real Comic Vine API
1. Obtain an API key from https://comicvine.gamespot.com/api/
2. Set up a CORS proxy (the API does not support browser requests directly)
3. Update `src/utils/comicAPI.ts` with the key and proxy URL

### Add routing (React Router is already installed)
React Router DOM v7 is a dependency but is not yet wired up. To add routing:
1. Wrap `<App />` in `<BrowserRouter>` in `main.tsx`
2. Define `<Routes>` and `<Route>` elements in `App.tsx`

---

## What Does Not Exist (Yet)

- **Tests** — no test framework is configured; Vitest would be the natural choice given Vite
- **CI/CD** — no GitHub Actions or other pipeline files
- **Backend** — entirely client-side; no API server, database, or authentication
- **CBR support** — RAR-format comics are not supported (only CBZ/ZIP)
- **Cloud sync** — all data is local to the browser

---

## Git Workflow

- `master` is the main branch
- Feature branches should follow the pattern `claude/<description>-<id>`
- Commit messages should be clear and describe the intent of the change
- Push with: `git push -u origin <branch-name>`
