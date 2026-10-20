/** @type {import('tailwindcss').Config} */
export default {
  content: {
    relative: true,
    files: ['./index.html', './src/**/*.{js,jsx}'],
  },
  theme: {
    extend: {
      colors: {
        // Graphite & Titanium brand palette
        charcoal: '#202328',
        graphite: '#353B43',
        steel: '#737D87',
        titanium: '#D5D7D6',
        'off-white': '#F3F2EE',
        'body-text': '#292D32',
        'industrial-blue': '#326783',
        // Legacy aliases for backward compatibility
        navy: '#202328',
        'navy-secondary': '#2A2E35',
        surface: '#F3F2EE',
        ink: '#202328',
        // Accent colors
        gold: '#C9A84C',
        'gold-dark': '#A68A3E',
        'gold-light': '#E8D5A0',
        // Semantic
        'text-primary': '#292D32',
        'text-secondary': '#4A5058',
        'text-muted': '#6B7280',
        'border-light': '#E2E0DC',
        'border-medium': '#C5C9C8',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Lora', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5' }],
        'sm': ['0.875rem', { lineHeight: '1.6' }],
        'base': ['1rem', { lineHeight: '1.7' }],
        'lg': ['1.125rem', { lineHeight: '1.7' }],
        'xl': ['1.25rem', { lineHeight: '1.6' }],
        '2xl': ['1.5rem', { lineHeight: '1.4' }],
        '3xl': ['1.875rem', { lineHeight: '1.3' }],
        '4xl': ['2.25rem', { lineHeight: '1.25' }],
        '5xl': ['3rem', { lineHeight: '1.2' }],
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(32, 35, 40, 0.06), 0 1px 2px rgba(32, 35, 40, 0.04)',
        'card-hover': '0 12px 32px -8px rgba(32, 35, 40, 0.15), 0 4px 12px -4px rgba(32, 35, 40, 0.08)',
        button: '0 2px 4px rgba(201, 168, 76, 0.15)',
        'button-hover': '0 4px 12px rgba(201, 168, 76, 0.25)',
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '250ms',
        'slow': '350ms',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out both',
        'fade-in': 'fade-in 0.3s ease-out both',
        'slide-in-right': 'slide-in-right 0.3s ease-out both',
      },
    },
  },
  plugins: [],
}
