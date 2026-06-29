'use client';

import { useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { ChevronDown } from 'lucide-react';
import AnimateOnScroll from '@/components/shared/AnimateOnScroll';
import SectionLabel from '@/components/ui/SectionLabel';
import { cn } from '@/lib/utils';

type HistoryPoint = { year: number; price: number; event?: string };
type ForecastPoint = { year: number; price: number };
type PresetKey = 'bear' | 'base' | 'bull' | 'shock';
type ActivePreset = PresetKey | 'custom';
type Phase = 'historical' | 'forecast';

interface Content {
  hero: { eyebrow: string; title: string; subtitle: string };
  chart: {
    axisLabel: string;
    todayLabel: string;
    legend: {
      boom: string;
      crash: string;
      recovery: string;
      correction: string;
      super: string;
      historical: string;
      forecast: string;
    };
    forecastEndLabel: string;
    tooltipPhase: { historical: string; forecast: string };
  };
  calculator: {
    title: string;
    tag: string;
    sub: string;
    amountLabel: string;
    amountOptions: { value: string; label: string }[];
    yearLabel: string;
    yearStartHint: string;
    yearEndHint: string;
    stats: { endValue: string; totalReturn: string; cagr: string; maxDD: string };
  };
  simulator: {
    title: string;
    tag: string;
    sub: string;
    presets: Record<PresetKey, string>;
    controls: Record<
      'supply' | 'capital' | 'rates' | 'oil',
      { name: string; minHint: string; maxHint: string; labels: string[] }
    >;
    stats: { forecast2030: string; forecastCagr: string };
  };
  sections: {
    chartEyebrow: string;
    chartTitle: string;
    panelsEyebrow: string;
    panelsTitle: string;
  };
}

const history: HistoryPoint[] = [
  { year: 2002, price: 350, event: 'Freehold law' },
  { year: 2003, price: 450 },
  { year: 2004, price: 650 },
  { year: 2005, price: 900, event: 'RERA formed' },
  { year: 2006, price: 1200 },
  { year: 2007, price: 1500 },
  { year: 2008, price: 1800, event: '2008 Peak · GFC' },
  { year: 2009, price: 1100, event: 'Dubai World debt crisis' },
  { year: 2010, price: 850 },
  { year: 2011, price: 750, event: 'GFC Low' },
  { year: 2012, price: 820 },
  { year: 2013, price: 950, event: 'Expo 2020 bid won' },
  { year: 2014, price: 1003, event: '2014 Peak' },
  { year: 2015, price: 950, event: 'Oil price crash' },
  { year: 2016, price: 920 },
  { year: 2017, price: 900 },
  { year: 2018, price: 880, event: 'VAT introduced' },
  { year: 2019, price: 870 },
  { year: 2020, price: 872, event: 'COVID-19 low' },
  { year: 2021, price: 940, event: 'Expo opens' },
  { year: 2022, price: 1100, event: 'RU–UA capital flight' },
  { year: 2023, price: 1300 },
  { year: 2024, price: 1500 },
  { year: 2025, price: 1650, event: 'Iran conflict' },
  { year: 2026, price: 1759, event: 'Q1 2026' },
];

const cycles = [
  { from: 2002, to: 2008, key: 'boom' as const, fill: 'rgba(198,165,92,0.08)' },
  { from: 2008, to: 2011, key: 'crash' as const, fill: 'rgba(180,60,60,0.07)' },
  { from: 2011, to: 2014, key: 'recovery' as const, fill: 'rgba(60,120,100,0.07)' },
  { from: 2014, to: 2020, key: 'correction' as const, fill: 'rgba(120,120,140,0.07)' },
  { from: 2020, to: 2026, key: 'super' as const, fill: 'rgba(198,165,92,0.14)' },
];

const presets: Record<PresetKey, { supply: number; capital: number; rates: number; oil: number }> = {
  bear: { supply: 80, capital: 25, rates: 80, oil: 25 },
  base: { supply: 50, capital: 50, rates: 50, oil: 50 },
  bull: { supply: 25, capital: 80, rates: 25, oil: 75 },
  shock: { supply: 90, capital: 15, rates: 70, oil: 15 },
};

const W = 1100;
const H = 460;
const M = { top: 36, right: 30, bottom: 56, left: 64 };
const xMin = 2002;
const xMax = 2030;
const yMin = 0;
const yMax = 2400;

const xScale = (y: number) => M.left + ((y - xMin) / (xMax - xMin)) * (W - M.left - M.right);
const yScale = (p: number) => H - M.bottom - ((p - yMin) / (yMax - yMin)) * (H - M.top - M.bottom);

function smoothPath(points: { year: number; price: number }[]): string {
  if (points.length < 2) return '';
  const p = points.map((d) => [xScale(d.year), yScale(d.price)] as [number, number]);
  let d = `M ${p[0][0]} ${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] || p[i];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2] || p2;
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

function smoothGrowthRate(supply: number, capital: number, rates: number, oil: number): number {
  const base = 0.05;
  const supplyImpact = ((50 - supply) / 50) * 0.045;
  const capitalImpact = ((capital - 50) / 50) * 0.06;
  const ratesImpact = ((50 - rates) / 50) * 0.035;
  const oilImpact = ((oil - 50) / 50) * 0.03;
  let annual = base + supplyImpact + capitalImpact + ratesImpact + oilImpact;
  const extremes = [
    supply > 80,
    capital < 20,
    rates > 80,
    oil < 20,
    supply < 20,
    capital > 80,
    rates < 20,
    oil > 80,
  ].filter(Boolean).length;
  if (extremes >= 3) annual *= 1.4;
  return Math.max(-0.15, Math.min(0.2, annual));
}

function shockPath(startPrice: number): ForecastPoint[] {
  const shockYoY = [-0.39, -0.23, -0.12, 0.09];
  const path: ForecastPoint[] = [{ year: 2026, price: startPrice }];
  let p = startPrice;
  shockYoY.forEach((g, i) => {
    p = p * (1 + g);
    path.push({ year: 2027 + i, price: p });
  });
  return path;
}

function computeForecast(args: {
  supply: number;
  capital: number;
  rates: number;
  oil: number;
  activePreset: ActivePreset;
}): { path: ForecastPoint[]; annual: number | null; mode: 'shock' | 'smooth' } {
  const start = history[history.length - 1].price;
  if (args.activePreset === 'shock') {
    return { path: shockPath(start), annual: null, mode: 'shock' };
  }
  const annual = smoothGrowthRate(args.supply, args.capital, args.rates, args.oil);
  const path: ForecastPoint[] = [{ year: 2026, price: start }];
  for (let y = 2027; y <= 2030; y++) {
    const yearGrowth = annual - (y - 2027) * (annual - 0.04) * 0.1;
    const prev = path[path.length - 1].price;
    path.push({ year: y, price: Math.max(300, prev * (1 + yearGrowth)) });
  }
  return { path, annual, mode: 'smooth' };
}

function labelFromValue(v: number, words: string[]): string {
  const idx = Math.min(words.length - 1, Math.floor(v / (100 / words.length)));
  return words[idx];
}

const yTicks = [0, 500, 1000, 1500, 2000];
const xTicks: number[] = [];
for (let y = xMin; y <= xMax; y += 2) xTicks.push(y);

/* New UAE dirham symbol — single SVG path, used both inline (React JSX, inherits currentColor) and via <use href="#mi-dh"> inside the chart SVG. */
const DH_PATH =
  'M17.388 9.45455C17.244 9.12727 16.992 8.90909 16.704 8.8H16.596C16.596 8.76364 16.056 8.76364 16.056 8.76364H15.444H15.156V8.47273V8.25455C15.156 7.96364 15.156 7.41818 15.156 7.12727V6.90909V6.61818H15.444H16.236H16.596C16.992 6.61818 17.1 6.61818 17.208 6.61818C17.316 6.61818 17.424 6.69091 17.532 6.72727C17.532 6.61818 17.532 6.54546 17.46 6.43636C17.352 6.07273 17.136 5.81818 16.848 5.63636C16.728 5.56364 16.416 5.52727 15.912 5.52727C15.12 5.52727 15.084 5.52727 15.012 5.45455C14.94 5.38182 14.904 5.30909 14.904 5.23636C14.904 5.23636 14.904 5.12727 14.832 5.01818C14.436 3.56364 13.68 2.4 12.564 1.52727C12.42 1.41818 12.024 1.16364 11.916 1.09091H11.88C11.88 1.05455 11.808 1.01818 11.772 1.01818C11.7 0.981818 11.268 0.763636 11.196 0.727273C11.124 0.727273 11.052 0.654546 11.016 0.654546C10.404 0.363636 9.36 0.109091 8.568 0.0363636C8.496 0.0363636 8.424 0.0363636 8.352 0.0363636C8.28 0.0363636 8.208 0.0363636 8.172 0.0363636C7.812 8.12791e-09 7.344 0 4.428 0C1.512 0 2.448 0 1.872 0C2.052 0.363636 2.232 0.8 2.304 1.38182C2.376 1.85455 2.376 2 2.376 3.74545V5.6H1.368C0.684 5.6 0.576 5.6 0.432 5.6C0.324 5.6 0.18 5.52727 0.072 5.45455C0.072 5.56364 0.072 5.6 0.108 5.70909C0.18 5.96364 0.252 6.10909 0.36 6.25455C0.54 6.47273 0.684 6.58182 0.936 6.65455C1.008 6.65455 1.368 6.65455 1.512 6.65455H2.088H2.34V8.8H1.224H0.396H0.324H0.288L0.144 8.72727C0.072 8.72727 0.036 8.69091 0 8.65455C0 8.76364 -1.3411e-08 8.8 0.036 8.87273C0.18 9.38182 0.468 9.70909 0.864 9.81818C0.936 9.81818 0.972 9.81818 1.476 9.81818H2.052H2.304V11.7455C2.304 12.5455 2.304 13.4545 2.304 13.6364C2.304 13.7818 2.268 14 2.232 14.1455C2.16 14.6545 2.016 15.0909 1.8 15.4182H4.32C6.084 15.4182 7.488 15.4182 7.668 15.4182C8.028 15.4182 8.784 15.3091 8.928 15.2727C9 15.2727 9.072 15.2727 9.144 15.2364C9.252 15.2364 9.432 15.1636 9.864 15.0909C10.332 14.9818 10.764 14.8 11.196 14.6182C11.34 14.5455 11.7 14.3636 11.808 14.2909H11.88C11.916 14.2182 11.952 14.2182 11.988 14.1818C11.988 14.1818 12.096 14.1091 12.312 13.9636C12.384 13.8909 12.492 13.8545 12.492 13.8182C12.564 13.7818 12.816 13.5636 12.924 13.4545C13.356 13.0545 13.716 12.5818 14.004 12.1091C14.004 12.0364 14.076 11.9636 14.112 11.9273C14.148 11.8182 14.4 11.3455 14.4 11.2727C14.4 11.2 14.436 11.1636 14.472 11.1273C14.544 10.9818 14.76 10.2545 14.796 10.1091C14.796 10.0364 14.832 9.85455 15.084 9.81818C15.084 9.81818 15.12 9.81818 15.48 9.81818C15.84 9.81818 15.84 9.81818 16.092 9.81818C17.1 9.81818 17.136 9.81818 17.388 9.96364C17.388 9.96364 17.388 9.96364 17.424 9.96364C17.424 9.85455 17.424 9.81818 17.424 9.81818C17.352 9.6 17.352 9.56364 17.316 9.49091L17.388 9.45455ZM4.212 0.436364C4.212 0.4 4.248 0.181818 4.248 0.181818H5.76C6.408 0.181818 7.164 0.181818 7.344 0.181818C7.992 0.181818 8.352 0.254545 8.82 0.363636C10.224 0.690909 11.232 1.41818 11.952 2.65455C12.024 2.76364 12.312 3.34545 12.348 3.45455C12.528 4 12.636 4.32727 12.708 4.72727L12.78 5.01818C12.78 5.12727 12.852 5.27273 12.708 5.38182C12.66 5.4303 11.616 5.45455 9.576 5.45455H4.5H4.212V2.83636C4.212 0.727273 4.212 0.472727 4.212 0.4V0.436364ZM12.636 10.7636C12.528 11.2 12.384 11.6364 12.24 11.9636C12.168 12.1091 11.988 12.4727 11.952 12.5818C11.952 12.5818 11.88 12.6909 11.844 12.7636C11.484 13.3091 11.016 13.8182 10.44 14.1818C10.26 14.2909 9.828 14.5455 9.684 14.5818C9.648 14.5818 9.576 14.6545 9.252 14.7273C8.892 14.8727 8.208 15.0182 7.632 15.0545C7.272 15.0909 7.2 15.0909 5.868 15.0909H4.212V9.78182H8.46C10.764 9.78182 12.312 9.78182 12.456 9.78182C12.564 9.78182 12.708 9.85455 12.744 9.96364C12.744 10.0364 12.744 10.0727 12.636 10.7273V10.7636ZM12.96 8.47273C12.96 8.50909 12.924 8.72727 12.924 8.72727H8.604H4.5H4.212V7.67273C4.212 6.8 4.212 6.8 4.248 6.72727C4.296 6.6303 4.764 6.58182 5.652 6.58182C6.372 6.58182 7.416 6.58182 8.568 6.58182H12.888V6.8C12.924 6.8 12.924 6.87273 12.924 6.87273C12.924 6.94545 12.924 8.32727 12.924 8.47273H12.96Z';

function Dh({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={(size * 15.4182) / 17.532}
      viewBox="0 0 17.532 15.4182"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d={DH_PATH} />
    </svg>
  );
}

/* Dirham glyph rendered inline inside an SVG canvas (no <defs>/<use> — avoids React 18 SSR/CSR hydration mismatches with <symbol>). */
function DhInSvg({
  x,
  y,
  size,
  color,
}: {
  x: number;
  y: number;
  size: number;
  color: string;
}) {
  const scale = size / 17.532;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d={DH_PATH} fill={color} />
    </g>
  );
}

const sliderClasses =
  'w-full h-px bg-gray-200 accent-gold appearance-none cursor-pointer ' +
  '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-gold [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow ' +
  '[&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:bg-gold [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white';

interface Props {
  content: Content;
}

export default function MarketIntelligenceModule({ content }: Props) {
  const [entryYear, setEntryYear] = useState(2011);
  const [amount, setAmount] = useState(5000000);
  const [supply, setSupply] = useState(50);
  const [capital, setCapital] = useState(50);
  const [rates, setRates] = useState(50);
  const [oil, setOil] = useState(50);
  const [activePreset, setActivePreset] = useState<ActivePreset>('base');
  const [tooltip, setTooltip] = useState<
    { x: number; y: number; year: number; price: number; phase: Phase } | null
  >(null);

  const wrapRef = useRef<HTMLDivElement>(null);

  const forecast = useMemo(
    () => computeForecast({ supply, capital, rates, oil, activePreset }),
    [supply, capital, rates, oil, activePreset]
  );

  const forecastEnd = forecast.path[forecast.path.length - 1];
  const forecastCagrPct = useMemo(() => {
    const start = forecast.path[0].price;
    const yearsAhead = forecastEnd.year - 2026;
    if (yearsAhead === 0) return 0;
    return (Math.pow(forecastEnd.price / start, 1 / yearsAhead) - 1) * 100;
  }, [forecast.path, forecastEnd]);

  const calc = useMemo(() => {
    const entry = history.find((d) => d.year === entryYear) ?? history[0];
    const end = history[history.length - 1];
    const multiple = end.price / entry.price;
    const endValue = amount * multiple;
    const totalReturn = (multiple - 1) * 100;
    const years = end.year - entry.year + 0.25;
    const cagr = years > 0 ? (Math.pow(multiple, 1 / years) - 1) * 100 : 0;
    let peak = entry.price;
    let maxDD = 0;
    history
      .filter((d) => d.year >= entryYear)
      .forEach((d) => {
        if (d.price > peak) peak = d.price;
        const dd = ((d.price - peak) / peak) * 100;
        if (dd < maxDD) maxDD = dd;
      });
    return { entry, endValue, totalReturn, cagr, maxDD };
  }, [entryYear, amount]);

  const allPoints = useMemo(() => {
    const seen = new Set<number>();
    const merged: { year: number; price: number }[] = [];
    for (const p of [...history, ...forecast.path]) {
      if (seen.has(p.year)) continue;
      seen.add(p.year);
      merged.push(p);
    }
    return merged;
  }, [forecast.path]);

  const historyAreaPath = useMemo(() => {
    let d = smoothPath(history);
    d += ` L ${xScale(history[history.length - 1].year)} ${yScale(0)}`;
    d += ` L ${xScale(history[0].year)} ${yScale(0)} Z`;
    return d;
  }, []);

  const historyLinePath = useMemo(() => smoothPath(history), []);
  const forecastLinePath = useMemo(() => smoothPath(forecast.path), [forecast.path]);

  const handlePreset = (preset: PresetKey) => {
    const p = presets[preset];
    setSupply(p.supply);
    setCapital(p.capital);
    setRates(p.rates);
    setOil(p.oil);
    setActivePreset(preset);
  };

  const handleSlider =
    (setter: (n: number) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(+e.target.value);
      setActivePreset('custom');
    };

  const showTooltip = (point: { year: number; price: number }, e: ReactPointerEvent) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    setTooltip({
      x: e.clientX - rect.left + 14,
      y: e.clientY - rect.top - 32,
      year: point.year,
      price: point.price,
      phase: point.year > 2026 ? 'forecast' : 'historical',
    });
  };

  const moveTooltip = (e: ReactPointerEvent) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    setTooltip((t) =>
      t ? { ...t, x: e.clientX - rect.left + 14, y: e.clientY - rect.top - 32 } : t
    );
  };

  const hideTooltip = () => setTooltip(null);

  /* Pinned to en-US so SSR (Node) and CSR (any browser locale) produce identical strings — avoids hydration mismatches. */
  const fmtNum = (n: number) => Math.round(n).toLocaleString('en-US');
  const fmtPct = (n: number, digits = 1) =>
    (n >= 0 ? '+' : '') + n.toFixed(digits) + '%';

  const todayX = xScale(2026);
  const entryMarkerX = xScale(calc.entry.year);
  const entryMarkerY = yScale(calc.entry.price);
  const forecastEndX = xScale(forecastEnd.year);
  const forecastEndY = yScale(forecastEnd.price);

  return (
    <>
      {/* === CHART SECTION (dark band, white card spotlight) === */}
      <section className="bg-black text-white py-16 md:py-24">
        <div className="container-wide">
          <AnimateOnScroll>
            <div className="text-center mb-10 md:mb-14">
              <SectionLabel className="text-gold [&::before]:bg-white/20 [&::after]:bg-white/20">
                {content.sections.chartEyebrow}
              </SectionLabel>
              <h2 className="mt-5 text-[28px] md:text-[36px] lg:text-[42px] font-light leading-tight tracking-tight text-white">
                {content.sections.chartTitle}
              </h2>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll delay={0.1}>
            <div className="bg-white text-black border border-white/10 p-4 sm:p-6 md:p-10">
              <div ref={wrapRef} className="relative w-full">
                <svg
                  viewBox={`0 0 ${W} ${H}`}
                  preserveAspectRatio="xMidYMid meet"
                  className="block w-full h-auto"
                  onPointerLeave={hideTooltip}
                >
                  {/* Cycle bands */}
                  {cycles.map((c) => {
                    const x1 = xScale(c.from);
                    const x2 = xScale(c.to);
                    return (
                      <g key={c.key}>
                        <rect
                          x={x1}
                          y={M.top}
                          width={x2 - x1}
                          height={H - M.top - M.bottom}
                          fill={c.fill}
                        />
                        <text
                          x={(x1 + x2) / 2}
                          y={M.top + 14}
                          textAnchor="middle"
                          fontSize="9"
                          fontWeight="600"
                          letterSpacing="1.4"
                          fill="#8a8a99"
                        >
                          {content.chart.legend[c.key].toUpperCase()}
                        </text>
                      </g>
                    );
                  })}

                  {/* "Today" divider */}
                  <line
                    x1={todayX}
                    x2={todayX}
                    y1={M.top}
                    y2={H - M.bottom}
                    stroke="#181a20"
                    strokeWidth={1}
                    strokeDasharray="2 3"
                    opacity={0.35}
                  />
                  <text
                    x={todayX}
                    y={H - M.bottom + 32}
                    textAnchor="middle"
                    fontStyle="italic"
                    fontSize="11"
                    fill="#181a20"
                  >
                    {content.chart.todayLabel}
                  </text>

                  {/* Y-axis */}
                  {yTicks.map((t) => {
                    const y = yScale(t);
                    return (
                      <g key={t}>
                        <line
                          x1={M.left}
                          x2={W - M.right}
                          y1={y}
                          y2={y}
                          stroke="#181a20"
                          opacity={0.08}
                          strokeWidth={1}
                        />
                        <text
                          x={M.left - 10}
                          y={y + 4}
                          textAnchor="end"
                          fontSize="10"
                          fill="#8a8a99"
                        >
                          {t.toLocaleString('en-US')}
                        </text>
                      </g>
                    );
                  })}
                  <DhInSvg x={18} y={M.top - 19} size={9} color="#8a8a99" />
                  <text
                    x={30}
                    y={M.top - 11}
                    fontSize="9"
                    fontWeight={600}
                    letterSpacing="1.6"
                    fill="#8a8a99"
                  >
                    {content.chart.axisLabel}
                  </text>

                  {/* X-axis */}
                  {xTicks.map((y) => (
                    <text
                      key={y}
                      x={xScale(y)}
                      y={H - M.bottom + 16}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#8a8a99"
                    >
                      {y}
                    </text>
                  ))}

                  {/* History area + line */}
                  <path d={historyAreaPath} fill="rgba(198,165,92,0.12)" opacity={0.5} />
                  <path
                    d={historyLinePath}
                    fill="none"
                    stroke="#C6A55C"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Event markers */}
                  {history
                    .filter((d) => d.event)
                    .map((d) => {
                      const cx = xScale(d.year);
                      const cy = yScale(d.price);
                      return (
                        <g key={d.year} style={{ pointerEvents: 'none' }}>
                          <circle
                            cx={cx}
                            cy={cy}
                            r={4}
                            fill="#ffffff"
                            stroke="#C6A55C"
                            strokeWidth={2}
                          />
                          <text
                            x={cx}
                            y={cy - 12}
                            textAnchor="middle"
                            fontStyle="italic"
                            fontSize="10"
                            fill="#181a20"
                          >
                            {d.event}
                          </text>
                        </g>
                      );
                    })}

                  {/* Forecast dashed */}
                  <path
                    d={forecastLinePath}
                    fill="none"
                    stroke="#C6A55C"
                    strokeWidth={2.5}
                    strokeDasharray="5 4"
                    strokeLinecap="round"
                    opacity={0.95}
                  />

                  {/* Forecast end marker */}
                  <circle
                    cx={forecastEndX}
                    cy={forecastEndY}
                    r={5}
                    fill="#C6A55C"
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                  {/* Symbol + price as a centered pair: number is anchor-middle, symbol sits to its left. */}
                  <DhInSvg
                    x={forecastEndX - 4 - fmtNum(forecastEnd.price).length * 3.6}
                    y={forecastEndY - 22}
                    size={11}
                    color="#181a20"
                  />
                  <text
                    x={forecastEndX + 6}
                    y={forecastEndY - 14}
                    textAnchor="middle"
                    fontWeight={600}
                    fontSize="12"
                    fill="#181a20"
                  >
                    {fmtNum(forecastEnd.price)}
                  </text>
                  <text
                    x={forecastEndX}
                    y={forecastEndY - 28}
                    textAnchor="middle"
                    fontSize="9"
                    letterSpacing="1.2"
                    fontWeight={600}
                    fill="#C6A55C"
                  >
                    {content.chart.forecastEndLabel}
                  </text>

                  {/* Entry-year marker */}
                  <line
                    x1={entryMarkerX}
                    x2={entryMarkerX}
                    y1={entryMarkerY}
                    y2={H - M.bottom}
                    stroke="#181a20"
                    strokeWidth={1}
                    opacity={0.35}
                    strokeDasharray="2 3"
                  />
                  <circle
                    cx={entryMarkerX}
                    cy={entryMarkerY}
                    r={7}
                    fill="#ffffff"
                    stroke="#181a20"
                    strokeWidth={2}
                  />
                  <circle cx={entryMarkerX} cy={entryMarkerY} r={3} fill="#181a20" />

                  {/* Hit targets */}
                  {allPoints.map((p) => {
                    const cx = xScale(p.year);
                    const cy = yScale(p.price);
                    return (
                      <circle
                        key={p.year}
                        cx={cx}
                        cy={cy}
                        r={14}
                        fill="transparent"
                        style={{ cursor: 'crosshair' }}
                        onPointerEnter={(e) => showTooltip(p, e)}
                        onPointerMove={(e) => moveTooltip(e)}
                        onPointerDown={(e) => showTooltip(p, e)}
                        onPointerLeave={hideTooltip}
                      />
                    );
                  })}
                </svg>

                {tooltip && (
                  <div
                    className="pointer-events-none absolute bg-black text-white text-[11px] font-medium px-3 py-2 whitespace-nowrap tabular-nums shadow-xl flex items-center"
                    style={{ left: tooltip.x, top: tooltip.y }}
                  >
                    <span className="text-gold-light font-semibold mr-2">{tooltip.year}</span>
                    <Dh size={10} className="me-1 text-white" />
                    {Math.round(tooltip.price).toLocaleString('en-US')} / sq ft
                    <span className="ms-2 text-[10px] tracking-[0.1em] uppercase text-gold-light">
                      {content.chart.tooltipPhase[tooltip.phase]}
                    </span>
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className="mt-5 pt-5 border-t border-gray-200 flex flex-wrap gap-x-6 gap-y-3 text-[11px] tracking-[0.04em] uppercase text-[#5f6368]">
                <LegendItem swatchColor="rgba(198,165,92,0.08)" label={content.chart.legend.boom} />
                <LegendItem swatchColor="rgba(180,60,60,0.07)" label={content.chart.legend.crash} />
                <LegendItem swatchColor="rgba(60,120,100,0.07)" label={content.chart.legend.recovery} />
                <LegendItem swatchColor="rgba(120,120,140,0.07)" label={content.chart.legend.correction} />
                <LegendItem swatchColor="rgba(198,165,92,0.14)" label={content.chart.legend.super} />
                <LegendLine label={content.chart.legend.historical} dashed={false} />
                <LegendLine label={content.chart.legend.forecast} dashed={true} />
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* === INTERACTIVE PANELS (light blue band) === */}
      <section className="bg-[#f0f3f8] py-16 md:py-24">
        <div className="container-wide">
          <AnimateOnScroll>
            <div className="text-center mb-10 md:mb-14">
              <SectionLabel>{content.sections.panelsEyebrow}</SectionLabel>
              <h2 className="mt-5 text-[28px] md:text-[36px] lg:text-[42px] font-light leading-tight tracking-tight text-black max-w-3xl mx-auto">
                {content.sections.panelsTitle}
              </h2>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {/* Time-Travel Calculator */}
            <AnimateOnScroll delay={0.1}>
              <div className="h-full bg-white border border-gray-200 p-8 md:p-10">
                <div className="flex items-start justify-between gap-4 mb-1">
                  <h3 className="text-[22px] md:text-[26px] font-light text-black leading-tight">
                    {content.calculator.title}
                  </h3>
                  <span className="text-[10px] tracking-[0.16em] uppercase font-semibold text-gold whitespace-nowrap mt-2">
                    {content.calculator.tag}
                  </span>
                </div>
                <p className="mb-8 text-sm italic text-[#5f6368] leading-relaxed">
                  {content.calculator.sub}
                </p>

                <div className="mb-6">
                  <div className="flex items-baseline justify-between mb-2 text-xs">
                    <span className="text-[#5f6368] uppercase tracking-[0.08em] font-medium">
                      {content.calculator.amountLabel}
                    </span>
                  </div>
                  <div className="relative">
                    {/* Dirham glyph rendered as a visible currency prefix — native <option> can't host SVG, so we surface the symbol on the select's caption instead. */}
                    <Dh
                      size={14}
                      className="absolute start-0 top-1/2 -translate-y-1/2 text-black pointer-events-none"
                    />
                    <select
                      value={String(amount)}
                      onChange={(e) => setAmount(+e.target.value)}
                      aria-label={content.calculator.amountLabel}
                      className="w-full appearance-none bg-transparent border-0 border-b border-gray-300 focus:border-gold focus:outline-none focus:ring-0 ps-6 pe-8 py-2 text-lg font-medium text-black tabular-nums cursor-pointer transition-colors"
                    >
                      {content.calculator.amountOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute end-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gold pointer-events-none" />
                  </div>
                </div>

                <div className="mb-2">
                  <div className="flex items-baseline justify-between mb-2 text-xs">
                    <span className="text-[#5f6368] uppercase tracking-[0.08em] font-medium">
                      {content.calculator.yearLabel}
                    </span>
                    <span className="text-black text-base font-medium tabular-nums">
                      {entryYear}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={2002}
                    max={2025}
                    step={1}
                    value={entryYear}
                    onChange={(e) => setEntryYear(+e.target.value)}
                    className={sliderClasses}
                    aria-label={content.calculator.yearLabel}
                  />
                  <div className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.06em] text-gray-400">
                    <span>{content.calculator.yearStartHint}</span>
                    <span>{content.calculator.yearEndHint}</span>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-200 grid grid-cols-2 gap-x-6 gap-y-6">
                  <Stat
                    label={content.calculator.stats.endValue}
                    value={<CurrencyValue value={fmtNum(calc.endValue)} />}
                    variant="gold"
                  />
                  <Stat
                    label={content.calculator.stats.totalReturn}
                    value={fmtPct(calc.totalReturn, 0)}
                  />
                  <Stat label={content.calculator.stats.cagr} value={fmtPct(calc.cagr)} />
                  <Stat
                    label={content.calculator.stats.maxDD}
                    value={calc.maxDD.toFixed(0) + '%'}
                    variant="warn"
                  />
                </div>
              </div>
            </AnimateOnScroll>

            {/* Scenario Simulator */}
            <AnimateOnScroll delay={0.2}>
              <div className="h-full bg-white border border-gray-200 p-8 md:p-10">
                <div className="flex items-start justify-between gap-4 mb-1">
                  <h3 className="text-[22px] md:text-[26px] font-light text-black leading-tight">
                    {content.simulator.title}
                  </h3>
                  <span className="text-[10px] tracking-[0.16em] uppercase font-semibold text-gold whitespace-nowrap mt-2">
                    {content.simulator.tag}
                  </span>
                </div>
                <p className="mb-6 text-sm italic text-[#5f6368] leading-relaxed">
                  {content.simulator.sub}
                </p>

                <div className="flex flex-wrap gap-2 mb-7">
                  {(Object.keys(presets) as PresetKey[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handlePreset(key)}
                      className={cn(
                        'px-4 py-2.5 text-[10px] uppercase tracking-[0.14em] font-medium border transition-colors duration-200',
                        activePreset === key
                          ? 'bg-gold text-white border-gold'
                          : 'border-gold/60 text-gold hover:bg-gold hover:text-white hover:border-gold'
                      )}
                    >
                      {content.simulator.presets[key]}
                    </button>
                  ))}
                </div>

                <SliderControl
                  label={content.simulator.controls.supply.name}
                  value={supply}
                  onChange={handleSlider(setSupply)}
                  displayValue={labelFromValue(supply, content.simulator.controls.supply.labels)}
                  minHint={content.simulator.controls.supply.minHint}
                  maxHint={content.simulator.controls.supply.maxHint}
                />
                <SliderControl
                  label={content.simulator.controls.capital.name}
                  value={capital}
                  onChange={handleSlider(setCapital)}
                  displayValue={labelFromValue(capital, content.simulator.controls.capital.labels)}
                  minHint={content.simulator.controls.capital.minHint}
                  maxHint={content.simulator.controls.capital.maxHint}
                />
                <SliderControl
                  label={content.simulator.controls.rates.name}
                  value={rates}
                  onChange={handleSlider(setRates)}
                  displayValue={labelFromValue(rates, content.simulator.controls.rates.labels)}
                  minHint={content.simulator.controls.rates.minHint}
                  maxHint={content.simulator.controls.rates.maxHint}
                />
                <SliderControl
                  label={content.simulator.controls.oil.name}
                  value={oil}
                  onChange={handleSlider(setOil)}
                  displayValue={labelFromValue(oil, content.simulator.controls.oil.labels)}
                  minHint={content.simulator.controls.oil.minHint}
                  maxHint={content.simulator.controls.oil.maxHint}
                />

                <div className="mt-6 pt-8 border-t border-gray-200 grid grid-cols-2 gap-x-6 gap-y-6">
                  <Stat
                    label={content.simulator.stats.forecast2030}
                    value={<CurrencyValue value={fmtNum(forecastEnd.price)} />}
                    variant="gold"
                  />
                  <Stat
                    label={content.simulator.stats.forecastCagr}
                    value={fmtPct(forecastCagrPct)}
                  />
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>
    </>
  );
}

function LegendItem({ swatchColor, label }: { swatchColor: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-block w-3.5 h-2.5" style={{ background: swatchColor }} />
      {label}
    </div>
  );
}

function LegendLine({ label, dashed }: { label: string; dashed: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="inline-block w-3.5 h-0.5"
        style={
          dashed
            ? { background: 'repeating-linear-gradient(90deg, #C6A55C 0 4px, transparent 4px 7px)' }
            : { background: '#C6A55C' }
        }
      />
      {label}
    </div>
  );
}

function Stat({
  label,
  value,
  variant,
}: {
  label: string;
  value: React.ReactNode;
  variant?: 'gold' | 'warn';
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.12em] font-medium text-gray-400">
        {label}
      </div>
      <div
        className={cn(
          'mt-2 text-[28px] md:text-[34px] font-light tabular-nums leading-none flex items-baseline',
          variant === 'gold' ? 'text-gold' : variant === 'warn' ? 'text-red-700' : 'text-black'
        )}
      >
        {value}
      </div>
    </div>
  );
}

/* Symbol + number value for currency stats. The symbol inherits the parent's color via currentColor. */
function CurrencyValue({ value }: { value: string }) {
  return (
    <>
      <Dh size={20} className="me-1.5 self-center" />
      <span>{value}</span>
    </>
  );
}

function SliderControl({
  label,
  value,
  onChange,
  displayValue,
  minHint,
  maxHint,
}: {
  label: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  displayValue: string;
  minHint: string;
  maxHint: string;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-baseline justify-between mb-2 text-xs">
        <span className="text-[#5f6368] uppercase tracking-[0.08em] font-medium">{label}</span>
        <span className="text-black font-medium tabular-nums">{displayValue}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={onChange}
        className={sliderClasses}
        aria-label={label}
      />
      <div className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.06em] text-gray-400">
        <span>{minHint}</span>
        <span>{maxHint}</span>
      </div>
    </div>
  );
}
