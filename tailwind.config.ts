import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        Schoolbell: ["Schoolbell", "sans-serif"],
      },
      colors: {
        text: {
          gray: "#8A8A8A",
          cta: "#1A2B4C",
          extralight: "#9D9D9D",
          lightblue: "#6EA6E1",
        },
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
