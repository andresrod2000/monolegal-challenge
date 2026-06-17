/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#282D19',
          light: '#B5CC75',
          medium: '#6C7A4B',
          accent: '#87A537',
          muted: '#5C5C4D',
          neutral: '#898C84',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          cream: '#FAFAF7',
          subtle: '#F4F5F0',
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
