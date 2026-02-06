# Comic Catalog

A local-only comic book collection manager that runs on Web (PWA), Mobile (iOS/Android), and Desktop.

**No backend. No login. No cloud sync.** Your data stays on your device.

## Architecture

```
comic-catalog/
├── apps/
│   ├── web/         # Next.js 14 PWA (IndexedDB via Dexie)
│   ├── mobile/      # Expo React Native (SQLite via expo-sqlite)
│   └── desktop/     # Tauri v2 wrapper for the web build
├── packages/
│   ├── core/        # Zod schemas, types, repository interface
│   ├── ui/          # Shared React context (RepositoryContext)
│   ├── repo/        # Platform-specific repository implementations
│   └── utils/       # ZIP import/export utilities
├── turbo.json
└── pnpm-workspace.yaml
```

## Features

- **Library**: Grid/list view, search, filters (series, publisher, tags, location, missing cover/barcode)
- **Add/Edit Comic**: Full form with series, issue, variant, publisher, date, creators, condition, price, location, notes, tags, barcode
- **Barcode Scanning** (mobile): Scan UPC/EAN via camera with haptic feedback, auto-lookup
- **Cover Images**: Upload/capture on all platforms, stored locally
- **Import/Export**: ZIP backup containing data.json + images folder
- **Installable PWA**: Works offline after first load

## Data Storage

| Platform | Storage |
|----------|---------|
| Web PWA  | IndexedDB (Dexie) |
| Mobile   | SQLite (expo-sqlite) |
| Desktop  | IndexedDB (via web build in Tauri) |

## Prerequisites

- Node.js 18+
- pnpm 9+
- For mobile: Expo CLI, iOS Simulator / Android Emulator
- For desktop: Rust toolchain, Tauri CLI

## Getting Started

```bash
# Install dependencies
pnpm install

# Run web app
pnpm dev:web

# Run mobile app
pnpm dev:mobile

# Run desktop app (requires Rust + Tauri CLI)
pnpm dev:desktop
```

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev:web` | Start Next.js dev server on port 3000 |
| `pnpm dev:mobile` | Start Expo dev server |
| `pnpm dev:desktop` | Start Tauri desktop app |
| `pnpm build` | Build all packages |
| `pnpm build:web` | Build web app for production |
| `pnpm lint` | Run linting across all packages |
| `pnpm typecheck` | Run TypeScript type checking |

## Data Model

### Items
Core comic book record with: series, issueNumber, variant, publisher, releaseDate, writers, artists, condition, purchasePrice, location, notes, barcode, coverImageId.

### Tags
Simple name-based tags with many-to-many relationship to items.

### Images
Cover images stored platform-specifically (IndexedDB blobs for web, filesystem for mobile/desktop).

## Import/Export Format

Exports a ZIP file containing:
```
backup.zip
├── data.json          # Items, tags, item_tags, images metadata
└── images/
    ├── <imageId>.jpg
    └── <imageId>.png
```

## Platform Notes

- **Web PWA**: Installable via browser. Service worker caches app shell for offline use. Data persists in IndexedDB.
- **Mobile**: Uses expo-camera for barcode scanning and expo-image-picker for cover photos. SQLite database stored in app documents directory.
- **Desktop**: Tauri wraps the web build. Uses the same IndexedDB storage as the web version.

## License

Private project.
