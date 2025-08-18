// vite.config.ts
import path from "path";
import react from "file:///Users/manuelbarbas/Documents/GitHub/primodium/node_modules/.pnpm/@vitejs+plugin-react@3.1.0_vite@3.2.10/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { defineConfig } from "file:///Users/manuelbarbas/Documents/GitHub/primodium/node_modules/.pnpm/vite@3.2.10_@types+node@16.18.11/node_modules/vite/dist/node/index.js";
import { comlink } from "file:///Users/manuelbarbas/Documents/GitHub/primodium/node_modules/.pnpm/vite-plugin-comlink@3.0.5_comlink@4.4.1_vite@3.2.10/node_modules/vite-plugin-comlink/dist/index.js";
import tsconfigPaths from "file:///Users/manuelbarbas/Documents/GitHub/primodium/node_modules/.pnpm/vite-tsconfig-paths@4.3.2_typescript@5.5.2_vite@3.2.10/node_modules/vite-tsconfig-paths/dist/index.mjs";

// postcss.config.ts
import autoprefixer from "file:///Users/manuelbarbas/Documents/GitHub/primodium/node_modules/.pnpm/autoprefixer@10.4.19_postcss@8.4.38/node_modules/autoprefixer/lib/autoprefixer.js";
import tailwind from "file:///Users/manuelbarbas/Documents/GitHub/primodium/node_modules/.pnpm/tailwindcss@3.4.4/node_modules/tailwindcss/lib/index.js";

