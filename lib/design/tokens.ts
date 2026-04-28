export const TOKENS = {
  bg: '#F8F5EE',
  surface: '#FFFFFF',
  ink: '#161412',
  inkSecondary: '#5C5751',
  inkTertiary: '#A39E96',
  border: '#E5DFD3',
  borderStrong: '#D4CBB8',
  defaultAccent: '#9A3F2C',
  serif: '"Instrument Serif", "Cormorant Garamond", Georgia, serif',
  sans: '"Geist", "Söhne", -apple-system, system-ui, sans-serif',
  mono: '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace',
} as const;

export type Tokens = typeof TOKENS;
