// Age bracket definitions
export type AgeBracket = '18-24' | '25-34' | '35-44' | '45-54' | '55-64' | '65-74' | '75+';

export const AGE_BRACKETS: AgeBracket[] = ['18-24', '25-34', '35-44', '45-54', '55-64', '65-74', '75+'];

// Religiosity levels
export type ReligiosityLevel = 'all' | 'nominal' | 'practicing' | 'devout';

// Denomination types
export type Denomination =
  | 'all'
  | 'evangelical'
  | 'catholic'
  | 'mainline'
  | 'blackProtestant'
  | 'orthodox'
  | 'other';

export const DENOMINATIONS: { value: Denomination; label: string }[] = [
  { value: 'all', label: 'All Christians' },
  { value: 'evangelical', label: 'Evangelical Protestant' },
  { value: 'catholic', label: 'Catholic' },
  { value: 'mainline', label: 'Mainline Protestant' },
  { value: 'blackProtestant', label: 'Historically Black Protestant' },
  { value: 'orthodox', label: 'Orthodox' },
  { value: 'other', label: 'Other Christian' },
];

// Census data structure
export interface MaritalStatusByGender {
  total: number;
  neverMarried: number;
  married: number;
  divorced: number;
  widowed: number;
  separated: number;
}

export interface AgeBracketData {
  range: AgeBracket;
  male: MaritalStatusByGender;
  female: MaritalStatusByGender;
}

export interface CensusData {
  year: number;
  source: string;
  sourceUrl: string;
  lastUpdated: string;
  ageBrackets: AgeBracketData[];
}

// Religious demographics data structure
export interface AgeReligiosity {
  range: AgeBracket;
  christianPercent: number;
  christianPercentMale: number;   // Gender-specific Christian % for men
  christianPercentFemale: number; // Gender-specific Christian % for women
  devoutPercent: number;    // Percentage of Christians who are devout
  practicingPercent: number; // Percentage of Christians who are practicing
  nominalPercent: number;    // Percentage of Christians who are nominal
  attendMonthlyPercent?: number;  // % who attend services monthly
  prayDailyPercent?: number;      // % who pray daily
}

export interface DenominationGenderRatio {
  menPer100Women: number;
  source: string;
  selfIdentified?: number;
  actualAttendees?: number;
}

export interface DenominationData {
  id: Denomination;
  name: string;
  percentOfPopulation: number;
  percentOfChristians: number;
  genderRatio?: DenominationGenderRatio;
  marriageRate: number;
}

export interface ReligiousData {
  year: string;
  source: string;
  sourceUrl: string;
  lastUpdated: string;
  overallChristianPercent: number;
  byAge: AgeReligiosity[];
  byDenomination: DenominationData[];
}

// Calculator state and results
export interface CalculatorFilters {
  ageBrackets: AgeBracket[];
  denomination: Denomination;
  religiosity: ReligiosityLevel;
  includeWidows: boolean;
  includeDivorced: boolean;
  ageOverlap: number; // Years of overlap (0, 5, 10)
}

export interface BracketResult {
  ageBracket: AgeBracket;
  unmarriedMen: number;
  unmarriedWomen: number;
  widows: number;
  availableMen: number; // Men in matching age range
  surplus: number; // Women - Available Men
  surplusPercent: number;
}

export interface ScenarioResult {
  name: string;
  description: string;
  totalUnmarriedWomen: number;
  totalUnmarriedMen: number;
  totalWidows: number;
  totalSurplus: number;
  surplusPercent: number;
  byBracket: BracketResult[];
}

// Polygyny distribution - percentage of men taking each number of wives
export interface PolygynyDistribution {
  oneWife: number;    // % of men with 1 wife (monogamy)
  twoWives: number;   // % of men with 2 wives
  threeWives: number; // % of men with 3 wives
  fourPlusWives: number; // % of men with 4+ wives
}

export const DEFAULT_MONOGAMY: PolygynyDistribution = {
  oneWife: 100,
  twoWives: 0,
  threeWives: 0,
  fourPlusWives: 0,
};

// Calculate effective "wife slots" per 100 men
export function calculateWifeCapacity(dist: PolygynyDistribution): number {
  // Average wives per man with 4+ is assumed to be 4.5
  const avgFourPlus = 4.5;
  return (
    (dist.oneWife * 1 +
      dist.twoWives * 2 +
      dist.threeWives * 3 +
      dist.fourPlusWives * avgFourPlus) /
    100
  );
}

export interface CalculatorResult {
  filters: CalculatorFilters;
  monogamy: ScenarioResult;
  alternative?: ScenarioResult;
  polygynyDistribution?: PolygynyDistribution;
}

// Data source metadata
export interface DataSource {
  id: string;
  name: string;
  url: string;
  description: string;
  lastUpdated: string;
  dataYear: string;
}
