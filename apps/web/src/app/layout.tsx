import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Nav } from './nav';
import { ServiceWorkerRegister } from './components/sw-register';

export const metadata: Metadata = {
  title: 'Comic Catalog',
  description: 'Your personal comic book collection manager',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Comic Catalog',
  },
};

export const viewport: Viewport = {
  themeColor: '#4c6ef5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>
        <ServiceWorkerRegister />
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Nav />
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
