import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  darkmode: "media",
  theme: {
    extend: {
      daisyui: {
        themes: ["light", "dark", "pastel"],
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("daisyui"),
  ],
}

