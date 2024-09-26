/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        custom: "0 4px 6px rgba(0, 0, 0, 0.384)",
      },
      fontFamily: {
        mundo: "url('./src/assets/Quicksand-VariableFont_wght.ttf)",
      },
      screens: {
        "3xl": "1600px",
        "4xl": "1800px",
        "5xl": "1900px",
      },
    },
  },
  plugins: [],
};
