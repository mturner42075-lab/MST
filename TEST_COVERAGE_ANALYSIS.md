# Test Coverage Analysis

## Current State

**Coverage: 0%** — the project has no test files, no test framework installed, and no CI pipeline.

Every module, component, and code path is entirely untested.

---

## Recommended Test Framework Setup

Since the project uses Vite, the natural choice is **Vitest** (zero-config Vite integration) paired with **@testing-library/react** for component tests and **jsdom** for DOM simulation.

Dependencies to add:

```json
"devDependencies": {
  "vitest": "^2.x",
  "@vitest/coverage-v8": "^2.x",
  "@testing-library/react": "^16.x",
  "@testing-library/user-event": "^14.x",
  "@testing-library/jest-dom": "^6.x",
  "jsdom": "^26.x"
}
```

`vite.config.ts` test block to add:

```ts
test: {
  environment: 'jsdom',
  globals: true,
  setupFiles: ['./src/test/setup.ts'],
  coverage: {
    provider: 'v8',
    reporter: ['text', 'html'],
  },
}
```

---

## Priority 1 — `src/utils/comicReader.ts` (Highest ROI)

These are pure utility functions with no external dependencies beyond `JSZip` and browser APIs, making them the easiest entry point for tests.

### `base64ToFile()`

**Known bug:** if the `base64` argument does not contain a comma (e.g. a malformed string), `arr[1]` is `undefined` and `atob(undefined)` throws an uncaught `TypeError`. The MIME regex `.match(/:(.*?);/)` can also return `null` — the `?.[1]` optional chain handles this, but the fallback `'application/zip'` is only correct for CBZ files; a malformed input still produces a silently wrong result.

Test cases to cover:
- Happy path: valid base64 data URL → returns a `File` with correct name and MIME type
- MIME extraction: `data:image/png;base64,...` → file MIME is `image/png`
- Missing MIME (no colon/semicolon in prefix) → falls back to `application/zip`
- Malformed input (no comma) → should throw or be handled; currently crashes

### `readCBZ()`

Test cases:
- Valid CBZ with `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.bmp` images → all extracted
- Files with non-image extensions (`.xml`, `.txt`) → excluded
- Files starting with `__MACOSX` → excluded
- Directory entries inside the ZIP → excluded (`file.dir === true`)
- Files returned in alphabetical order
- Invalid/corrupt ZIP → throws `"Failed to read comic file..."` error

### `fileToBase64()`

Test cases:
- Valid `File` object → resolves with a `data:` prefixed base64 string
- `FileReader` error event → promise rejects

### `cleanupPages()`

Test cases:
- Calls `URL.revokeObjectURL` once per page
- Works with an empty array (no error)

---

## Priority 2 — `src/utils/comicAPI.ts`

### `searchComics()`

Test cases:
- **No API key**: returns mock data (calls `getMockComics`, not axios)
- **With API key, success**: calls `axios.get` with correct URL, params (`api_key`, `format`, `resources`, `limit`); returns `response.data.results`
- **With API key, API returns empty `results`**: returns `[]`
- **With API key, axios throws**: falls back to `getMockComics`

### Mock data filtering (`getMockComics` — tested indirectly via `searchComics()`)

Test cases:
- Empty query string → returns all 3 mock comics
- Query matching a title (case-insensitive, e.g. `"spider"`) → returns Spider-Man entry only
- Query matching a volume name → correct result
- Query matching a publisher name → correct result
- Query matching nothing → returns `[]`
- Comic with no `publisher` field → does not throw (the `?.` optional chain is exercised)

### `getComicDetails()`

Test cases:
- No API key → returns `null` immediately (no axios call)
- With API key, success → calls correct URL `issue/4000-{id}/` and returns `response.data.results`
- With API key, axios throws → returns `null`

---

## Priority 3 — `src/hooks/useComics.ts`

The `filteredComics` computation contains the most business logic in the codebase. Test with `renderHook` and a mocked `storage` module.

### Filter logic

Test cases:
- No filter set → all comics returned
- `searchTerm` matches `title` (case-insensitive)
- `searchTerm` matches `series`
- `searchTerm` matches `author`
- `searchTerm` matches `publisher`
- `searchTerm` matches nothing → empty result
- `publisher` filter (exact match) → only comics with that publisher
- `series` filter (exact match)
- `author` filter (exact match)
- `tags` filter: any tag in the array matches → comic included
- `tags` filter: no tags overlap → comic excluded
- Multiple filters combined: all must pass (AND logic)
- Comic with `undefined` optional fields does not throw

### CRUD operations

Test cases:
- `addComic()`: assigns a `crypto.randomUUID()` id, sets `dateAdded` as ISO string, calls `storage.saveComic`, triggers a reload
- `updateComic()`: merges updates, preserves original `id` and `dateAdded`, calls `storage.saveComic`
- `updateComic()` for non-existent id: `storage.getComic` returns `null` → returns early, no save called
- `deleteComic()`: calls `storage.deleteComic(id)` then triggers reload
- Initial mount: sets `loading = true`, then `false` after storage resolves; populates `comics`
- Storage error on load: sets `loading = false`, `comics` stays `[]`

