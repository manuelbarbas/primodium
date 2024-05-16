/** @type {import('tailwindcss').Config} */
import daisyui from "daisyui";
import colors from "tailwindcss/colors";
import tailwindAnimate from "tailwindcss-animate";
import defaultTheme from "tailwindcss/defaultTheme";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import patternPlugin from "tailwindcss-hero-patterns";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import patterns from "tailwindcss-hero-patterns/src/patterns";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    heroPatternsOpacities: ["0", "10", "25", "50", "90", "100"],
    heroPatterns: {
      graphpaper: patterns.graphpaper,
      skulls: patterns.skulls,
      topography: patterns.topography,
    },
    extend: {
      fontFamily: {
        mono: ["Space Mono", ...defaultTheme.fontFamily.mono],
        pixel: ["Silkscreen", ...defaultTheme.fontFamily.mono],
      },
      backgroundColor: {
        glass: "rgb(255 255 255 / .05)",
      },
      width: {
        108: "27rem",
        120: "30rem",
        132: "33rem",
      },
      dropShadow: {
        hard: "2px 2px 0px rgba(0, 0, 0, 0.5)", // Add your custom shadow here
      },
      animation: {
        float: "float 5s ease-in-out infinite",
      },
    },
  },
  daisyui: {
    themes: [
      {
        base: {
          primary: colors.cyan[900],
          secondary: colors.cyan[700],
          accent: colors.cyan[400],
          neutral: colors.slate[900],
          "base-100": colors.slate[800],
          info: colors.indigo[800],
          success: colors.emerald[600],
          warning: colors.yellow[600],
          error: "#A8375D",

          "--rounded-box": "0rem", // border radius rounded-box utility class, used in card and other large boxes
          "--rounded-btn": "0rem", // border radius rounded-btn utility class, used in buttons and similar element
          "--rounded-badge": "0rem", // border radius rounded-badge utility class, used in badges and similar
          "--animation-btn": "0s", // duration of animation when you click on button
          "--animation-input": "0.2s", // duration of animation for inputs like checkbox, toggle, radio, etc
          "--btn-text-case": "uppercase", // set default text transform for buttons
          "--btn-focus-scale": "1", // scale transform of button when you focus on it
          "--border-btn": "1px", // border width of buttons
          "--tab-border": "1px", // border width of tabs
          "--tab-radius": "0.5rem", // border radius of tabs
        },
      },
    ],
    darkTheme: "base",
  },
  plugins: [daisyui, patternPlugin, tailwindAnimate],
};