// tailwind.config.ts
import daisyui from "file:///Users/manuelbarbas/Documents/GitHub/primodium/node_modules/.pnpm/daisyui@3.9.4/node_modules/daisyui/src/index.js";
import tailwindAnimate from "file:///Users/manuelbarbas/Documents/GitHub/primodium/node_modules/.pnpm/tailwindcss-animate@1.0.7_tailwindcss@3.4.4/node_modules/tailwindcss-animate/index.js";
import patternPlugin from "file:///Users/manuelbarbas/Documents/GitHub/primodium/node_modules/.pnpm/tailwindcss-hero-patterns@0.1.2/node_modules/tailwindcss-hero-patterns/src/index.js";
import patterns from "file:///Users/manuelbarbas/Documents/GitHub/primodium/node_modules/.pnpm/tailwindcss-hero-patterns@0.1.2/node_modules/tailwindcss-hero-patterns/src/patterns.js";
import colors from "file:///Users/manuelbarbas/Documents/GitHub/primodium/node_modules/.pnpm/tailwindcss@3.4.4/node_modules/tailwindcss/colors.js";
import defaultTheme from "file:///Users/manuelbarbas/Documents/GitHub/primodium/node_modules/.pnpm/tailwindcss@3.4.4/node_modules/tailwindcss/defaultTheme.js";
var tailwind_config_default = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    heroPatternsOpacities: ["0", "10", "25", "50", "90", "100"],
    heroPatterns: {
      graphpaper: patterns.graphpaper,
      skulls: patterns.skulls,
      topography: patterns.topography
    },
    extend: {
      fontFamily: {
        mono: ["Space Mono", ...defaultTheme.fontFamily.mono],
        pixel: ["Silkscreen", ...defaultTheme.fontFamily.mono]
      },
      backgroundColor: {
        glass: "rgb(255 255 255 / .05)"
      },
      width: {
        108: "27rem",
        120: "30rem",
        132: "33rem"
      },
      dropShadow: {
        hard: "2px 2px 0px rgba(0, 0, 0, 0.5)"
      },
      animation: {
        float: "float 5s ease-in-out infinite"
      },
      cursor: {
        normal: 'url("/img/cursors/normal.png"), auto',
        pointer: 'url("/img/cursors/pointer.png") 12 0, auto',
        pointerDown: 'url("/img/cursors/pointerdown.png") 12 0, auto'
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
          info: colors.indigo[800],
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
var __vite_injected_original_dirname = "/Users/manuelbarbas/Documents/GitHub/primodium/packages/client";
var vite_config_default = defineConfig({
  plugins: [
    tsconfigPaths({
      projects: ["../game"],
      parseNative: true
    }),
    react(),
    comlink()
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
          mud: ["@latticexyz/common"],
          core: ["@primodiumxyz/core"],
          phaser: ["phaser"]
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
    include: ["bn.js", "js-sha3", "hash.js", "bech32", "long", "protobufjs/minimal", "debug", "is-observable"],
    exclude: ["@primodiumxyz/assets", "contract"]
  },
  envPrefix: "PRI_",
  envDir: "../../",
  css: {
    postcss: postcss_config_default
  },
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAicG9zdGNzcy5jb25maWcudHMiLCAidGFpbHdpbmQuY29uZmlnLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL21hbnVlbGJhcmJhcy9Eb2N1bWVudHMvR2l0SHViL3ByaW1vZGl1bS9wYWNrYWdlcy9jbGllbnRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9tYW51ZWxiYXJiYXMvRG9jdW1lbnRzL0dpdEh1Yi9wcmltb2RpdW0vcGFja2FnZXMvY2xpZW50L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9tYW51ZWxiYXJiYXMvRG9jdW1lbnRzL0dpdEh1Yi9wcmltb2RpdW0vcGFja2FnZXMvY2xpZW50L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgeyBjb21saW5rIH0gZnJvbSBcInZpdGUtcGx1Z2luLWNvbWxpbmtcIjtcbmltcG9ydCB0c2NvbmZpZ1BhdGhzIGZyb20gXCJ2aXRlLXRzY29uZmlnLXBhdGhzXCI7XG5cbmltcG9ydCBwb3N0Y3NzIGZyb20gXCIuL3Bvc3Rjc3MuY29uZmlnXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICB0c2NvbmZpZ1BhdGhzKHtcbiAgICAgIHByb2plY3RzOiBbXCIuLi9nYW1lXCJdLFxuICAgICAgcGFyc2VOYXRpdmU6IHRydWUsXG4gICAgfSksXG4gICAgcmVhY3QoKSxcbiAgICBjb21saW5rKCksXG4gIF0sXG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDMwMDAsXG4gICAgZnM6IHtcbiAgICAgIHN0cmljdDogZmFsc2UsXG4gICAgfSxcbiAgfSxcbiAgd29ya2VyOiB7XG4gICAgcGx1Z2luczogW2NvbWxpbmsoKV0sXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgZXh0ZXJuYWw6IFsvXmNvbnRyYWN0czouKi9dLFxuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIG1hbnVhbENodW5rczoge1xuICAgICAgICAgIHJlYWN0OiBbXCJyZWFjdFwiLCBcInJlYWN0LWRvbVwiXSxcbiAgICAgICAgICBtdWQ6IFtcIkBsYXR0aWNleHl6L2NvbW1vblwiXSxcbiAgICAgICAgICBjb3JlOiBbXCJAcHJpbW9kaXVteHl6L2NvcmVcIl0sXG4gICAgICAgICAgcGhhc2VyOiBbXCJwaGFzZXJcIl0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gICAgdGFyZ2V0OiBcIkVTMjAyMlwiLFxuICB9LFxuXG4gIG9wdGltaXplRGVwczoge1xuICAgIGVzYnVpbGRPcHRpb25zOiB7XG4gICAgICBzdXBwb3J0ZWQ6IHtcbiAgICAgICAgYmlnaW50OiB0cnVlLFxuICAgICAgfSxcbiAgICB9LFxuICAgIGluY2x1ZGU6IFtcImJuLmpzXCIsIFwianMtc2hhM1wiLCBcImhhc2guanNcIiwgXCJiZWNoMzJcIiwgXCJsb25nXCIsIFwicHJvdG9idWZqcy9taW5pbWFsXCIsIFwiZGVidWdcIiwgXCJpcy1vYnNlcnZhYmxlXCJdLFxuICAgIGV4Y2x1ZGU6IFtcIkBwcmltb2RpdW14eXovYXNzZXRzXCIsIFwiY29udHJhY3RcIl0sXG4gIH0sXG4gIGVudlByZWZpeDogXCJQUklfXCIsXG4gIGVudkRpcjogXCIuLi8uLi9cIixcbiAgY3NzOiB7XG4gICAgcG9zdGNzcyxcbiAgfSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcbiAgICB9LFxuICB9LFxufSk7XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9tYW51ZWxiYXJiYXMvRG9jdW1lbnRzL0dpdEh1Yi9wcmltb2RpdW0vcGFja2FnZXMvY2xpZW50XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvbWFudWVsYmFyYmFzL0RvY3VtZW50cy9HaXRIdWIvcHJpbW9kaXVtL3BhY2thZ2VzL2NsaWVudC9wb3N0Y3NzLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvbWFudWVsYmFyYmFzL0RvY3VtZW50cy9HaXRIdWIvcHJpbW9kaXVtL3BhY2thZ2VzL2NsaWVudC9wb3N0Y3NzLmNvbmZpZy50c1wiO2ltcG9ydCBhdXRvcHJlZml4ZXIgZnJvbSBcImF1dG9wcmVmaXhlclwiO1xuaW1wb3J0IHRhaWx3aW5kIGZyb20gXCJ0YWlsd2luZGNzc1wiO1xuXG5pbXBvcnQgdGFpbHdpbmRDb25maWcgZnJvbSBcIi4vdGFpbHdpbmQuY29uZmlnLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgcGx1Z2luczogW3RhaWx3aW5kKHRhaWx3aW5kQ29uZmlnKSwgYXV0b3ByZWZpeGVyXSxcbn07XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9tYW51ZWxiYXJiYXMvRG9jdW1lbnRzL0dpdEh1Yi9wcmltb2RpdW0vcGFja2FnZXMvY2xpZW50XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvbWFudWVsYmFyYmFzL0RvY3VtZW50cy9HaXRIdWIvcHJpbW9kaXVtL3BhY2thZ2VzL2NsaWVudC90YWlsd2luZC5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL21hbnVlbGJhcmJhcy9Eb2N1bWVudHMvR2l0SHViL3ByaW1vZGl1bS9wYWNrYWdlcy9jbGllbnQvdGFpbHdpbmQuY29uZmlnLnRzXCI7LyoqIEB0eXBlIHtpbXBvcnQoXCJ0YWlsd2luZGNzc1wiKS5Db25maWd9ICovXG5pbXBvcnQgZGFpc3l1aSBmcm9tIFwiZGFpc3l1aVwiO1xuaW1wb3J0IHRhaWx3aW5kQW5pbWF0ZSBmcm9tIFwidGFpbHdpbmRjc3MtYW5pbWF0ZVwiO1xuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudFxuLy8gQHRzLWlnbm9yZVxuaW1wb3J0IHBhdHRlcm5QbHVnaW4gZnJvbSBcInRhaWx3aW5kY3NzLWhlcm8tcGF0dGVybnNcIjtcbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcbi8vIEB0cy1pZ25vcmVcbmltcG9ydCBwYXR0ZXJucyBmcm9tIFwidGFpbHdpbmRjc3MtaGVyby1wYXR0ZXJucy9zcmMvcGF0dGVybnNcIjtcbmltcG9ydCBjb2xvcnMgZnJvbSBcInRhaWx3aW5kY3NzL2NvbG9yc1wiO1xuaW1wb3J0IGRlZmF1bHRUaGVtZSBmcm9tIFwidGFpbHdpbmRjc3MvZGVmYXVsdFRoZW1lXCI7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgY29udGVudDogW1wiLi9pbmRleC5odG1sXCIsIFwiLi9zcmMvKiovKi57anMsdHMsanN4LHRzeH1cIl0sXG4gIHRoZW1lOiB7XG4gICAgaGVyb1BhdHRlcm5zT3BhY2l0aWVzOiBbXCIwXCIsIFwiMTBcIiwgXCIyNVwiLCBcIjUwXCIsIFwiOTBcIiwgXCIxMDBcIl0sXG4gICAgaGVyb1BhdHRlcm5zOiB7XG4gICAgICBncmFwaHBhcGVyOiBwYXR0ZXJucy5ncmFwaHBhcGVyLFxuICAgICAgc2t1bGxzOiBwYXR0ZXJucy5za3VsbHMsXG4gICAgICB0b3BvZ3JhcGh5OiBwYXR0ZXJucy50b3BvZ3JhcGh5LFxuICAgIH0sXG4gICAgZXh0ZW5kOiB7XG4gICAgICBmb250RmFtaWx5OiB7XG4gICAgICAgIG1vbm86IFtcIlNwYWNlIE1vbm9cIiwgLi4uZGVmYXVsdFRoZW1lLmZvbnRGYW1pbHkubW9ub10sXG4gICAgICAgIHBpeGVsOiBbXCJTaWxrc2NyZWVuXCIsIC4uLmRlZmF1bHRUaGVtZS5mb250RmFtaWx5Lm1vbm9dLFxuICAgICAgfSxcbiAgICAgIGJhY2tncm91bmRDb2xvcjoge1xuICAgICAgICBnbGFzczogXCJyZ2IoMjU1IDI1NSAyNTUgLyAuMDUpXCIsXG4gICAgICB9LFxuICAgICAgd2lkdGg6IHtcbiAgICAgICAgMTA4OiBcIjI3cmVtXCIsXG4gICAgICAgIDEyMDogXCIzMHJlbVwiLFxuICAgICAgICAxMzI6IFwiMzNyZW1cIixcbiAgICAgIH0sXG4gICAgICBkcm9wU2hhZG93OiB7XG4gICAgICAgIGhhcmQ6IFwiMnB4IDJweCAwcHggcmdiYSgwLCAwLCAwLCAwLjUpXCIsIC8vIEFkZCB5b3VyIGN1c3RvbSBzaGFkb3cgaGVyZVxuICAgICAgfSxcbiAgICAgIGFuaW1hdGlvbjoge1xuICAgICAgICBmbG9hdDogXCJmbG9hdCA1cyBlYXNlLWluLW91dCBpbmZpbml0ZVwiLFxuICAgICAgfSxcbiAgICAgIGN1cnNvcjoge1xuICAgICAgICBub3JtYWw6ICd1cmwoXCIvaW1nL2N1cnNvcnMvbm9ybWFsLnBuZ1wiKSwgYXV0bycsXG5cbiAgICAgICAgcG9pbnRlcjogJ3VybChcIi9pbWcvY3Vyc29ycy9wb2ludGVyLnBuZ1wiKSAxMiAwLCBhdXRvJyxcbiAgICAgICAgcG9pbnRlckRvd246ICd1cmwoXCIvaW1nL2N1cnNvcnMvcG9pbnRlcmRvd24ucG5nXCIpIDEyIDAsIGF1dG8nLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICBkYWlzeXVpOiB7XG4gICAgdGhlbWVzOiBbXG4gICAgICB7XG4gICAgICAgIGJhc2U6IHtcbiAgICAgICAgICBwcmltYXJ5OiBjb2xvcnMuY3lhbls5MDBdLFxuICAgICAgICAgIHNlY29uZGFyeTogY29sb3JzLmN5YW5bNzAwXSxcbiAgICAgICAgICBhY2NlbnQ6IGNvbG9ycy5jeWFuWzQwMF0sXG4gICAgICAgICAgbmV1dHJhbDogY29sb3JzLnNsYXRlWzkwMF0sXG4gICAgICAgICAgXCJiYXNlLTEwMFwiOiBjb2xvcnMuc2xhdGVbODAwXSxcbiAgICAgICAgICBpbmZvOiBjb2xvcnMuaW5kaWdvWzgwMF0sXG4gICAgICAgICAgc3VjY2VzczogY29sb3JzLmVtZXJhbGRbNjAwXSxcbiAgICAgICAgICB3YXJuaW5nOiBjb2xvcnMueWVsbG93WzYwMF0sXG4gICAgICAgICAgZXJyb3I6IFwiI0E4Mzc1RFwiLFxuXG4gICAgICAgICAgXCItLXJvdW5kZWQtYm94XCI6IFwiMHJlbVwiLCAvLyBib3JkZXIgcmFkaXVzIHJvdW5kZWQtYm94IHV0aWxpdHkgY2xhc3MsIHVzZWQgaW4gY2FyZCBhbmQgb3RoZXIgbGFyZ2UgYm94ZXNcbiAgICAgICAgICBcIi0tcm91bmRlZC1idG5cIjogXCIwcmVtXCIsIC8vIGJvcmRlciByYWRpdXMgcm91bmRlZC1idG4gdXRpbGl0eSBjbGFzcywgdXNlZCBpbiBidXR0b25zIGFuZCBzaW1pbGFyIGVsZW1lbnRcbiAgICAgICAgICBcIi0tcm91bmRlZC1iYWRnZVwiOiBcIjByZW1cIiwgLy8gYm9yZGVyIHJhZGl1cyByb3VuZGVkLWJhZGdlIHV0aWxpdHkgY2xhc3MsIHVzZWQgaW4gYmFkZ2VzIGFuZCBzaW1pbGFyXG4gICAgICAgICAgXCItLWFuaW1hdGlvbi1idG5cIjogXCIwc1wiLCAvLyBkdXJhdGlvbiBvZiBhbmltYXRpb24gd2hlbiB5b3UgY2xpY2sgb24gYnV0dG9uXG4gICAgICAgICAgXCItLWFuaW1hdGlvbi1pbnB1dFwiOiBcIjAuMnNcIiwgLy8gZHVyYXRpb24gb2YgYW5pbWF0aW9uIGZvciBpbnB1dHMgbGlrZSBjaGVja2JveCwgdG9nZ2xlLCByYWRpbywgZXRjXG4gICAgICAgICAgXCItLWJ0bi10ZXh0LWNhc2VcIjogXCJ1cHBlcmNhc2VcIiwgLy8gc2V0IGRlZmF1bHQgdGV4dCB0cmFuc2Zvcm0gZm9yIGJ1dHRvbnNcbiAgICAgICAgICBcIi0tYnRuLWZvY3VzLXNjYWxlXCI6IFwiMVwiLCAvLyBzY2FsZSB0cmFuc2Zvcm0gb2YgYnV0dG9uIHdoZW4geW91IGZvY3VzIG9uIGl0XG4gICAgICAgICAgXCItLWJvcmRlci1idG5cIjogXCIxcHhcIiwgLy8gYm9yZGVyIHdpZHRoIG9mIGJ1dHRvbnNcbiAgICAgICAgICBcIi0tdGFiLWJvcmRlclwiOiBcIjFweFwiLCAvLyBib3JkZXIgd2lkdGggb2YgdGFic1xuICAgICAgICAgIFwiLS10YWItcmFkaXVzXCI6IFwiMC41cmVtXCIsIC8vIGJvcmRlciByYWRpdXMgb2YgdGFic1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICBdLFxuICAgIGRhcmtUaGVtZTogXCJiYXNlXCIsXG4gIH0sXG4gIHBsdWdpbnM6IFtkYWlzeXVpLCBwYXR0ZXJuUGx1Z2luLCB0YWlsd2luZEFuaW1hdGVdLFxufTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBNFcsT0FBTyxVQUFVO0FBQzdYLE9BQU8sV0FBVztBQUNsQixTQUFTLG9CQUFvQjtBQUM3QixTQUFTLGVBQWU7QUFDeEIsT0FBTyxtQkFBbUI7OztBQ0p3VixPQUFPLGtCQUFrQjtBQUMzWSxPQUFPLGNBQWM7OztBQ0FyQixPQUFPLGFBQWE7QUFDcEIsT0FBTyxxQkFBcUI7QUFHNUIsT0FBTyxtQkFBbUI7QUFHMUIsT0FBTyxjQUFjO0FBQ3JCLE9BQU8sWUFBWTtBQUNuQixPQUFPLGtCQUFrQjtBQUV6QixJQUFPLDBCQUFRO0FBQUEsRUFDYixTQUFTLENBQUMsZ0JBQWdCLDRCQUE0QjtBQUFBLEVBQ3RELE9BQU87QUFBQSxJQUNMLHVCQUF1QixDQUFDLEtBQUssTUFBTSxNQUFNLE1BQU0sTUFBTSxLQUFLO0FBQUEsSUFDMUQsY0FBYztBQUFBLE1BQ1osWUFB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
