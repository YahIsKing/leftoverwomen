import {
  AgeBracket,
  AGE_BRACKETS,
  CensusData,
  ReligiousData,
  CalculatorFilters,
  BracketResult,
  ScenarioResult,
  CalculatorResult,
  Denomination,
  ReligiosityLevel,
  PolygynyDistribution,
  DEFAULT_MONOGAMY,
  calculateWifeCapacity,
} from './types';

/**
 * Get the age brackets that a given bracket can match with based on overlap setting
 * For men, they can match with women in their bracket and younger brackets
 */
function getMatchingBrackets(
  bracket: AgeBracket,
  ageOverlap: number
): AgeBracket[] {
  const bracketIndex = AGE_BRACKETS.indexOf(bracket);
  const matchingBrackets: AgeBracket[] = [bracket];

  // Calculate how many brackets to include based on overlap years
  // Each bracket spans roughly 10 years, so 10 years = 1 bracket
  const bracketsToInclude = Math.floor(ageOverlap / 10);

  // Men can match with women in younger brackets (standard pattern)
  for (let i = 1; i <= bracketsToInclude; i++) {
    const youngerIndex = bracketIndex - i;
    if (youngerIndex >= 0) {
      matchingBrackets.push(AGE_BRACKETS[youngerIndex]);
    }
  }

  return matchingBrackets;
}

/**
 * Calculate the Christian percentage to apply based on filters and gender
 * Uses gender-specific Christian percentages for more accurate calculations
 */
function getChristianMultiplier(
  bracket: AgeBracket,
  gender: 'male' | 'female',
  denomination: Denomination,
  religiosity: ReligiosityLevel,
  religiousData: ReligiousData
): number {
  // Find the age bracket data
  const ageData = religiousData.byAge.find((a) => a.range === bracket);
  if (!ageData) return 0;

  // Use gender-specific Christian percentage for this age
  // Falls back to overall percentage if gender-specific not available
  const christianPercent = gender === 'male'
    ? (ageData.christianPercentMale ?? ageData.christianPercent)
    : (ageData.christianPercentFemale ?? ageData.christianPercent);

  let multiplier = christianPercent / 100;

  // Apply denomination filter if not 'all'
  if (denomination !== 'all') {
    const denomData = religiousData.byDenomination.find(
      (d) => d.id === denomination
    );
    if (denomData) {
      // Use percentage of Christians who belong to this denomination
      multiplier *= denomData.percentOfChristians / 100;

      // Apply denomination-specific gender ratio if available
      // This adjusts for denominations with different gender compositions
      if (denomData.genderRatio && denomData.genderRatio.menPer100Women) {
        const ratio = denomData.genderRatio.menPer100Women;
        // Convert ratio to gender-specific multiplier
        // If 85 men per 100 women: men = 85/185 = 46%, women = 100/185 = 54%
        if (gender === 'male') {
          multiplier *= (ratio / (ratio + 100)) / 0.5; // Normalize to 50% baseline
        } else {
          multiplier *= (100 / (ratio + 100)) / 0.5;
        }
      }
    }
  }

  // Apply religiosity filter if not 'all'
  if (religiosity !== 'all') {
    let religiosityPercent: number;
    switch (religiosity) {
      case 'devout':
        religiosityPercent = ageData.devoutPercent;
        break;
      case 'practicing':
        religiosityPercent = ageData.practicingPercent;
        break;
      case 'nominal':
        religiosityPercent = ageData.nominalPercent;
        break;
      default:
        religiosityPercent = 100;
    }
    multiplier *= religiosityPercent / 100;
  }

  return multiplier;
}

/**
 * Calculate unmarried population for a bracket
 * Note: Census data is stored in thousands, so we multiply by 1000
 */
