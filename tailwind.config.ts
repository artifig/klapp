import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ['Helvetica Neue', 'Arial', 'sans-serif'],
        'helvetica-neue': ['Helvetica Neue', 'Arial', 'sans-serif'],
        'helvetica-neue-bold': ['Helvetica Neue Bold', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'display': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h1': ['2.5rem', { lineHeight: '1.25', letterSpacing: '-0.015em', fontWeight: '700' }],
        'h2': ['2rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '700' }],
        'h3': ['1.75rem', { lineHeight: '1.35', letterSpacing: '-0.005em', fontWeight: '700' }],
        'h4': ['1.5rem', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '700' }],
        'h5': ['1.25rem', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '700' }],
        'h6': ['1.125rem', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '700' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6', letterSpacing: '0' }],
        'body': ['1rem', { lineHeight: '1.6', letterSpacing: '0' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0' }],
      },
    },
  },
  plugins: [],
} satisfies Config;
