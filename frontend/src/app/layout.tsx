import type { Metadata } from 'next';
import { DM_Sans, DM_Mono, Space_Grotesk } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

// Space Grotesk - Primary headings (geometric grotesque, similar to Geom/Tomato Grotesk)
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-geom',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

// DM Sans - Body text
const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

// DM Mono - Monospace (Mono Sans)
const dmMono = DM_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-mono-sans',
  display: 'swap',
});

// Get the app URL with proper fallback
const getMetadataBase = () => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl && appUrl.startsWith('http')) {
    return new URL(appUrl);
  }
  return new URL('https://forms.ecx.com.ng');
};

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: 'ECX Forms',
    template: '%s | ECX Forms',
  },
  description: 'Create and share beautiful forms with ECX Forms - Engineering Career Expo',
  keywords: ['forms', 'surveys', 'ECX', 'Engineering Career Expo', 'UNILAG'],
  authors: [{ name: 'Teslim Sadiq' }],
  openGraph: {
    title: 'ECX Forms',
    description: 'Create and share beautiful forms with ECX Forms',
    siteName: 'ECX Forms',
    locale: 'en_US',
    type: 'website',
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
      className={`
        ${spaceGrotesk.variable}
        ${dmSans.variable} 
        ${dmMono.variable}
      `}
    >
      <head>
        {/* Geom font from Google Fonts - loaded via link tag */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Geom:wght@400;500;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="font-body antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
