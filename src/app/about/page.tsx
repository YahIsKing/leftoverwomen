import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import sourcesData from '@/data/sources.json';

export default function AboutPage() {
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
              <Link href="/" className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors">
                Calculator
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

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Badge className="mb-4">Documentation</Badge>
        <h1 className="text-4xl font-bold text-foreground mb-8">
          About & Methodology
        </h1>

        {/* Purpose Section */}
        <Card className="mb-8">
          <CardContent className="space-y-4 p-6">
            <h2 className="text-xl font-semibold text-primary">Purpose</h2>
            <p className="text-muted-foreground">
              This calculator provides an interactive way to explore marriage
              demographics within Christian populations in the United States. It
              combines U.S. Census Bureau data on marital status with Pew Research
              Center data on religious demographics to estimate the number of
              unmarried individuals by age, denomination, and religiosity level.
            </p>
            <p className="text-muted-foreground">
              The tool allows users to compare outcomes under different marriage
              structure scenarios, providing an objective, data-driven perspective
              on marriage demographics.
            </p>
          </CardContent>
        </Card>

        {/* Methodology Section */}
        <Card className="mb-8">
          <CardContent className="space-y-6 p-6">
            <h2 className="text-xl font-semibold text-primary">Methodology</h2>

            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Data Combination
              </h3>
              <p className="text-muted-foreground mb-4">
                The calculator combines two primary data sources:
              </p>
              <ol className="list-decimal list-inside text-muted-foreground space-y-2">
                <li>
                  <strong className="text-foreground">Census Bureau Table B12002:</strong> Provides total
                  population counts by sex, age bracket, and marital status (never
                  married, married, divorced, widowed, separated).
                </li>
                <li>
                  <strong className="text-foreground">Pew Religious Landscape Study:</strong> Provides the
                  percentage of each age group that identifies as Christian, broken
                  down by denomination and religiosity level.
                </li>
              </ol>
            </div>

            <hr className="border-border" />

            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Calculation Steps
              </h3>
              <Card className="bg-muted">
                <CardContent className="p-4">
                  <ol className="list-decimal list-inside text-muted-foreground space-y-2 font-mono text-sm">
                    <li>
                      Get unmarried population from Census (never married + divorced +
                      optionally widowed)
                    </li>
                    <li>
                      Apply Christian percentage for age bracket from Pew data
                    </li>
                    <li>
                      Apply denomination filter if selected (% of Christians in that
                      denomination)
                    </li>
                    <li>
                      Apply religiosity filter if selected (% who are devout/practicing/nominal)
                    </li>
                    <li>
                      Calculate surplus = Unmarried Women - Available Unmarried Men
                    </li>
                  </ol>
                </CardContent>
              </Card>
            </div>

            <hr className="border-border" />

            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Age Matching Logic
              </h3>
              <p className="text-muted-foreground mb-4">
                The calculator includes an optional age-range overlap feature to model
                realistic marriage patterns where older men may seek younger women.
                When enabled:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>
                  <strong className="text-foreground">Same bracket only:</strong> Men and women are only matched
                  within their own age bracket
                </li>
                <li>
                  <strong className="text-foreground">+/- 10 years:</strong> Men in a given bracket may match with
                  women one bracket younger
                </li>
                <li>
                  <strong className="text-foreground">+/- 20 years:</strong> Men may match with women up to two
                  brackets younger
                </li>
              </ul>
            </div>

            <hr className="border-border" />

            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Religiosity Definitions
              </h3>
              <p className="text-muted-foreground mb-2">
                Based on Pew Research measures of religious practice:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>
                  <strong className="text-foreground">Nominal:</strong> Identifies as Christian but attends
                  services less than monthly and prays rarely
                </li>
                <li>
                  <strong className="text-foreground">Practicing:</strong> Attends services 1-3 times per month,
                  prays weekly
                </li>
                <li>
                  <strong className="text-foreground">Devout:</strong> Attends weekly or more, prays daily,
                  considers religion "very important"
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Limitations Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-primary mb-4">
              Limitations
            </h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              {sourcesData.methodology.limitations.map((limitation, index) => (
                <li key={index}>{limitation}</li>
              ))}
              <li>
                Age preferences, geographic proximity, and individual circumstances
                are not modeled
              </li>
              <li>
                The calculator assumes within-religious-group marriage, which may
                not reflect actual patterns
              </li>
              <li>
                Cohabitation and non-traditional relationships are not included in
                "married" counts
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Data Sources Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-primary mb-4">
              Data Sources
            </h2>
            <div className="space-y-4">
              {sourcesData.sources.map((source) => (
                <Card key={source.id} className="bg-muted">
                  <CardContent className="p-4">
                    <h3 className="font-medium text-foreground">{source.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{source.description}</p>
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Data year: {source.dataYear}</span>
                      <span>Updated: {source.lastUpdated}</span>
                    </div>
                    <Link
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline mt-2 inline-block"
                    >
                      View source →
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Update Process Section */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-primary mb-4">
              Data Updates
            </h2>
            <p className="text-muted-foreground mb-4">
              This calculator is designed to be easily updated as new data becomes
              available:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>
                <strong className="text-foreground">Census data:</strong> American Community Survey releases new
                1-year estimates annually, typically in September
              </li>
              <li>
                <strong className="text-foreground">Religious data:</strong> Pew Research conducts Religious
                Landscape Studies periodically (most recent: 2023-24)
              </li>
              <li>
                Data files are stored as JSON for easy manual updates or automated
                processing
              </li>
            </ul>
          </CardContent>
        </Card>
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
