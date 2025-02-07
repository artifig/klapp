const tehnopolTheme = {
    extend: {
        colors: {
            tehnopol: {
                DEFAULT: "#EB8B00", // Primary Orange - Pantone 144 C
                dark: "#FF6600",    // Dark Orange - Pantone 1665 C
                light: "#FFCC00",   // Light Orange - Pantone 130 C
                gray: "#4D4D4D",    // Gray - Pantone Cool Gray 11 C
                green: "#70AF34",   // Green - Pantone 3529C
            },
        },
        fontFamily: {
            sans: [
                "Helvetica Neue",
                "Arial",
                "ui-sans-serif",
                "system-ui",
                "-apple-system",
                "BlinkMacSystemFont",
                "Segoe UI",
                "Roboto",
                "sans-serif",
            ],
            condensed: [
                "Helvetica Neue Condensed",
                "Arial Narrow",
                "Arial",
                "sans-serif",
            ],
        },
        borderRadius: {
            none: '0',
            sm: '1px',
            DEFAULT: '1px',
            md: '2px',
            lg: '3px',
            xl: '4px',
            full: '9999px',
        },
        // Brand angles and spacing
        backgroundImage: {
            'tehnopol-gradient': 'linear-gradient(135deg, #FF6600, #EB8B00, #FFCC00)',
        },
    },
};

export { tehnopolTheme };