// vite.config.ts
import path from "path";
import { sentryVitePlugin } from "file:///Users/nabeel/Developer/web3/primodium/node_modules/.pnpm/@sentry+vite-plugin@2.10.3/node_modules/@sentry/vite-plugin/dist/esm/index.mjs";
import react from "file:///Users/nabeel/Developer/web3/primodium/node_modules/.pnpm/@vitejs+plugin-react@3.1.0_vite@3.2.8/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { defineConfig } from "file:///Users/nabeel/Developer/web3/primodium/node_modules/.pnpm/vite@3.2.8_@types+node@14.18.33/node_modules/vite/dist/node/index.js";
import { comlink } from "file:///Users/nabeel/Developer/web3/primodium/node_modules/.pnpm/vite-plugin-comlink@3.0.5_comlink@4.4.1_vite@3.2.8/node_modules/vite-plugin-comlink/dist/index.js";
import tsconfigPaths from "file:///Users/nabeel/Developer/web3/primodium/node_modules/.pnpm/vite-tsconfig-paths@4.3.1_typescript@5.3.3_vite@3.2.8/node_modules/vite-tsconfig-paths/dist/index.mjs";

// postcss.config.ts
import tailwind from "file:///Users/nabeel/Developer/web3/primodium/node_modules/.pnpm/tailwindcss@3.4.1/node_modules/tailwindcss/lib/index.js";
import autoprefixer from "file:///Users/nabeel/Developer/web3/primodium/node_modules/.pnpm/autoprefixer@10.4.17_postcss@8.4.33/node_modules/autoprefixer/lib/autoprefixer.js";

// tailwind.config.ts
import daisyui from "file:///Users/nabeel/Developer/web3/primodium/node_modules/.pnpm/daisyui@3.9.4/node_modules/daisyui/src/index.js";
import colors from "file:///Users/nabeel/Developer/web3/primodium/node_modules/.pnpm/tailwindcss@3.4.1/node_modules/tailwindcss/colors.js";
import tailwindAnimate from "file:///Users/nabeel/Developer/web3/primodium/node_modules/.pnpm/tailwindcss-animate@1.0.7_tailwindcss@3.4.1/node_modules/tailwindcss-animate/index.js";
import defaultTheme from "file:///Users/nabeel/Developer/web3/primodium/node_modules/.pnpm/tailwindcss@3.4.1/node_modules/tailwindcss/defaultTheme.js";
import patternPlugin from "file:///Users/nabeel/Developer/web3/primodium/node_modules/.pnpm/tailwindcss-hero-patterns@0.1.2/node_modules/tailwindcss-hero-patterns/src/index.js";
import patterns from "file:///Users/nabeel/Developer/web3/primodium/node_modules/.pnpm/tailwindcss-hero-patterns@0.1.2/node_modules/tailwindcss-hero-patterns/src/patterns.js";
var tailwind_config_default = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    heroPatternsOpacities: ["0", "10", "25", "50", "90", "100"],
    heroPatterns: {
      graphpaper: patterns.graphpaper,
      plus: patterns.plus,
      topography: patterns.topography
    },
    extend: {
      fontFamily: {
        mono: ["Space Mono", ...defaultTheme.fontFamily.mono],
        pixel: ["Silkscreen", ...defaultTheme.fontFamily.mono]
      },
      width: {
        108: "27rem",
        120: "30rem",
        132: "33rem"
      },
      dropShadow: {
        hard: "5px 5px 0px rgba(0, 0, 0, 0.5)"
      },
      animation: {
        float: "float 5s ease-in-out infinite"
      }
    }
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
          info: colors.indigo[400],
          success: colors.emerald[600],
          warning: colors.yellow[600],
          error: "#A8375D",
          "--rounded-box": "0rem",
          "--rounded-btn": "0rem",
          "--rounded-badge": "0rem",
          "--animation-btn": "0s",
          "--animation-input": "0.2s",
          "--btn-text-case": "uppercase",
          "--btn-focus-scale": "1",
          "--border-btn": "1px",
          "--tab-border": "1px",
          "--tab-radius": "0.5rem"
        },
        new: {
          primary: colors.cyan[900],
          secondary: "#3C8EA1",
          accent: colors.cyan[400],
          neutral: colors.slate[900],
          "base-100": colors.slate[800],
          info: "#2B2770",
          success: colors.emerald[600],
          warning: colors.yellow[600],
          error: "#A8375D",
          "--rounded-box": "0rem",
          "--rounded-btn": "0rem",
          "--rounded-badge": "0rem",
          "--animation-btn": "0s",
          "--animation-input": "0s",
          "--btn-text-case": "uppercase",
          "--btn-focus-scale": "1",
          "--border-btn": "1px",
          "--tab-border": "1px",
          "--tab-radius": "0.5rem"
        }
      }
    ],
    darkTheme: "base"
  },
  plugins: [daisyui, patternPlugin, tailwindAnimate]
};

