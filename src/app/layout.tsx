import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Leftover Women Calculator | Biblical Marriages',
  description: 'See how many Christian women are left without marriage opportunities under monogamy.',
  keywords: ['marriage', 'demographics', 'Christian', 'census', 'statistics', 'polygyny', 'biblical'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
