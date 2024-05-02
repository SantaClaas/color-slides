import plugin from "tailwindcss/plugin";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [
    function ({ addVariant }) {
      addVariant("in-fullscreen", [
        // Fullscreen element before
        ":fullscreen &",
        // Other variants that can be used but are just bloat if not used
        // // or the element itself
        // "&:fullscreen",
        // // any sibling,
        // "& ~ :fullscreen",
        // ":fullscreen ~ &",
        // // or after
        // "& :fullscreen",
      ]);
    },
  ],
};
