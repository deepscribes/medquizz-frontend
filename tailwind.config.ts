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
        primary: {
          light: "#F6FBFF",
          DEFAULT: "#37B0FE",
          pressed: "#32A3DE",
        },
        cta: "#1A2B4C",
        secondary: "#65DB41",
        background: "#F6FBFF",
        cardborder: "#B3B3B3",
      },
    },
  },
  plugins: [],
};
export default config;
