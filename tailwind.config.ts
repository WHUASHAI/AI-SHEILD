import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        /* ── 5-Color Palette ───────────────────────────── */
        'space-cadet':          '#102B53',
        'space-cadet-dark':     '#0b1e3a',
        'space-cadet-light':    '#1B3A6B',
        'ucla-blue':            '#50698D',
        'ucla-blue-dark':       '#3d5070',
        'ucla-blue-light':      '#6a83a8',
        'pink-lavender':        '#CEB5D4',
        'pink-lavender-light':  '#deccf0',
        'cyan-azure':           '#4E7AB1',
        'cyan-azure-dark':      '#3b5f8a',
        'cyan-azure-light':     '#6a98c8',
        'air-sup-blue':         '#7D9FC0',
        'air-sup-blue-dark':    '#5e7e9e',
        'air-sup-blue-light':   '#9dbbd8',

        /* ── Semantic Aliases (CSS-var based) ────────────── */
        border:     'var(--color-border)',
        input:      'var(--color-input)',
        ring:       'var(--color-ring)',
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        surface:    'var(--color-surface)',
        primary: {
          DEFAULT:    'var(--color-primary)',
          foreground: 'var(--color-primary-foreground)',
        },
        secondary: {
          DEFAULT:    'var(--color-secondary)',
          foreground: 'var(--color-secondary-foreground)',
        },
        destructive: {
          DEFAULT:    'var(--color-destructive)',
          foreground: 'var(--color-destructive-foreground)',
        },
        muted: {
          DEFAULT:    'var(--color-muted)',
          foreground: 'var(--color-muted-foreground)',
        },
        accent: {
          DEFAULT:    'var(--color-accent)',
          foreground: 'var(--color-accent-foreground)',
        },
        card: {
          DEFAULT:    'var(--color-card)',
          foreground: 'var(--color-card-foreground)',
        },
      },
      borderRadius: {
        lg: 'var(--radius-lg)',
        md: 'var(--radius-md)',
        sm: 'var(--radius-sm)',
      },
      fontFamily: {
        sans: ['Inter', 'var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      backgroundImage: {
        'gradient-brand':     'linear-gradient(135deg, #4E7AB1, #CEB5D4)',
        'gradient-hero':      'radial-gradient(ellipse at 50% -20%, rgba(78,122,177,.25) 0%, transparent 70%), linear-gradient(180deg, #0b1e3a 0%, #102B53 100%)',
        'gradient-card':      'linear-gradient(135deg, #0f2446 0%, #162f59 100%)',
        'gradient-text-raw':  'linear-gradient(135deg, #7D9FC0, #CEB5D4)',
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up':   { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        'fade-in':        { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-up':       { from: { opacity: '0', transform: 'translateY(10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(78,122,177,0.3)' },
          '50%':       { boxShadow: '0 0 20px rgba(78,122,177,0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        'fade-in':        'fade-in 0.3s ease-out',
        'slide-up':       'slide-up 0.4s ease-out',
        'pulse-glow':     'pulse-glow 2.5s ease-in-out infinite',
        'float':          'float 4s ease-in-out infinite',
      },
      boxShadow: {
        'palette':        '0 8px 32px rgba(16, 43, 83, 0.5)',
        'palette-md':     '0 4px 16px rgba(78, 122, 177, 0.2)',
        'palette-glow':   '0 0 24px rgba(78, 122, 177, 0.35)',
        'lavender-glow':  '0 0 20px rgba(206, 181, 212, 0.3)',
      },
    },
  },
  plugins: [],
};

export default config;
