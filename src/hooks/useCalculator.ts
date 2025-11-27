'use client';

import { useState, useMemo } from 'react';
import {
  AgeBracket,
  AGE_BRACKETS,
  Denomination,
  ReligiosityLevel,
  CalculatorFilters,
  CalculatorResult,
  CensusData,
  ReligiousData,
  PolygynyDistribution,
  DEFAULT_MONOGAMY,
} from '@/lib/types';
import { calculateResults } from '@/lib/calculations';

interface UseCalculatorOptions {
  censusData: CensusData;
  religiousData: ReligiousData;
}

export function useCalculator({ censusData, religiousData }: UseCalculatorOptions) {
  // Filter state - default to all age brackets selected
  const [ageBrackets, setAgeBrackets] = useState<AgeBracket[]>([...AGE_BRACKETS]);
  const [denomination, setDenomination] = useState<Denomination>('all');
  const [religiosity, setReligiosity] = useState<ReligiosityLevel>('all');
  const [includeWidows, setIncludeWidows] = useState(true);
  const [includeDivorced, setIncludeDivorced] = useState(true);
  const [ageOverlap, setAgeOverlap] = useState(0);
  const [polygynyDistribution, setPolygynyDistribution] = useState<PolygynyDistribution>(DEFAULT_MONOGAMY);

  // Build filters object
  const filters: CalculatorFilters = useMemo(
    () => ({
      ageBrackets,
      denomination,
      religiosity,
      includeWidows,
      includeDivorced,
      ageOverlap,
    }),
    [ageBrackets, denomination, religiosity, includeWidows, includeDivorced, ageOverlap]
  );

  // Calculate results
  const result: CalculatorResult = useMemo(
    () =>
      calculateResults(
        filters,
        censusData,
        religiousData,
        polygynyDistribution
      ),
    [filters, censusData, religiousData, polygynyDistribution]
  );

  return {
    // Filter values
    ageBrackets,
    denomination,
    religiosity,
    includeWidows,
    includeDivorced,
    ageOverlap,
    polygynyDistribution,

    // Filter setters
    setAgeBrackets,
    setDenomination,
    setReligiosity,
    setIncludeWidows,
    setIncludeDivorced,
    setAgeOverlap,
    setPolygynyDistribution,

    // Results
    filters,
    result,
  };
}
