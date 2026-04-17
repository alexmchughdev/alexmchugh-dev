import type { Config } from 'tailwindcss';

// Catppuccin Mocha
// https://github.com/catppuccin/catppuccin
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#1e1e2e', // base
          elevated: '#181825', // mantle
          card: '#313244', // surface0
        },
        ink: {
          DEFAULT: '#cdd6f4', // text
          muted: '#a6adc8', // subtext0
          faint: '#6c7086', // overlay0
        },
        accent: {
          DEFAULT: '#89b4fa', // blue
          dim: '#74c7ec', // sapphire
        },
        line: '#45475a', // surface1
        prompt: '#cba6f7', // mauve
        path: '#89b4fa', // blue
        pink: '#f5c2e7', // pink
        peach: '#fab387', // peach
        mauve: '#cba6f7',
        green: '#a6e3a1',
      },
      fontFamily: {
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui'],
      },
      animation: {
        'cursor-blink': 'blink 1.05s step-end infinite',
      },
      keyframes: {
        blink: {
          '0%, 50%': { opacity: '1' },
          '50.01%, 100%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