function getUnmarriedCount(
  bracket: AgeBracket,
  gender: 'male' | 'female',
  includeWidows: boolean,
  includeDivorced: boolean,
  censusData: CensusData
): { total: number; widows: number; divorced: number } {
  const bracketData = censusData.ageBrackets.find((b) => b.range === bracket);
  if (!bracketData) return { total: 0, widows: 0, divorced: 0 };

  const data = bracketData[gender];
  // Census data is in thousands - multiply by 1000 to get actual count
  const multiplier = 1000;

  // Always include never married and separated
  let total = (data.neverMarried + data.separated) * multiplier;
  const widows = data.widowed * multiplier;
  const divorced = data.divorced * multiplier;

  if (includeDivorced) {
    total += divorced;
  }

  if (includeWidows) {
    total += widows;
  }

  return {
    total,
    widows: includeWidows ? widows : 0,
    divorced: includeDivorced ? divorced : 0,
  };
}

/**
 * Calculate results for a single age bracket under monogamy
 */
function calculateBracketResult(
  bracket: AgeBracket,
  filters: CalculatorFilters,
  censusData: CensusData,
  religiousData: ReligiousData
): BracketResult {
  const { denomination, religiosity, includeWidows, includeDivorced, ageOverlap } = filters;

  // Get unmarried women in this bracket
  const womenData = getUnmarriedCount(bracket, 'female', includeWidows, includeDivorced, censusData);
  const womenMultiplier = getChristianMultiplier(
    bracket,
    'female',
    denomination,
    religiosity,
    religiousData
  );
  const unmarriedWomen = Math.round(womenData.total * womenMultiplier);
  const widows = Math.round(womenData.widows * womenMultiplier);

  // Get unmarried men who can match with women in this bracket
  // Men can match with women their age or younger
  const matchingBrackets = getMatchingBrackets(bracket, ageOverlap);

  // For each bracket that can match with this one, get the men
  // But we need to think about this differently:
  // We want men who would be looking at women in THIS bracket
  // That means men in this bracket + older brackets (within overlap)

  const bracketIndex = AGE_BRACKETS.indexOf(bracket);
  let totalAvailableMen = 0;

  // Men in current bracket looking at women in same bracket
  const currentMenData = getUnmarriedCount(bracket, 'male', false, includeDivorced, censusData);
  const currentMenMultiplier = getChristianMultiplier(
    bracket,
    'male',
    denomination,
    religiosity,
    religiousData
  );
  const currentBracketMen = Math.round(currentMenData.total * currentMenMultiplier);
  totalAvailableMen += currentBracketMen;

  // Older men looking at younger women (within overlap)
  const bracketsToInclude = Math.floor(ageOverlap / 10);
  for (let i = 1; i <= bracketsToInclude; i++) {
    const olderIndex = bracketIndex + i;
    if (olderIndex < AGE_BRACKETS.length) {
      const olderBracket = AGE_BRACKETS[olderIndex];
      const olderMenData = getUnmarriedCount(olderBracket, 'male', false, includeDivorced, censusData);
      const olderMenMultiplier = getChristianMultiplier(
        olderBracket,
        'male',
        denomination,
        religiosity,
        religiousData
      );
      // Only a portion of older men will be looking at younger women
      // Assume roughly 50% look at younger bracket
      const olderMen = Math.round(olderMenData.total * olderMenMultiplier * 0.5);
      totalAvailableMen += olderMen;
    }
  }

  // Also need to subtract men from current bracket who are looking at younger women
  if (bracketsToInclude > 0 && bracketIndex > 0) {
    // Some men in this bracket are looking at younger women, not available here
    totalAvailableMen -= Math.round(currentBracketMen * 0.5);
  }

  const surplus = Math.max(0, unmarriedWomen - totalAvailableMen);
  const surplusPercent = unmarriedWomen > 0 ? (surplus / unmarriedWomen) * 100 : 0;

  return {
    ageBracket: bracket,
    unmarriedMen: currentBracketMen,
    unmarriedWomen,
    widows,
    availableMen: Math.max(0, totalAvailableMen),
    surplus,
    surplusPercent,
  };
}

/**
 * Calculate scenario results under polygyny with distribution
 */
