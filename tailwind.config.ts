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
          DEFAULT: "#37B0FE",
          pressed: "#32A3DE",
        },
        secondary: "#65DB41",
        background: "#F6FBFF",
      },
    },
  },
  plugins: [],
};
export default config;
