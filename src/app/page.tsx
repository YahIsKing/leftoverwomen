import Calculator from '@/components/Calculator';
import censusData from '@/data/census-marital.json';
import religiousData from '@/data/religious-demographics.json';
import { CensusData, ReligiousData } from '@/lib/types';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="https://biblemarriages.org"
              className="text-xl font-bold text-foreground hover:text-primary transition-colors"
            >
              Biblical Marriages
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/about" className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors">
                Methodology
              </Link>
              <Link
                href="https://biblemarriages.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
              >
                Main Site
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Calculator
          censusData={censusData as CensusData}
          religiousData={religiousData as ReligiousData}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Data: US Census Bureau (2023), Pew Research Center (2024)
            </p>
            <p className="text-sm text-muted-foreground">
              Part of{' '}
              <Link
                href="https://biblemarriages.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Biblical Marriages
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