function calculatePolygamyScenario(
  monogamyResults: BracketResult[],
  distribution: PolygynyDistribution
): BracketResult[] {
  // Calculate the wife capacity multiplier
  // Under monogamy, capacity = 1.0 (each man can marry 1 woman)
  // Under polygyny, capacity increases based on distribution
  const capacityMultiplier = calculateWifeCapacity(distribution);

  return monogamyResults.map((result) => {
    // New capacity = original men * multiplier
    const newAvailableMen = Math.round(result.availableMen * capacityMultiplier);
    const newSurplus = Math.max(0, result.unmarriedWomen - newAvailableMen);
    const newSurplusPercent =
      result.unmarriedWomen > 0 ? (newSurplus / result.unmarriedWomen) * 100 : 0;

    return {
      ...result,
      availableMen: newAvailableMen,
      surplus: newSurplus,
      surplusPercent: newSurplusPercent,
    };
  });
}

/**
 * Aggregate bracket results into scenario summary
 */
function aggregateResults(
  brackets: BracketResult[],
  name: string,
  description: string
): ScenarioResult {
  const totalUnmarriedWomen = brackets.reduce(
    (sum, b) => sum + b.unmarriedWomen,
    0
  );
  const totalUnmarriedMen = brackets.reduce((sum, b) => sum + b.unmarriedMen, 0);
  const totalWidows = brackets.reduce((sum, b) => sum + b.widows, 0);
  const totalSurplus = brackets.reduce((sum, b) => sum + b.surplus, 0);
  const surplusPercent =
    totalUnmarriedWomen > 0 ? (totalSurplus / totalUnmarriedWomen) * 100 : 0;

  return {
    name,
    description,
    totalUnmarriedWomen,
    totalUnmarriedMen,
    totalWidows,
    totalSurplus,
    surplusPercent,
    byBracket: brackets,
  };
}

/**
 * Check if distribution differs from monogamy
 */
function isPolygynous(distribution: PolygynyDistribution): boolean {
  return (
    distribution.twoWives > 0 ||
    distribution.threeWives > 0 ||
    distribution.fourPlusWives > 0
  );
}

/**
 * Generate description for polygyny distribution
 */
function getPolygynyDescription(dist: PolygynyDistribution): string {
  const parts: string[] = [];
  if (dist.twoWives > 0) parts.push(`${dist.twoWives}% with 2 wives`);
  if (dist.threeWives > 0) parts.push(`${dist.threeWives}% with 3 wives`);
  if (dist.fourPlusWives > 0) parts.push(`${dist.fourPlusWives}% with 4+ wives`);
  return parts.length > 0 ? parts.join(', ') : 'Pure monogamy';
}

/**
 * Main calculation function
 */
export function calculateResults(
  filters: CalculatorFilters,
  censusData: CensusData,
  religiousData: ReligiousData,
  polygynyDistribution?: PolygynyDistribution
): CalculatorResult {
  // Use selected age brackets (empty array = no results)
  const selectedBrackets = filters.ageBrackets;

  // Calculate monogamy results for each bracket
  const monogamyBrackets = selectedBrackets.map((bracket) =>
    calculateBracketResult(bracket, filters, censusData, religiousData)
  );

  const monogamy = aggregateResults(
    monogamyBrackets,
    'Monogamy',
    'Current legal standard: one man, one woman'
  );

  let alternative: ScenarioResult | undefined;

  const dist = polygynyDistribution || DEFAULT_MONOGAMY;
  if (isPolygynous(dist)) {
    const polygamyBrackets = calculatePolygamyScenario(monogamyBrackets, dist);
    const capacity = calculateWifeCapacity(dist);
    alternative = aggregateResults(
      polygamyBrackets,
      `Polygyny (${capacity.toFixed(2)}x capacity)`,
      `Hypothetical: ${getPolygynyDescription(dist)}`
    );
  }

  return {
    filters,
    monogamy,
    alternative,
    polygynyDistribution: dist,
  };
}

/**
 * Format large numbers for display
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(0) + 'K';
  }
  return num.toLocaleString();
}

/**
 * Format percentage for display
 */
export function formatPercent(num: number): string {
  return num.toFixed(1) + '%';
}
