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
    },
  },
  plugins: [],
} satisfies Config;
