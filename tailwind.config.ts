import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#151515",
        bone: "#f4f0e8",
        paper: "#fbfaf7",
        zwilling: "#e30613",
        steel: "#757575",
      },
      boxShadow: {
        soft: "0 24px 80px rgba(24, 22, 18, 0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
