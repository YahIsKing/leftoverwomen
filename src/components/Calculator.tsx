'use client';

import { useState } from 'react';
import { CensusData, ReligiousData } from '@/lib/types';
import { useCalculator } from '@/hooks/useCalculator';
import { formatNumber } from '@/lib/calculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { DENOMINATIONS, AGE_BRACKETS, AgeBracket } from '@/lib/types';
import SurplusChart from './SurplusChart';

interface CalculatorProps {
  censusData: CensusData;
  religiousData: ReligiousData;
}

const RELIGIOSITY_OPTIONS = [
  { key: 'all', label: 'All Christians' },
  { key: 'nominal', label: 'Nominal' },
  { key: 'practicing', label: 'Practicing' },
  { key: 'devout', label: 'Devout' },
];

export default function Calculator({
  censusData,
  religiousData,
}: CalculatorProps) {
  const [showPolygyny, setShowPolygyny] = useState(false);

  const {
    ageBrackets,
    denomination,
    religiosity,
    includeWidows,
    includeDivorced,
    ageOverlap,
    polygynyDistribution,
    setAgeBrackets,
    setDenomination,
    setReligiosity,
    setIncludeWidows,
    setIncludeDivorced,
    setAgeOverlap,
    setPolygynyDistribution,
    result,
  } = useCalculator({ censusData, religiousData });

  const { monogamy, alternative } = result;
  const isPolygynous = polygynyDistribution.twoWives > 0 ||
    polygynyDistribution.threeWives > 0 ||
    polygynyDistribution.fourPlusWives > 0;

  const surplusReduction = alternative
    ? monogamy.totalSurplus - alternative.totalSurplus
    : 0;

  const toggleAgeBracket = (bracket: AgeBracket) => {
    if (ageBrackets.includes(bracket)) {
      setAgeBrackets(ageBrackets.filter((b) => b !== bracket));
    } else {
      setAgeBrackets([...ageBrackets, bracket]);
    }
  };

  const handlePolygynyChange = (field: string, value: number) => {
    const updated = { ...polygynyDistribution, [field]: value };
    const multipleWives = updated.twoWives + updated.threeWives + updated.fourPlusWives;
    updated.oneWife = Math.max(0, 100 - multipleWives);
    setPolygynyDistribution(updated);
  };

  const maxForField = (field: string): number => {
    const othersTotal =
      (field !== 'twoWives' ? polygynyDistribution.twoWives : 0) +
      (field !== 'threeWives' ? polygynyDistribution.threeWives : 0) +
      (field !== 'fourPlusWives' ? polygynyDistribution.fourPlusWives : 0);
    return 100 - othersTotal;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Compact Hero */}
      <div className="text-center mb-8">
        <p className="text-muted-foreground mb-2">Under strict monogamy</p>
        <div className="text-5xl md:text-7xl font-extrabold gradient-text mb-2">
          {formatNumber(monogamy.totalSurplus)}
        </div>
        <h1 className="text-lg md:text-xl font-medium text-foreground">
          Christian women without marriage prospects
        </h1>
      </div>

      {/* Main Dashboard */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Panel - Controls */}
        <div className="lg:col-span-4 space-y-4">
          {/* Key Stats Card */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-2xl font-bold">{formatNumber(monogamy.totalUnmarriedWomen)}</p>
                  <p className="text-xs text-muted-foreground">Women</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatNumber(monogamy.totalUnmarriedMen)}</p>
                  <p className="text-xs text-muted-foreground">Men</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{monogamy.surplusPercent.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Surplus</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Demographics */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Demographics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Denomination</label>
                <Select value={denomination} onValueChange={(v) => setDenomination(v as typeof denomination)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DENOMINATIONS.map((d) => (
                      <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Religiosity</label>
                <Select value={religiosity} onValueChange={(v) => setReligiosity(v as typeof religiosity)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RELIGIOSITY_OPTIONS.map((r) => (
                      <SelectItem key={r.key} value={r.key}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Population Filters */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Population</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Include Divorced</span>
                <Switch checked={includeDivorced} onCheckedChange={setIncludeDivorced} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Include Widowed</span>
                <Switch checked={includeWidows} onCheckedChange={setIncludeWidows} />
              </div>
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Age Brackets</span>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => setAgeBrackets([...AGE_BRACKETS])}>
                      All
                    </Button>
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => setAgeBrackets([])}>
                      None
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {AGE_BRACKETS.map((bracket) => (
                    <Badge
                      key={bracket}
                      variant={ageBrackets.length === 0 || ageBrackets.includes(bracket) ? "default" : "outline"}
                      className="cursor-pointer text-xs px-2 py-0.5"
                      onClick={() => toggleAgeBracket(bracket)}
                    >
                      {bracket}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Age Matching */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Age Matching</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-2">
                <span className="text-xs text-muted-foreground">Range</span>
                <span className="text-xs font-medium">
                  {ageOverlap === 0 ? 'Same age only' : `±${ageOverlap} years`}
                </span>
              </div>
              <Slider
                value={[ageOverlap]}
                onValueChange={(v) => setAgeOverlap(v[0])}
                min={0}
                max={20}
                step={10}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Older men seeking younger women
              </p>
            </CardContent>
          </Card>

          {/* Polygyny Scenario */}
          <Card className={showPolygyny ? "border-primary/50" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Polygyny Scenario</CardTitle>
                <Switch checked={showPolygyny} onCheckedChange={setShowPolygyny} />
              </div>
            </CardHeader>
            {showPolygyny && (
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">% of men with multiple wives</p>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>2 wives</span>
                      <span className="font-medium">{polygynyDistribution.twoWives}%</span>
                    </div>
                    <Slider
                      value={[polygynyDistribution.twoWives]}
                      onValueChange={(v) => handlePolygynyChange('twoWives', v[0])}
                      max={maxForField('twoWives')}
                      min={0}
                      step={1}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>3 wives</span>
                      <span className="font-medium">{polygynyDistribution.threeWives}%</span>
                    </div>
                    <Slider
                      value={[polygynyDistribution.threeWives]}
                      onValueChange={(v) => handlePolygynyChange('threeWives', v[0])}
                      max={maxForField('threeWives')}
                      min={0}
                      step={1}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>4+ wives</span>
                      <span className="font-medium">{polygynyDistribution.fourPlusWives}%</span>
                    </div>
                    <Slider
                      value={[polygynyDistribution.fourPlusWives]}
                      onValueChange={(v) => handlePolygynyChange('fourPlusWives', v[0])}
                      max={maxForField('fourPlusWives')}
                      min={0}
                      step={1}
                    />
                  </div>
                </div>

                {/* Compact distribution bar */}
                <div className="h-2 rounded-full overflow-hidden flex bg-muted">
                  <div className="bg-primary" style={{ width: `${polygynyDistribution.oneWife}%` }} />
                  <div className="bg-secondary" style={{ width: `${polygynyDistribution.twoWives}%` }} />
                  <div className="bg-warning" style={{ width: `${polygynyDistribution.threeWives}%` }} />
                  <div className="bg-destructive" style={{ width: `${polygynyDistribution.fourPlusWives}%` }} />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  {polygynyDistribution.oneWife}% monogamous
                </p>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Right Panel - Results */}
        <div className="lg:col-span-8 space-y-4">
          {/* Polygyny Impact Banner */}
          {showPolygyny && isPolygynous && alternative && (
            <Card className="bg-gradient-to-r from-primary/10 to-success/10 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">With polygyny, surplus reduces to</p>
                    <p className="text-3xl font-bold text-primary">{formatNumber(alternative.totalSurplus)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Women helped</p>
                    <p className="text-3xl font-bold text-success">+{formatNumber(surplusReduction)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Reduction</p>
                    <p className="text-3xl font-bold">{((surplusReduction / monogamy.totalSurplus) * 100).toFixed(0)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Surplus by Age Bracket</CardTitle>
            </CardHeader>
            <CardContent>
              <SurplusChart
                data={monogamy.byBracket}
                showComparison={showPolygyny && isPolygynous ? alternative?.byBracket : undefined}
                comparisonLabel="With Polygyny"
              />
            </CardContent>
          </Card>

          {/* Detailed Breakdown */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Detailed Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 font-medium">Age</th>
                      <th className="text-right py-2 font-medium">Women</th>
                      <th className="text-right py-2 font-medium">Men</th>
                      <th className="text-right py-2 font-medium">Surplus</th>
                      {showPolygyny && isPolygynous && (
                        <th className="text-right py-2 font-medium text-primary">w/ Polygyny</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {monogamy.byBracket.map((bracket, idx) => (
                      <tr key={bracket.ageBracket} className="border-b border-border/50">
                        <td className="py-2 text-muted-foreground">{bracket.ageBracket}</td>
                        <td className="text-right py-2">{formatNumber(bracket.unmarriedWomen)}</td>
                        <td className="text-right py-2">{formatNumber(bracket.availableMen)}</td>
                        <td className="text-right py-2 font-medium text-warning">
                          {formatNumber(bracket.surplus)}
                        </td>
                        {showPolygyny && isPolygynous && alternative && (
                          <td className="text-right py-2 font-medium text-primary">
                            {formatNumber(alternative.byBracket[idx]?.surplus || 0)}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-semibold">
                      <td className="py-2">Total</td>
                      <td className="text-right py-2">{formatNumber(monogamy.totalUnmarriedWomen)}</td>
                      <td className="text-right py-2">{formatNumber(monogamy.totalUnmarriedMen)}</td>
                      <td className="text-right py-2 text-warning">{formatNumber(monogamy.totalSurplus)}</td>
                      {showPolygyny && isPolygynous && alternative && (
                        <td className="text-right py-2 text-primary">{formatNumber(alternative.totalSurplus)}</td>
                      )}
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
