import type { CSSProperties } from 'react'

export const colors = {
  lavender:      '#C9A8E0',
  lavenderLight: '#E8D8F5',
  lavenderDark:  '#9B72C8',
  cream:         '#FAF8F4',
  amber:         '#D4A853',
  rose:          '#F2C8D8',
  noir:          '#1A1A1A',
  noirSoft:      '#2D2D2D',
  grey:          '#888888',
  greyLight:     '#CCCCCC',
  white:         '#FFFFFF',
} as const

export const fonts = {
  display: 'var(--font-cormorant)',
  body:    'var(--font-dm-sans)',
} as const

export const spacing = {
  sectionPaddingY:   '120px',
  containerMaxWidth: '1400px',
  containerPaddingX: '48px',
} as const

export const btnPrimary: CSSProperties = {
  fontFamily:     'var(--font-dm-sans)',
  fontSize:       '12px',
  fontWeight:     700,
  letterSpacing:  '0.12em',
  textTransform:  'uppercase',
  color:          '#FFFFFF',
  background:     '#C9A8E0',
  textDecoration: 'none',
  padding:        '18px 36px',
  borderRadius:   0,
  display:        'inline-block',
  border:         'none',
  cursor:         'pointer',
  whiteSpace:     'nowrap',
} as const

export const btnSecondary: CSSProperties = {
  fontFamily:     'var(--font-dm-sans)',
  fontSize:       '12px',
  fontWeight:     600,
  letterSpacing:  '0.12em',
  textTransform:  'uppercase',
  color:          '#1A1A1A',
  background:     'transparent',
  textDecoration: 'none',
  padding:        '17px 36px',
  borderRadius:   0,
  display:        'inline-block',
  border:         '1.5px solid #1A1A1A',
  cursor:         'pointer',
  whiteSpace:     'nowrap',
} as const

export const btnSecondaryInverted: CSSProperties = {
  ...btnSecondary,
  color:  '#FFFFFF',
  border: '1.5px solid rgba(255,255,255,0.5)',
} as const
