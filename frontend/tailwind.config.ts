import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ECX Brand Colors
      colors: {
        // Primary Colors
        'ecx-blue': {
          DEFAULT: '#2699e3',
          50: '#e6f4fc',
          100: '#cce9f9',
          200: '#99d3f3',
          300: '#66bded',
          400: '#33a7e7',
          500: '#2699e3',
          600: '#1e7ab6',
          700: '#175c89',
          800: '#0f3d5b',
          900: '#081f2e',
        },
        'ecx-yellow': {
          DEFAULT: '#fab12d',
          50: '#fef6e6',
          100: '#fdedcc',
          200: '#fbd899',
          300: '#f9c466',
          400: '#f7b033',
          500: '#fab12d',
          600: '#c88e24',
          700: '#966a1b',
          800: '#644712',
          900: '#322309',
        },
        'ecx-red': {
          DEFAULT: '#f2443f',
          50: '#fde9e9',
          100: '#fbd3d2',
          200: '#f7a7a5',
          300: '#f37b78',
          400: '#ef4f4b',
          500: '#f2443f',
          600: '#c23632',
          700: '#912926',
          800: '#611b19',
          900: '#300e0d',
        },
        // Secondary Colors
        'ecx-navy': '#272e4b',
        'ecx-cream': '#f4e1ce',
        'ecx-maroon': '#802807',
        'ecx-purple': '#6259cd',
        'ecx-teal': '#00b29a',
        'ecx-coral': '#fc8a7a',
        // Null Colors
        'ecx-black': '#000000',
        'ecx-gray': '#424242',
        'ecx-white': '#ffffff',
      },
      // Typography - 4 fonts: Geom, Space Grotesk (alt), DM Sans, DM Mono
      fontFamily: {
        // Geom - Primary headings (loaded via Google Fonts link)
        'geom': ['Geom', 'var(--font-geom)', 'system-ui', 'sans-serif'],
        // Space Grotesk - Fallback/alternative (similar geometric grotesque)
        'grotesk': ['var(--font-geom)', 'system-ui', 'sans-serif'],
        // DM Sans - Body text
        'body': ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        // DM Mono - Monospace
        'mono': ['var(--font-mono-sans)', 'monospace'],
      },
      fontSize: {
        // Headings (using Geom)
        'heading-1': ['2rem', { lineHeight: '1.2', fontWeight: '700' }],
        'heading-2': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
        'heading-3': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        'heading-4': ['1.125rem', { lineHeight: '1.4', fontWeight: '500' }],
        // Body (using DM Sans)
        'body': ['1rem', { lineHeight: '1.5', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        // Caption
        'caption': ['0.75rem', { lineHeight: '1.4', fontWeight: '400' }],
      },
      // Border Radius
      borderRadius: {
        'card': '12px',
        'button': '8px',
        'input': '8px',
      },
      // Box Shadow
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
        'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      // Animation
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
