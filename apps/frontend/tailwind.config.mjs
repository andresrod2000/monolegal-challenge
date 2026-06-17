/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        monolegal: {
          primary: '#6366f1',
          accent: '#22d3ee',
        },
      },
    },
  },
  plugins: [],
};
