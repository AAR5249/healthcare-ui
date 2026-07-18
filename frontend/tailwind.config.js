/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep pine-teal — the clinical-trust color
        primary: {
          50: '#eef5f4',
          100: '#d7e8e5',
          200: '#afd1cb',
          300: '#7fb3aa',
          400: '#4f958a',
          500: '#2e7166',
          600: '#215750',
          700: '#1a433e',
          800: '#153531',
          900: '#102825',
        },
        // Warm amber-gold — the ticket/time accent, used sparingly
        accent: {
          50: '#fdf6ea',
          100: '#faebc9',
          200: '#f3d590',
          300: '#eabd5c',
          400: '#dea23a',
          500: '#c8862a',
          600: '#a66a20',
          700: '#7f501a',
        },
        success: {
          50: '#eef8f1',
          500: '#3e9764',
          600: '#2f7a4f',
          700: '#245e3d',
        },
        warning: {
          50: '#fdf6ea',
          500: '#c8862a',
          600: '#a66a20',
          700: '#7f501a',
        },
        error: {
          50: '#fbeeee',
          500: '#b8493f',
          600: '#983a32',
          700: '#792d27',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        card: '0.875rem',
      },
    },
  },
  plugins: [],
}
