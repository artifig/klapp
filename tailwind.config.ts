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
        // Base colors
        background: "var(--background)",
        foreground: "var(--foreground)",
        
        // Tehnopol brand colors
        primary: {
          DEFAULT: "var(--primary)",
          dark: "var(--primary-dark)",
          light: "var(--primary-light)",
        },
        secondary: "var(--secondary)",
        accent: "var(--accent)",
        
        // UI Colors
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        card: {
          DEFAULT: "var(--card-background)",
          foreground: "var(--card-foreground)",
        },
        border: "var(--border)",
      },
      fontFamily: {
        sans: ['Helvetica Neue', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        none: '0',
        sm: '0.125rem',
        DEFAULT: '0',
        md: '0.25rem',
        lg: '0.5rem',
      },
      spacing: {
        xs: 'var(--spacing-xs)',
        sm: 'var(--spacing-sm)',
        md: 'var(--spacing-md)',
        lg: 'var(--spacing-lg)',
        xl: 'var(--spacing-xl)',
      },
      backgroundImage: {
        'tehnopol-gradient': 'linear-gradient(135deg, var(--primary-dark), var(--primary), var(--primary-light))',
      },
    },
  },
  plugins: [],
} satisfies Config;
