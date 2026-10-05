/*
  Each palette's five colours are assigned to roles instead of being used in order.
  Text colour is never taken blindly from the palette: dark palettes get white ink,
  light palettes get near-black ink, and anything placed on a filled colour
  (buttons, bands, status cells) is resolved by contrast ratio at runtime.

  Roles
  bg       page background
  surface  alternate section background
  raised   cards, calendar, drawers
  deep     contrast band (final call to action)
  ink      body text
  primary  main buttons
  accent   icons, court lines, highlights
  soft     court fills, quiet tints
  ball     small pop colour
  line     borders and dividers
  stage    dramatic dark ground: loader, split-flap tiles, photo slots, scoreboard
  flip-a/b the two scoreboard card colours
  glow-1/2 loader light pulses
  lamp     lit scoreboard segments (a brightened tint of a palette colour)
*/

const mix = (color, pct, base = 'transparent') => `color-mix(in srgb, ${color} ${pct}%, ${base})`

export const palettes = [
  {
    id: 'p1',
    name: 'Palette 1',
    mode: 'light',
    swatch: ['#A1937E', '#594836', '#4D1519', '#301413', '#170704'],
    darkest: '#170704',
    roles: {
      bg: mix('#A1937E', 16, '#FFFDF8'),
      surface: mix('#A1937E', 38, '#FFFDF8'),
      raised: mix('#FFFFFF', 70, mix('#A1937E', 16, '#FFFDF8')),
      deep: '#4D1519',
      ink: '#170704',
      primary: '#4D1519',
      accent: '#4D1519',
      soft: mix('#A1937E', 32, '#FFFDF8'),
      ball: '#A1937E',
      line: mix('#594836', 24),
      stage: '#301413',
      'flip-a': '#4D1519',
      'flip-b': '#A1937E',
      'glow-1': '#A1937E',
      'glow-2': '#594836',
      lamp: '#E6C9A0',
    },
  },
  {
    id: 'p2',
    name: 'Palette 2',
    mode: 'dark',
    swatch: ['#CCD0CF', '#9BA8AB', '#4A5C6A', '#11212D', '#06141B'],
    darkest: '#06141B',
    roles: {
      bg: '#06141B',
      surface: '#11212D',
      raised: mix('#4A5C6A', 30, '#11212D'),
      deep: '#CCD0CF',
      ink: '#FFFFFF',
      primary: '#CCD0CF',
      accent: '#9BA8AB',
      soft: mix('#4A5C6A', 55, '#06141B'),
      ball: '#CCD0CF',
      line: mix('#9BA8AB', 26),
      // Lifted off the page ground so the board keeps its edge
      stage: '#1B2C38', // #11212D lifted 18% toward #4A5C6A
      'flip-a': '#4A5C6A',
      'flip-b': '#CCD0CF',
      'glow-1': '#9BA8AB',
      'glow-2': '#4A5C6A',
      lamp: '#E4ECEA',
    },
  },
  {
    id: 'p3',
    name: 'Palette 3',
    mode: 'light',
    swatch: ['#F2F5E2', '#E3DEA4', '#D4954D', '#775533', '#290024'],
    darkest: '#1F0A1B',
    roles: {
      bg: '#F2F5E2',
      surface: '#E3DEA4',
      raised: mix('#FFFFFF', 55, '#F2F5E2'),
      deep: '#290024',
      ink: '#1F0A1B',
      primary: '#775533',
      accent: '#775533',
      soft: '#E3DEA4',
      ball: '#D4954D',
      line: mix('#775533', 26),
      stage: '#290024',
      'flip-a': '#775533',
      'flip-b': '#D4954D',
      'glow-1': '#D4954D',
      'glow-2': '#E3DEA4',
      lamp: '#E8A65A',
    },
  },
  {
    id: 'p4',
    name: 'Palette 4',
    mode: 'light',
    swatch: ['#083A4F', '#A58D66', '#C0D5D6', '#407E8C', '#E5E1DD'],
    darkest: '#0C2330',
    roles: {
      bg: '#E5E1DD',
      surface: '#C0D5D6',
      raised: mix('#FFFFFF', 55, '#E5E1DD'),
      deep: '#083A4F',
      ink: '#0C2330',
      primary: '#083A4F',
      accent: '#407E8C',
      soft: '#C0D5D6',
      ball: '#A58D66',
      line: mix('#407E8C', 32),
      stage: '#083A4F',
      'flip-a': '#407E8C',
      'flip-b': '#A58D66',
      'glow-1': '#407E8C',
      'glow-2': '#C0D5D6',
      lamp: '#D9BE8C',
    },
  },
]

/* ---------- contrast helpers ---------- */

function hexToRgb(hex) {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const n = parseInt(full, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrastRatio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/* Picks white or the palette's darkest tone, whichever reads better on `bg` */
export function contrastText(bg, dark = '#141414', light = '#FFFFFF') {
  return contrastRatio(bg, light) >= contrastRatio(bg, dark) ? light : dark
}

export function applyPalette(palette) {
  const root = document.documentElement
  const { roles, darkest } = palette
  const vars = {
    ...roles,
    'on-primary': contrastText(roles.primary, darkest),
    'on-deep': contrastText(roles.deep, darkest),
    'on-stage': contrastText(roles.stage, darkest),
    'on-flip-a': contrastText(roles['flip-a'], darkest),
    'on-flip-b': contrastText(roles['flip-b'], darkest),
  }
  Object.entries(vars).forEach(([key, value]) => root.style.setProperty(`--c-${key}`, value))
  // Status tints need more strength on dark palettes to stay readable
  root.style.setProperty('--status-tint', palette.mode === 'dark' ? '34%' : '24%')
  root.style.colorScheme = palette.mode
  root.dataset.mode = palette.mode
}
