import type { Config } from 'tailwindcss';

const config: Config = {
  theme: {
    extend: {
      colors: {
        primary: {
          sage: '#6B8F71',
        },
        dark: {
          forest: '#294236',
        },
        background: {
          cream: '#F7F3EA',
        },
        surface: {
          white: '#FFFFFF',
        },
        accent: {
          terracotta: '#C9825A',
        },
        text: {
          charcoal: '#252525',
        },
      },
    },
  },
};

export default config;
