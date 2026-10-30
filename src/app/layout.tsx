import type { Metadata, Viewport } from 'next';
import { Outfit, Plus_Jakarta_Sans, Figtree, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { LayoutShell } from '@/components/layout/LayoutShell';
import { PerformanceMode } from '@/components/layout/PerformanceMode';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-outfit',
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const figtree = Figtree({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-figtree',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#06070b',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://pixelverse.local'),
  title: {
    default: 'Pixelverse: Play Free Online Games',
    template: '%s | Pixelverse',
  },
  description: 'Play thousands of free online games instantly. No downloads, no login required. Discover high-performance HTML5, WebGL, and retro arcade titles.',
  manifest: '/manifest.json',
  keywords: ['online games', 'free games', 'browser games', 'instant play', 'html5 games', 'poki alternative', 'arcade'],
  authors: [{ name: 'Deepayan', url: 'https://github.com/deepayanpaik2' }],
  creator: 'Deepayan',
  publisher: 'Deepayan',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://pixelverse.local',
    siteName: 'Pixelverse',
    title: 'Pixelverse: Play Free Online Games',
    description: 'Instant-play browser games with zero downloads. Silky smooth 60 FPS Canvas and WebGL games.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pixelverse: Play Free Online Games',
    description: 'Play free online games instantly on any device. Zero downloads, no account needed.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${outfit.variable} ${plusJakartaSans.variable} ${figtree.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://img.gamepix.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://play.gamepix.com" />
      </head>
      <body className="antialiased font-sans">
        <PerformanceMode />
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
