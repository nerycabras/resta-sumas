// Sistema de diseño — tokens extraídos del prototipo "Zorro Aventurero".
// Paleta OKLCH (coral / dorado / turquesa) + tipografías Fredoka/Nunito.
// Reflejan las variables CSS de src/design/global.css para uso en JS/inline.

export const color = {
  coral: 'oklch(68% 0.19 35)',
  coralShadow: 'oklch(68% 0.19 35 / 0.3)',
  gold: 'oklch(80% 0.15 85)',
  goldShadow: 'oklch(80% 0.15 85 / 0.4)',
  teal: 'oklch(70% 0.13 190)',
  tealShadow: 'oklch(70% 0.13 190 / 0.4)',
  red: 'oklch(62% 0.20 25)',
  green: 'oklch(55% 0.15 145)',
  ink: 'oklch(30% 0.02 60)',
  surface: 'oklch(96% 0.03 85)',
  page: 'oklch(93% 0.02 85)',
  white: '#fff',
} as const;

export const font = {
  display: "'Fredoka', system-ui, sans-serif",
  body: "'Nunito', system-ui, sans-serif",
} as const;

export type ColorToken = keyof typeof color;
