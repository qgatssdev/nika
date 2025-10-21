import { Metadata, Viewport } from 'next';

const baseUrl = process.env.CLIENT_URL;

type MetadataProps = {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  canonical?: string;
  openGraph?: {
    title?: string;
    description?: string;
    images?: string | string[];
    url?: string;
    siteName?: string;
    locale?: string;
    type?: string;
  };
  twitter?: {
    card?: 'summary' | 'summary_large_image' | 'app' | 'player';
    title?: string;
    description?: string;
    image?: string;
    site?: string;
    creator?: string;
  };
};

const baseMetadata: Metadata = {
  title: {
    template: '%s ',
    default: 'Nika',
  } as { template: string; default: string },
  description:
    'Nika unifies your portfolio across every chain with rebalancing, AI guidance, and built-in risk management. Trade smarter with real-time PnL, auto-compounding, and total self-custody. No seed phrases. No endless tabs. No stress.',
  icons: {
    icon: [
      { url: `${baseUrl}/favicon.ico` },
      {
        url: `${baseUrl}/favicon-16x16.png`,
        sizes: '16x16',
        type: 'image/png',
      },
      {
        url: `${baseUrl}/favicon-32x32.png`,
        sizes: '32x32',
        type: 'image/png',
      },
    ],
    apple: [{ url: `${baseUrl}/apple-touch-icon.png`, type: 'image/png' }],
    other: [
      {
        rel: 'android-chrome-192x192',
        url: `${baseUrl}/android-chrome-192x192.png`,
        sizes: '192x192',
        type: 'image/png',
      },
      {
        rel: 'android-chrome-512x512',
        url: `${baseUrl}/android-chrome-512x512.png`,
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  },
  openGraph: {
    type: 'website',
    siteName: 'Nika',
    title: 'Nika',
    images: [
      {
        url: `${baseUrl}/thumbnail.png`,
        width: 512,
        height: 512,
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nika - DeFi your way.',
    description:
      'Nika unifies your portfolio across every chain with rebalancing, AI guidance, and built-in risk management. Trade smarter with real-time PnL, auto-compounding, and total self-custody. No seed phrases. No endless tabs. No stress.',
    images: [`${baseUrl}/thumbnail.png`],
  },
};

export const viewport: Viewport = {
  themeColor: '#6aa7ff',
};

export function generateMetadata(props?: MetadataProps): Metadata {
  return {
    ...baseMetadata,
    title: props?.title || baseMetadata.title,
    description: props?.description || baseMetadata.description,
    keywords: props?.keywords,

    // Canonical URL
    alternates: props?.canonical
      ? {
          canonical: props.canonical,
        }
      : undefined,

    // OpenGraph
    openGraph: {
      ...baseMetadata.openGraph,
      ...(props?.openGraph || {}),
      title:
        props?.openGraph?.title ||
        props?.title ||
        (baseMetadata.title as { default: string }).default,
      description:
        props?.openGraph?.description ??
        props?.description ??
        baseMetadata.description ??
        undefined,
      images: props?.openGraph?.images || props?.image || undefined,
    },

    // Twitter
    twitter: {
      ...baseMetadata.twitter,
      ...(props?.twitter || {}),
      title:
        props?.twitter?.title ||
        props?.title ||
        (baseMetadata.title as { default: string }).default,
      description:
        props?.twitter?.description ??
        props?.description ??
        baseMetadata.description ??
        undefined,
      images: props?.twitter?.image || props?.image || undefined,
    },
  };
}
