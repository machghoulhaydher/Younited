// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#1A5FBE',
          dark:    '#0C447C',
          light:   '#E6F1FB',
        },
        gold: {
          DEFAULT: '#D4A017',
          dark:    '#854F0B',
          light:   '#FAEEDA',
        },
        success: {
          DEFAULT: '#1D9E75',
          light:   '#E1F5EE',
          dark:    '#0F6E56',
        },
        danger: {
          DEFAULT: '#993C1D',
          light:   '#FAECE7',
          dark:    '#7A2E13',
        },
      },
      borderRadius: {
        xl:  '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
      boxShadow: {
        card: '0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)',
        blue: '0 4px 20px rgba(26,95,190,0.2)',
        gold: '0 4px 20px rgba(212,160,23,0.25)',
      },
    },
  },
  plugins: [],
}

export default config
