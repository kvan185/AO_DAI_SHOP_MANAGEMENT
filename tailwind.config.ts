import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#fdf2f8',
          DEFAULT: '#db2777',
          dark: '#9d174d',
        },
        fashion: {
          gold: '#D4AF37',
          silk: '#F8F8FF',
          burgundy: '#800020',
        }
      },
    },
  },
  plugins: [],
};
export default config;