---

## Priority 4 — `src/utils/storage.ts`

Requires mocking `localforage` (or using an in-memory localforage driver).

### `getAllComics()`

Test cases:
- Returns comics sorted by `dateAdded` descending (newest first)
- Returns `[]` when store is empty

### `getComic()`

Test cases:
- Returns the comic for a known id
- Returns `null` for an unknown id

### `saveComic()` / `deleteComic()`

Test cases:
- Save then retrieve → same object returned
- Save then delete then retrieve → `null`

### `getUniquePublishers()` / `getUniqueSeries()` / `getUniqueAuthors()`

Test cases:
- Deduplicates: two comics with same publisher → only one entry
- Filters out `undefined` / `null` / empty-string values (the `filter(Boolean)` call)
- Returns `[]` when no comics exist

---

## Priority 5 — `src/components/ComicCard.tsx`

### Rendering

Test cases:
- Renders comic `title`
- Renders `<img>` with `src=coverImage` when `coverImage` is set
- Renders placeholder SVG when `coverImage` is absent
- Shows CBZ badge when `fileData` is present; hides it when absent
- Renders `issueNumber`, `series`, `publisher`, `releaseDate` only when the fields are defined

### Interactions

Test cases:
- Clicking the card image area calls `onView(comic)`
- Clicking the View button calls `onView(comic)`
- Clicking the Edit button calls `onEdit(comic)`
- Clicking Delete with `window.confirm` returning `true` → calls `onDelete(comic.id)`
- Clicking Delete with `window.confirm` returning `false` → `onDelete` not called

> **Note:** The inline `window.confirm()` call in `ComicCard` is an antipattern that blocks the main thread and is awkward to test. Replacing it with a custom modal or a prop-based confirmation handler would improve both UX and testability.

---

## Priority 6 — `src/components/ComicForm.tsx`

### Tag parsing (critical logic)

Test cases:
- `"superhero, action, collected"` → `["superhero", "action", "collected"]` (trimmed)
- `"  hero ,, action "` → `["hero", "action"]` (empty segments filtered)
- `""` (empty tags field) → `[]`

### Form pre-population

Test cases:
- When `comic` prop provided: all form fields pre-filled with existing values
- When no `comic` prop: all fields start empty

### Search behaviour

Test cases:
- `handleSearch()` with empty `searchQuery` → does nothing (no API call)
- `handleSearch()` returns results → form fields auto-filled from `results[0]`; user-entered `author`, `artist`, `grade`, `notes`, `tags` are preserved
- `handleSearch()` returns empty array → `alert('No results found')` called
- `handleSearch()` throws → `alert('Error searching for comic')` called

### File upload

Test cases:
- Selecting a `.cbz` file → `fileToBase64` called; `fileName` state updated

---

## Priority 7 — `src/components/SearchFilter.tsx`

Test cases:
- Search input change → `onFilterChange` called with updated `searchTerm`
- "Filters" button toggles advanced filter panel visibility
- Advanced panel hidden by default
- Clear button visible when `searchTerm` is set; hidden when all filters are empty
- Clear button calls `onFilterChange({ searchTerm: '' })`
- Publisher / series / author `<select>` changes call `onFilterChange` with correct value
- Selecting the empty `""` option sets the field to `undefined` in the filter

---

## Summary of Untested Edge Cases / Latent Bugs

| Location | Issue |
|---|---|
| `comicReader.ts:70` | `base64ToFile()` crashes on malformed base64 (no comma separator) |
| `comicReader.ts:71` | MIME regex can return `null`; optional chain silently uses wrong fallback type |
| `comicAPI.ts:34` | `response.data.results` could be `undefined` if API shape changes |
| `useComics.ts:43` | `updateComic` silently no-ops for unknown IDs — no error surfaced to caller |
| `ComicCard.tsx:81` | `window.confirm` blocks UI thread; not mockable without `vi.spyOn` |
| `ComicForm.tsx:61` | Auto-fill always uses `results[0]` with no way for the user to pick from multiple results |
| `storage.ts:17` | Sort uses `new Date(b.dateAdded)` — invalid date strings produce `NaN`, breaking sort order |

---

## Suggested File Layout

```
src/
  test/
    setup.ts                   # @testing-library/jest-dom import
  utils/
    comicReader.test.ts        # Priority 1
    comicAPI.test.ts           # Priority 2
    storage.test.ts            # Priority 4
  hooks/
    useComics.test.ts          # Priority 3
  components/
    ComicCard.test.tsx         # Priority 5
    ComicForm.test.tsx         # Priority 6
    SearchFilter.test.tsx      # Priority 7
```
