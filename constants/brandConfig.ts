export const BRAND_CATCHPHRASES = [
  '昨日までの自分は、もういい。',
  '今から新しい自分へ生まれ変わる。',
];

export interface BrandTimingConfig {
  logoDelay: number;
  lineStartDelay: number;
  lineInterval: number;
  lineAnimDuration: number;
  postTextPause: number;
  charInterval: number;
}

export interface BrandTimings {
  logo: number;
  lines: number[];
  navigate: number;
  lineAnimDuration: number;
}

export const BRAND_TIMING_CONFIG: BrandTimingConfig = {
  logoDelay: 300,
  lineStartDelay: 1000,
  lineInterval: 800,
  lineAnimDuration: 400,
  postTextPause: 800,
  charInterval: 80,
};

export function calculateBrandTimings(
  config: BrandTimingConfig,
  lineCount: number,
): BrandTimings {
  const lines = Array.from(
    { length: lineCount },
    (_, i) => config.lineStartDelay + i * config.lineInterval,
  );

  const lastLineStart = lineCount > 0
    ? lines[lineCount - 1]
    : config.lineStartDelay;

  return {
    logo: config.logoDelay,
    lines,
    navigate: lastLineStart + config.lineAnimDuration + config.postTextPause,
    lineAnimDuration: config.lineAnimDuration,
  };
}
