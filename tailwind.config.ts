import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        furcho: {
          brown: "#633719",
          "dark-brown": "#3B2418",
          walnut: "#24150E",
          gold: "#C58B45",
          "gold-light": "#DFA86A",
          cream: "#FAF5ED",
          beige: "#EFE3D4",
          "beige-dark": "#E2D1BC",
          surface: "#FFFFFF",
          charcoal: "#29221D",
          muted: "#6E5D52",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        heading: ["var(--font-poppins)", "system-ui", "sans-serif"],
        nav: ["var(--font-poppins)", "system-ui", "sans-serif"],
        button: ["var(--font-poppins)", "system-ui", "sans-serif"],
        price: ["var(--font-poppins)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(59, 36, 24, 0.06)",
        card: "0 8px 28px -4px rgba(59, 36, 24, 0.08)",
        elevated: "0 16px 40px -6px rgba(59, 36, 24, 0.14)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
