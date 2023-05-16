/** @type {import('tailwindcss').Config} */
module.exports = {
  important: true,
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
  variants: {
    extend: {
      brightness: ["hover"],
    },
  },
};
