/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
  daisyui: {
    themes: [
      {
        dark: {
          primary: "#3f51b5",
          secondary: "#4ba6ee",
          accent: "#03a9f4",
          neutral: "#1f2937",
          "base-100": "#000011",
          info: "#4994ec",
          success: "#67ad5b",
          warning: "#f5c344",
          error: "#e15241",
        },
      },
      {
        light: {
          primary: "#3f51b5",
          secondary: "#4ba6ee",
          accent: "#03a9f4",
          neutral: "#4b5563",
          "base-100": "#ffffff",
          info: "#4994ec",
          success: "#67ad5b",
          warning: "#f5c344",
          error: "#e15241",
        },
      },
    ],
  },
};