// postcss.config.ts
var postcss_config_default = {
  plugins: [tailwind(tailwind_config_default), autoprefixer]
};

// vite.config.ts
var __vite_injected_original_dirname = "/Users/nabeel/Developer/web3/primodium/packages/client";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    comlink(),
    tsconfigPaths(),
    sentryVitePlugin({
      org: "primodium",
      project: "primodium"
    })
  ],
  server: {
    port: 3e3,
    fs: {
      strict: false
    }
  },
  worker: {
    plugins: [comlink()]
  },
  build: {
    rollupOptions: {
      external: [/^contracts:.*/],
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          mud: [
            "@latticexyz/common",
            "@latticexyz/protocol-parser",
            "@latticexyz/dev-tools",
            "@latticexyz/react",
            "@latticexyz/recs",
            "@latticexyz/schema-type",
            "@latticexyz/store",
            "@latticexyz/store-sync",
            "@latticexyz/utils",
            "@latticexyz/world"
          ]
        }
      }
    },
    target: "ES2022"
  },
  optimizeDeps: {
    esbuildOptions: {
      supported: {
        bigint: true
      }
    },
    include: [
      "proxy-deep",
      "bn.js",
      "js-sha3",
      "hash.js",
      "bech32",
      "long",
      "protobufjs/minimal",
      "debug",
      "is-observable",
      "nice-grpc-web",
      "@improbable-eng/grpc-web"
    ]
  },
  envPrefix: "PRI_",
  envDir: "../../",
  css: {
    postcss: postcss_config_default
  },
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src"),
      "@game": path.resolve(__vite_injected_original_dirname, "./src/game")
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAicG9zdGNzcy5jb25maWcudHMiLCAidGFpbHdpbmQuY29uZmlnLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL25hYmVlbC9EZXZlbG9wZXIvd2ViMy9wcmltb2RpdW0vcGFja2FnZXMvY2xpZW50XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvbmFiZWVsL0RldmVsb3Blci93ZWIzL3ByaW1vZGl1bS9wYWNrYWdlcy9jbGllbnQvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL25hYmVlbC9EZXZlbG9wZXIvd2ViMy9wcmltb2RpdW0vcGFja2FnZXMvY2xpZW50L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IHNlbnRyeVZpdGVQbHVnaW4gfSBmcm9tIFwiQHNlbnRyeS92aXRlLXBsdWdpblwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCB7IGNvbWxpbmsgfSBmcm9tIFwidml0ZS1wbHVnaW4tY29tbGlua1wiO1xuaW1wb3J0IHRzY29uZmlnUGF0aHMgZnJvbSBcInZpdGUtdHNjb25maWctcGF0aHNcIjtcbmltcG9ydCBwb3N0Y3NzIGZyb20gXCIuL3Bvc3Rjc3MuY29uZmlnXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIGNvbWxpbmsoKSxcbiAgICB0c2NvbmZpZ1BhdGhzKCksXG4gICAgc2VudHJ5Vml0ZVBsdWdpbih7XG4gICAgICBvcmc6IFwicHJpbW9kaXVtXCIsXG4gICAgICBwcm9qZWN0OiBcInByaW1vZGl1bVwiLFxuICAgIH0pLFxuICBdLFxuICBzZXJ2ZXI6IHtcbiAgICBwb3J0OiAzMDAwLFxuICAgIGZzOiB7XG4gICAgICBzdHJpY3Q6IGZhbHNlLFxuICAgIH0sXG4gIH0sXG4gIHdvcmtlcjoge1xuICAgIHBsdWdpbnM6IFtjb21saW5rKCldLFxuICB9LFxuICBidWlsZDoge1xuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIGV4dGVybmFsOiBbL15jb250cmFjdHM6LiovXSxcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBtYW51YWxDaHVua3M6IHtcbiAgICAgICAgICByZWFjdDogW1wicmVhY3RcIiwgXCJyZWFjdC1kb21cIl0sXG4gICAgICAgICAgbXVkOiBbXG4gICAgICAgICAgICBcIkBsYXR0aWNleHl6L2NvbW1vblwiLFxuICAgICAgICAgICAgXCJAbGF0dGljZXh5ei9wcm90b2NvbC1wYXJzZXJcIixcbiAgICAgICAgICAgIFwiQGxhdHRpY2V4eXovZGV2LXRvb2xzXCIsXG4gICAgICAgICAgICBcIkBsYXR0aWNleHl6L3JlYWN0XCIsXG4gICAgICAgICAgICBcIkBsYXR0aWNleHl6L3JlY3NcIixcbiAgICAgICAgICAgIFwiQGxhdHRpY2V4eXovc2NoZW1hLXR5cGVcIixcbiAgICAgICAgICAgIFwiQGxhdHRpY2V4eXovc3RvcmVcIixcbiAgICAgICAgICAgIFwiQGxhdHRpY2V4eXovc3RvcmUtc3luY1wiLFxuICAgICAgICAgICAgXCJAbGF0dGljZXh5ei91dGlsc1wiLFxuICAgICAgICAgICAgXCJAbGF0dGljZXh5ei93b3JsZFwiLFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gICAgdGFyZ2V0OiBcIkVTMjAyMlwiLFxuICB9LFxuXG4gIG9wdGltaXplRGVwczoge1xuICAgIGVzYnVpbGRPcHRpb25zOiB7XG4gICAgICBzdXBwb3J0ZWQ6IHtcbiAgICAgICAgYmlnaW50OiB0cnVlLFxuICAgICAgfSxcbiAgICB9LFxuXG4gICAgaW5jbHVkZTogW1xuICAgICAgXCJwcm94eS1kZWVwXCIsXG4gICAgICBcImJuLmpzXCIsXG4gICAgICBcImpzLXNoYTNcIixcbiAgICAgIFwiaGFzaC5qc1wiLFxuICAgICAgXCJiZWNoMzJcIixcbiAgICAgIFwibG9uZ1wiLFxuICAgICAgXCJwcm90b2J1ZmpzL21pbmltYWxcIixcbiAgICAgIFwiZGVidWdcIixcbiAgICAgIFwiaXMtb2JzZXJ2YWJsZVwiLFxuICAgICAgXCJuaWNlLWdycGMtd2ViXCIsXG4gICAgICBcIkBpbXByb2JhYmxlLWVuZy9ncnBjLXdlYlwiLFxuICAgIF0sXG4gIH0sXG4gIGVudlByZWZpeDogXCJQUklfXCIsXG4gIGVudkRpcjogXCIuLi8uLi9cIixcbiAgY3NzOiB7XG4gICAgcG9zdGNzcyxcbiAgfSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcbiAgICAgIFwiQGdhbWVcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyYy9nYW1lXCIpLFxuICAgIH0sXG4gIH0sXG59KTtcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL25hYmVlbC9EZXZlbG9wZXIvd2ViMy9wcmltb2RpdW0vcGFja2FnZXMvY2xpZW50XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvbmFiZWVsL0RldmVsb3Blci93ZWIzL3ByaW1vZGl1bS9wYWNrYWdlcy9jbGllbnQvcG9zdGNzcy5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL25hYmVlbC9EZXZlbG9wZXIvd2ViMy9wcmltb2RpdW0vcGFja2FnZXMvY2xpZW50L3Bvc3Rjc3MuY29uZmlnLnRzXCI7aW1wb3J0IHRhaWx3aW5kIGZyb20gXCJ0YWlsd2luZGNzc1wiO1xuaW1wb3J0IGF1dG9wcmVmaXhlciBmcm9tIFwiYXV0b3ByZWZpeGVyXCI7XG5pbXBvcnQgdGFpbHdpbmRDb25maWcgZnJvbSBcIi4vdGFpbHdpbmQuY29uZmlnLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgcGx1Z2luczogW3RhaWx3aW5kKHRhaWx3aW5kQ29uZmlnKSwgYXV0b3ByZWZpeGVyXSxcbn07XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9uYWJlZWwvRGV2ZWxvcGVyL3dlYjMvcHJpbW9kaXVtL3BhY2thZ2VzL2NsaWVudFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL25hYmVlbC9EZXZlbG9wZXIvd2ViMy9wcmltb2RpdW0vcGFja2FnZXMvY2xpZW50L3RhaWx3aW5kLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvbmFiZWVsL0RldmVsb3Blci93ZWIzL3ByaW1vZGl1bS9wYWNrYWdlcy9jbGllbnQvdGFpbHdpbmQuY29uZmlnLnRzXCI7LyoqIEB0eXBlIHtpbXBvcnQoJ3RhaWx3aW5kY3NzJykuQ29uZmlnfSAqL1xuaW1wb3J0IGRhaXN5dWkgZnJvbSBcImRhaXN5dWlcIjtcbmltcG9ydCBjb2xvcnMgZnJvbSBcInRhaWx3aW5kY3NzL2NvbG9yc1wiO1xuaW1wb3J0IHRhaWx3aW5kQW5pbWF0ZSBmcm9tIFwidGFpbHdpbmRjc3MtYW5pbWF0ZVwiO1xuaW1wb3J0IGRlZmF1bHRUaGVtZSBmcm9tIFwidGFpbHdpbmRjc3MvZGVmYXVsdFRoZW1lXCI7XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcbi8vIEB0cy1pZ25vcmVcbmltcG9ydCBwYXR0ZXJuUGx1Z2luIGZyb20gXCJ0YWlsd2luZGNzcy1oZXJvLXBhdHRlcm5zXCI7XG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50XG4vLyBAdHMtaWdub3JlXG5pbXBvcnQgcGF0dGVybnMgZnJvbSBcInRhaWx3aW5kY3NzLWhlcm8tcGF0dGVybnMvc3JjL3BhdHRlcm5zXCI7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgY29udGVudDogW1wiLi9pbmRleC5odG1sXCIsIFwiLi9zcmMvKiovKi57anMsdHMsanN4LHRzeH1cIl0sXG4gIHRoZW1lOiB7XG4gICAgaGVyb1BhdHRlcm5zT3BhY2l0aWVzOiBbXCIwXCIsIFwiMTBcIiwgXCIyNVwiLCBcIjUwXCIsIFwiOTBcIiwgXCIxMDBcIl0sXG4gICAgaGVyb1BhdHRlcm5zOiB7XG4gICAgICBncmFwaHBhcGVyOiBwYXR0ZXJucy5ncmFwaHBhcGVyLFxuICAgICAgcGx1czogcGF0dGVybnMucGx1cyxcbiAgICAgIHRvcG9ncmFwaHk6IHBhdHRlcm5zLnRvcG9ncmFwaHksXG4gICAgfSxcbiAgICBleHRlbmQ6IHtcbiAgICAgIGZvbnRGYW1pbHk6IHtcbiAgICAgICAgbW9ubzogW1wiU3BhY2UgTW9ub1wiLCAuLi5kZWZhdWx0VGhlbWUuZm9udEZhbWlseS5tb25vXSxcbiAgICAgICAgcGl4ZWw6IFtcIlNpbGtzY3JlZW5cIiwgLi4uZGVmYXVsdFRoZW1lLmZvbnRGYW1pbHkubW9ub10sXG4gICAgICB9LFxuICAgICAgd2lkdGg6IHtcbiAgICAgICAgMTA4OiBcIjI3cmVtXCIsXG4gICAgICAgIDEyMDogXCIzMHJlbVwiLFxuICAgICAgICAxMzI6IFwiMzNyZW1cIixcbiAgICAgIH0sXG4gICAgICBkcm9wU2hhZG93OiB7XG4gICAgICAgIGhhcmQ6IFwiNXB4IDVweCAwcHggcmdiYSgwLCAwLCAwLCAwLjUpXCIsIC8vIEFkZCB5b3VyIGN1c3RvbSBzaGFkb3cgaGVyZVxuICAgICAgfSxcbiAgICAgIGFuaW1hdGlvbjoge1xuICAgICAgICBmbG9hdDogXCJmbG9hdCA1cyBlYXNlLWluLW91dCBpbmZpbml0ZVwiLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICBkYWlzeXVpOiB7XG4gICAgdGhlbWVzOiBbXG4gICAgICB7XG4gICAgICAgIGJhc2U6IHtcbiAgICAgICAgICBwcmltYXJ5OiBjb2xvcnMuY3lhbls5MDBdLFxuICAgICAgICAgIHNlY29uZGFyeTogY29sb3JzLmN5YW5bNzAwXSxcbiAgICAgICAgICBhY2NlbnQ6IGNvbG9ycy5jeWFuWzQwMF0sXG4gICAgICAgICAgbmV1dHJhbDogY29sb3JzLnNsYXRlWzkwMF0sXG4gICAgICAgICAgXCJiYXNlLTEwMFwiOiBjb2xvcnMuc2xhdGVbODAwXSxcbiAgICAgICAgICBpbmZvOiBjb2xvcnMuaW5kaWdvWzQwMF0sXG4gICAgICAgICAgc3VjY2VzczogY29sb3JzLmVtZXJhbGRbNjAwXSxcbiAgICAgICAgICB3YXJuaW5nOiBjb2xvcnMueWVsbG93WzYwMF0sXG4gICAgICAgICAgZXJyb3I6IFwiI0E4Mzc1RFwiLFxuXG4gICAgICAgICAgXCItLXJvdW5kZWQtYm94XCI6IFwiMHJlbVwiLCAvLyBib3JkZXIgcmFkaXVzIHJvdW5kZWQtYm94IHV0aWxpdHkgY2xhc3MsIHVzZWQgaW4gY2FyZCBhbmQgb3RoZXIgbGFyZ2UgYm94ZXNcbiAgICAgICAgICBcIi0tcm91bmRlZC1idG5cIjogXCIwcmVtXCIsIC8vIGJvcmRlciByYWRpdXMgcm91bmRlZC1idG4gdXRpbGl0eSBjbGFzcywgdXNlZCBpbiBidXR0b25zIGFuZCBzaW1pbGFyIGVsZW1lbnRcbiAgICAgICAgICBcIi0tcm91bmRlZC1iYWRnZVwiOiBcIjByZW1cIiwgLy8gYm9yZGVyIHJhZGl1cyByb3VuZGVkLWJhZGdlIHV0aWxpdHkgY2xhc3MsIHVzZWQgaW4gYmFkZ2VzIGFuZCBzaW1pbGFyXG4gICAgICAgICAgXCItLWFuaW1hdGlvbi1idG5cIjogXCIwc1wiLCAvLyBkdXJhdGlvbiBvZiBhbmltYXRpb24gd2hlbiB5b3UgY2xpY2sgb24gYnV0dG9uXG4gICAgICAgICAgXCItLWFuaW1hdGlvbi1pbnB1dFwiOiBcIjAuMnNcIiwgLy8gZHVyYXRpb24gb2YgYW5pbWF0aW9uIGZvciBpbnB1dHMgbGlrZSBjaGVja2JveCwgdG9nZ2xlLCByYWRpbywgZXRjXG4gICAgICAgICAgXCItLWJ0bi10ZXh0LWNhc2VcIjogXCJ1cHBlcmNhc2VcIiwgLy8gc2V0IGRlZmF1bHQgdGV4dCB0cmFuc2Zvcm0gZm9yIGJ1dHRvbnNcbiAgICAgICAgICBcIi0tYnRuLWZvY3VzLXNjYWxlXCI6IFwiMVwiLCAvLyBzY2FsZSB0cmFuc2Zvcm0gb2YgYnV0dG9uIHdoZW4geW91IGZvY3VzIG9uIGl0XG4gICAgICAgICAgXCItLWJvcmRlci1idG5cIjogXCIxcHhcIiwgLy8gYm9yZGVyIHdpZHRoIG9mIGJ1dHRvbnNcbiAgICAgICAgICBcIi0tdGFiLWJvcmRlclwiOiBcIjFweFwiLCAvLyBib3JkZXIgd2lkdGggb2YgdGFic1xuICAgICAgICAgIFwiLS10YWItcmFkaXVzXCI6IFwiMC41cmVtXCIsIC8vIGJvcmRlciByYWRpdXMgb2YgdGFic1xuICAgICAgICB9LFxuICAgICAgICBuZXc6IHtcbiAgICAgICAgICBwcmltYXJ5OiBjb2xvcnMuY3lhbls5MDBdLFxuICAgICAgICAgIHNlY29uZGFyeTogXCIjM0M4RUExXCIsXG4gICAgICAgICAgYWNjZW50OiBjb2xvcnMuY3lhbls0MDBdLFxuICAgICAgICAgIG5ldXRyYWw6IGNvbG9ycy5zbGF0ZVs5MDBdLFxuICAgICAgICAgIFwiYmFzZS0xMDBcIjogY29sb3JzLnNsYXRlWzgwMF0sXG4gICAgICAgICAgaW5mbzogXCIjMkIyNzcwXCIsXG4gICAgICAgICAgc3VjY2VzczogY29sb3JzLmVtZXJhbGRbNjAwXSxcbiAgICAgICAgICB3YXJuaW5nOiBjb2xvcnMueWVsbG93WzYwMF0sXG4gICAgICAgICAgZXJyb3I6IFwiI0E4Mzc1RFwiLFxuXG4gICAgICAgICAgXCItLXJvdW5kZWQtYm94XCI6IFwiMHJlbVwiLCAvLyBib3JkZXIgcmFkaXVzIHJvdW5kZWQtYm94IHV0aWxpdHkgY2xhc3MsIHVzZWQgaW4gY2FyZCBhbmQgb3RoZXIgbGFyZ2UgYm94ZXNcbiAgICAgICAgICBcIi0tcm91bmRlZC1idG5cIjogXCIwcmVtXCIsIC8vIGJvcmRlciByYWRpdXMgcm91bmRlZC1idG4gdXRpbGl0eSBjbGFzcywgdXNlZCBpbiBidXR0b25zIGFuZCBzaW1pbGFyIGVsZW1lbnRcbiAgICAgICAgICBcIi0tcm91bmRlZC1iYWRnZVwiOiBcIjByZW1cIiwgLy8gYm9yZGVyIHJhZGl1cyByb3VuZGVkLWJhZGdlIHV0aWxpdHkgY2xhc3MsIHVzZWQgaW4gYmFkZ2VzIGFuZCBzaW1pbGFyXG4gICAgICAgICAgXCItLWFuaW1hdGlvbi1idG5cIjogXCIwc1wiLCAvLyBkdXJhdGlvbiBvZiBhbmltYXRpb24gd2hlbiB5b3UgY2xpY2sgb24gYnV0dG9uXG4gICAgICAgICAgXCItLWFuaW1hdGlvbi1pbnB1dFwiOiBcIjBzXCIsIC8vIGR1cmF0aW9uIG9mIGFuaW1hdGlvbiBmb3IgaW5wdXRzIGxpa2UgY2hlY2tib3gsIHRvZ2dsZSwgcmFkaW8sIGV0Y1xuICAgICAgICAgIFwiLS1idG4tdGV4dC1jYXNlXCI6IFwidXBwZXJjYXNlXCIsIC8vIHNldCBkZWZhdWx0IHRleHQgdHJhbnNmb3JtIGZvciBidXR0b25zXG4gICAgICAgICAgXCItLWJ0bi1mb2N1cy1zY2FsZVwiOiBcIjFcIiwgLy8gc2NhbGUgdHJhbnNmb3JtIG9mIGJ1dHRvbiB3aGVuIHlvdSBmb2N1cyBvbiBpdFxuICAgICAgICAgIFwiLS1ib3JkZXItYnRuXCI6IFwiMXB4XCIsIC8vIGJvcmRlciB3aWR0aCBvZiBidXR0b25zXG4gICAgICAgICAgXCItLXRhYi1ib3JkZXJcIjogXCIxcHhcIiwgLy8gYm9yZGVyIHdpZHRoIG9mIHRhYnNcbiAgICAgICAgICBcIi0tdGFiLXJhZGl1c1wiOiBcIjAuNXJlbVwiLCAvLyBib3JkZXIgcmFkaXVzIG9mIHRhYnNcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgXSxcbiAgICBkYXJrVGhlbWU6IFwiYmFzZVwiLFxuICB9LFxuICBwbHVnaW5zOiBbZGFpc3l1aSwgcGF0dGVyblBsdWdpbiwgdGFpbHdpbmRBbmltYXRlXSxcbn07XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQW9WLE9BQU8sVUFBVTtBQUNyVyxTQUFTLHdCQUF3QjtBQUNqQyxPQUFPLFdBQVc7QUFDbEIsU0FBUyxvQkFBb0I7QUFDN0IsU0FBUyxlQUFlO0FBQ3hCLE9BQU8sbUJBQW1COzs7QUNMZ1UsT0FBTyxjQUFjO0FBQy9XLE9BQU8sa0JBQWtCOzs7QUNBekIsT0FBTyxhQUFhO0FBQ3BCLE9BQU8sWUFBWTtBQUNuQixPQUFPLHFCQUFxQjtBQUM1QixPQUFPLGtCQUFrQjtBQUl6QixPQUFPLG1CQUFtQjtBQUcxQixPQUFPLGNBQWM7QUFFckIsSUFBTywwQkFBUTtBQUFBLEVBQ2IsU0FBUyxDQUFDLGdCQUFnQiw0QkFBNEI7QUFBQSxFQUN0RCxPQUFPO0FBQUEsSUFDTCx1QkFBdUIsQ0FBQyxLQUFLLE1BQU0sTUFBTSxNQUFNLE1BQU0sS0FBSztBQUFBLElBQzFELGNBQWM7QUFBQSxNQUNaLFlBQVksU0FBUztBQUFBLE1BQ3JCLE1BQU0sU0FBUztBQUFBLE1BQ2YsWUFBWSxTQUFTO0FBQUEsSUFDdkI7QUFBQSxJQUNBLFFBQVE7QUFBQSxNQUNOLFlBQVk7QUFBQSxRQUNWLE1BQU0sQ0FBQyxjQUFjLEdBQUcsYUFBYSxXQUFXLElBQUk7QUFBQSxRQUNwRCxPQUFPLENBQUMsY0FBYyxHQUFHLGFBQWEsV0FBVyxJQUFJO0FBQUEsTUFDdkQ7QUFBQSxNQUNBLE9BQU87QUFBQSxRQUNMLEtBQUs7QUFBQSxRQUNMLEtBQUs7QUFBQSxRQUNMLEtBQUs7QUFBQSxNQUNQO0FBQUEsTUFDQSxZQUFZO0FBQUEsUUFDVixNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0EsV0FBVztBQUFBLFFBQ1QsT0FBTztBQUFBLE1B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
