import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: '#C9A84C',
        surface: '#1A1A1A',
        surface2: '#252525',
        surface3: '#2F2F2F',
      },
    },
  },
  plugins: [],
};

export default config;
