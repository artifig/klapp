import type { Config } from "tailwindcss";
import { defaultTheme } from "./src/lib/theme";

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
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        accent: "var(--accent)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        border: "var(--border)",
        input: "var(--input)",
        success: "var(--success)",
        warning: "var(--warning)",
        error: "var(--error)",
        gradient1: "var(--gradient1)",
        gradient2: "var(--gradient2)",
        gradient3: "var(--gradient3)",
      },
      borderRadius: {
        sm: defaultTheme.borderRadius.sm,
        md: defaultTheme.borderRadius.md,
        lg: defaultTheme.borderRadius.lg,
        full: defaultTheme.borderRadius.full,
      },
      screens: {
        sm: defaultTheme.breakpoints.sm,
        md: defaultTheme.breakpoints.md,
        lg: defaultTheme.breakpoints.lg,
        xl: defaultTheme.breakpoints.xl,
        "2xl": defaultTheme.breakpoints["2xl"],
      },
      fontFamily: {
        sans: ['"Helvetica Neue"', 'Arial', 'Helvetica', 'sans-serif'],
        condensed: ['"Helvetica Neue Condensed Bold"', '"Arial Narrow Bold"', 'sans-serif'],
      },
      clipPath: {
        'diagonal-bottom': 'polygon(0 0, 100% 0, 100% 90%, 0 100%)',
        'diagonal-top': 'polygon(0 10%, 100% 0, 100% 100%, 0 100%)',
        'diagonal-card': 'polygon(0 0, 100% 0, 100% calc(100% - 1rem), calc(100% - 1rem) 100%, 0 100%)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, var(--gradient1), var(--gradient2), var(--gradient3))',
      },
      boxShadow: {
        'modern': '0 4px 20px rgba(0, 0, 0, 0.05)',
        'modern-hover': '0 10px 25px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [
    function({ addUtilities }: { addUtilities: Function }) {
      const newUtilities = {
        '.clip-diagonal-bottom': {
          clipPath: 'polygon(0 0, 100% 0, 100% 90%, 0 100%)',
        },
        '.clip-diagonal-top': {
          clipPath: 'polygon(0 10%, 100% 0, 100% 100%, 0 100%)',
        },
        '.clip-diagonal-card': {
          clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 1rem), calc(100% - 1rem) 100%, 0 100%)',
        },
      };
      addUtilities(newUtilities);
    }
  ],
} satisfies Config;
