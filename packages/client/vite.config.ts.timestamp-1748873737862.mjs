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
  base: process.env.VITE_BASE_PATH || "/",
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAicG9zdGNzcy5jb25maWcudHMiLCAidGFpbHdpbmQuY29uZmlnLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL21hbnVlbGJhcmJhcy9Eb2N1bWVudHMvR2l0SHViL3ByaW1vZGl1bS9wYWNrYWdlcy9jbGllbnRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9tYW51ZWxiYXJiYXMvRG9jdW1lbnRzL0dpdEh1Yi9wcmltb2RpdW0vcGFja2FnZXMvY2xpZW50L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9tYW51ZWxiYXJiYXMvRG9jdW1lbnRzL0dpdEh1Yi9wcmltb2RpdW0vcGFja2FnZXMvY2xpZW50L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgeyBjb21saW5rIH0gZnJvbSBcInZpdGUtcGx1Z2luLWNvbWxpbmtcIjtcbi8vaW1wb3J0IHsgdml0ZVN0YXRpY0NvcHkgfSBmcm9tIFwidml0ZS1wbHVnaW4tc3RhdGljLWNvcHlcIjtcbmltcG9ydCB0c2NvbmZpZ1BhdGhzIGZyb20gXCJ2aXRlLXRzY29uZmlnLXBhdGhzXCI7XG5cbmltcG9ydCBwb3N0Y3NzIGZyb20gXCIuL3Bvc3Rjc3MuY29uZmlnXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICB0c2NvbmZpZ1BhdGhzKHtcbiAgICAgIHByb2plY3RzOiBbXCIuLi9nYW1lXCJdLFxuICAgICAgcGFyc2VOYXRpdmU6IHRydWUsXG4gICAgfSksXG4gICAgcmVhY3QoKSxcbiAgICBjb21saW5rKCksXG4gICAgLyogICB2aXRlU3RhdGljQ29weSh7XG4gICAgICB0YXJnZXRzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICAvLyBDb3B5IGVuY3J5cHQud2FzbSBmcm9tIHRoZSB0LWVuY3J5cHQgaW50byBkaXN0XG4gICAgICAgICAgc3JjOiBcIm5vZGVfbW9kdWxlcy9AcHJpbW9kaXVteHl6L2NvcmUvbm9kZV9tb2R1bGVzL0Bza2FsZW5ldHdvcmsvbGlidGUtdHMvbm9kZV9tb2R1bGVzL0Bza2FsZW5ldHdvcmsvdC1lbmNyeXB0L2VuY3J5cHQud2FzbVwiLFxuICAgICAgICAgIGRlc3Q6IFwiXCIsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0pLCovXG4gIF0sXG4gIGJhc2U6IHByb2Nlc3MuZW52LlZJVEVfQkFTRV9QQVRIIHx8IFwiL1wiLFxuICBzZXJ2ZXI6IHtcbiAgICBwb3J0OiAzMDAwLFxuICAgIGZzOiB7XG4gICAgICBzdHJpY3Q6IGZhbHNlLFxuICAgIH0sXG4gIH0sXG4gIHdvcmtlcjoge1xuICAgIHBsdWdpbnM6IFtjb21saW5rKCldLFxuICB9LFxuICBidWlsZDoge1xuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIGV4dGVybmFsOiBbL15jb250cmFjdHM6LiovXSxcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBtYW51YWxDaHVua3M6IHtcbiAgICAgICAgICByZWFjdDogW1wicmVhY3RcIiwgXCJyZWFjdC1kb21cIl0sXG4gICAgICAgICAgbXVkOiBbXCJAbGF0dGljZXh5ei9jb21tb25cIl0sXG4gICAgICAgICAgY29yZTogW1wiQHByaW1vZGl1bXh5ei9jb3JlXCJdLFxuICAgICAgICAgIHBoYXNlcjogW1wicGhhc2VyXCJdLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICAgIHRhcmdldDogXCJFUzIwMjJcIixcbiAgfSxcblxuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBlc2J1aWxkT3B0aW9uczoge1xuICAgICAgc3VwcG9ydGVkOiB7XG4gICAgICAgIGJpZ2ludDogdHJ1ZSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBpbmNsdWRlOiBbXCJibi5qc1wiLCBcImpzLXNoYTNcIiwgXCJoYXNoLmpzXCIsIFwiYmVjaDMyXCIsIFwibG9uZ1wiLCBcInByb3RvYnVmanMvbWluaW1hbFwiLCBcImRlYnVnXCIsIFwiaXMtb2JzZXJ2YWJsZVwiXSxcbiAgICBleGNsdWRlOiBbXCJAcHJpbW9kaXVteHl6L2Fzc2V0c1wiLCBcImNvbnRyYWN0XCJdLFxuICB9LFxuICBlbnZQcmVmaXg6IFwiUFJJX1wiLFxuICBlbnZEaXI6IFwiLi4vLi4vXCIsXG4gIGNzczoge1xuICAgIHBvc3Rjc3MsXG4gIH0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXG4gICAgfSxcbiAgfSxcbn0pO1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvbWFudWVsYmFyYmFzL0RvY3VtZW50cy9HaXRIdWIvcHJpbW9kaXVtL3BhY2thZ2VzL2NsaWVudFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL21hbnVlbGJhcmJhcy9Eb2N1bWVudHMvR2l0SHViL3ByaW1vZGl1bS9wYWNrYWdlcy9jbGllbnQvcG9zdGNzcy5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL21hbnVlbGJhcmJhcy9Eb2N1bWVudHMvR2l0SHViL3ByaW1vZGl1bS9wYWNrYWdlcy9jbGllbnQvcG9zdGNzcy5jb25maWcudHNcIjtpbXBvcnQgYXV0b3ByZWZpeGVyIGZyb20gXCJhdXRvcHJlZml4ZXJcIjtcbmltcG9ydCB0YWlsd2luZCBmcm9tIFwidGFpbHdpbmRjc3NcIjtcblxuaW1wb3J0IHRhaWx3aW5kQ29uZmlnIGZyb20gXCIuL3RhaWx3aW5kLmNvbmZpZy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIHBsdWdpbnM6IFt0YWlsd2luZCh0YWlsd2luZENvbmZpZyksIGF1dG9wcmVmaXhlcl0sXG59O1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvbWFudWVsYmFyYmFzL0RvY3VtZW50cy9HaXRIdWIvcHJpbW9kaXVtL3BhY2thZ2VzL2NsaWVudFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL21hbnVlbGJhcmJhcy9Eb2N1bWVudHMvR2l0SHViL3ByaW1vZGl1bS9wYWNrYWdlcy9jbGllbnQvdGFpbHdpbmQuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9tYW51ZWxiYXJiYXMvRG9jdW1lbnRzL0dpdEh1Yi9wcmltb2RpdW0vcGFja2FnZXMvY2xpZW50L3RhaWx3aW5kLmNvbmZpZy50c1wiOy8qKiBAdHlwZSB7aW1wb3J0KFwidGFpbHdpbmRjc3NcIikuQ29uZmlnfSAqL1xuaW1wb3J0IGRhaXN5dWkgZnJvbSBcImRhaXN5dWlcIjtcbmltcG9ydCB0YWlsd2luZEFuaW1hdGUgZnJvbSBcInRhaWx3aW5kY3NzLWFuaW1hdGVcIjtcbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcbi8vIEB0cy1pZ25vcmVcbmltcG9ydCBwYXR0ZXJuUGx1Z2luIGZyb20gXCJ0YWlsd2luZGNzcy1oZXJvLXBhdHRlcm5zXCI7XG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50XG4vLyBAdHMtaWdub3JlXG5pbXBvcnQgcGF0dGVybnMgZnJvbSBcInRhaWx3aW5kY3NzLWhlcm8tcGF0dGVybnMvc3JjL3BhdHRlcm5zXCI7XG5pbXBvcnQgY29sb3JzIGZyb20gXCJ0YWlsd2luZGNzcy9jb2xvcnNcIjtcbmltcG9ydCBkZWZhdWx0VGhlbWUgZnJvbSBcInRhaWx3aW5kY3NzL2RlZmF1bHRUaGVtZVwiO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIGNvbnRlbnQ6IFtcIi4vaW5kZXguaHRtbFwiLCBcIi4vc3JjLyoqLyoue2pzLHRzLGpzeCx0c3h9XCJdLFxuICB0aGVtZToge1xuICAgIGhlcm9QYXR0ZXJuc09wYWNpdGllczogW1wiMFwiLCBcIjEwXCIsIFwiMjVcIiwgXCI1MFwiLCBcIjkwXCIsIFwiMTAwXCJdLFxuICAgIGhlcm9QYXR0ZXJuczoge1xuICAgICAgZ3JhcGhwYXBlcjogcGF0dGVybnMuZ3JhcGhwYXBlcixcbiAgICAgIHNrdWxsczogcGF0dGVybnMuc2t1bGxzLFxuICAgICAgdG9wb2dyYXBoeTogcGF0dGVybnMudG9wb2dyYXBoeSxcbiAgICB9LFxuICAgIGV4dGVuZDoge1xuICAgICAgZm9udEZhbWlseToge1xuICAgICAgICBtb25vOiBbXCJTcGFjZSBNb25vXCIsIC4uLmRlZmF1bHRUaGVtZS5mb250RmFtaWx5Lm1vbm9dLFxuICAgICAgICBwaXhlbDogW1wiU2lsa3NjcmVlblwiLCAuLi5kZWZhdWx0VGhlbWUuZm9udEZhbWlseS5tb25vXSxcbiAgICAgIH0sXG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6IHtcbiAgICAgICAgZ2xhc3M6IFwicmdiKDI1NSAyNTUgMjU1IC8gLjA1KVwiLFxuICAgICAgfSxcbiAgICAgIHdpZHRoOiB7XG4gICAgICAgIDEwODogXCIyN3JlbVwiLFxuICAgICAgICAxMjA6IFwiMzByZW1cIixcbiAgICAgICAgMTMyOiBcIjMzcmVtXCIsXG4gICAgICB9LFxuICAgICAgZHJvcFNoYWRvdzoge1xuICAgICAgICBoYXJkOiBcIjJweCAycHggMHB4IHJnYmEoMCwgMCwgMCwgMC41KVwiLCAvLyBBZGQgeW91ciBjdXN0b20gc2hhZG93IGhlcmVcbiAgICAgIH0sXG4gICAgICBhbmltYXRpb246IHtcbiAgICAgICAgZmxvYXQ6IFwiZmxvYXQgNXMgZWFzZS1pbi1vdXQgaW5maW5pdGVcIixcbiAgICAgIH0sXG4gICAgICBjdXJzb3I6IHtcbiAgICAgICAgbm9ybWFsOiAndXJsKFwiL2ltZy9jdXJzb3JzL25vcm1hbC5wbmdcIiksIGF1dG8nLFxuXG4gICAgICAgIHBvaW50ZXI6ICd1cmwoXCIvaW1nL2N1cnNvcnMvcG9pbnRlci5wbmdcIikgMTIgMCwgYXV0bycsXG4gICAgICAgIHBvaW50ZXJEb3duOiAndXJsKFwiL2ltZy9jdXJzb3JzL3BvaW50ZXJkb3duLnBuZ1wiKSAxMiAwLCBhdXRvJyxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgZGFpc3l1aToge1xuICAgIHRoZW1lczogW1xuICAgICAge1xuICAgICAgICBiYXNlOiB7XG4gICAgICAgICAgcHJpbWFyeTogY29sb3JzLmN5YW5bOTAwXSxcbiAgICAgICAgICBzZWNvbmRhcnk6IGNvbG9ycy5jeWFuWzcwMF0sXG4gICAgICAgICAgYWNjZW50OiBjb2xvcnMuY3lhbls0MDBdLFxuICAgICAgICAgIG5ldXRyYWw6IGNvbG9ycy5zbGF0ZVs5MDBdLFxuICAgICAgICAgIFwiYmFzZS0xMDBcIjogY29sb3JzLnNsYXRlWzgwMF0sXG4gICAgICAgICAgaW5mbzogY29sb3JzLmluZGlnb1s4MDBdLFxuICAgICAgICAgIHN1Y2Nlc3M6IGNvbG9ycy5lbWVyYWxkWzYwMF0sXG4gICAgICAgICAgd2FybmluZzogY29sb3JzLnllbGxvd1s2MDBdLFxuICAgICAgICAgIGVycm9yOiBcIiNBODM3NURcIixcblxuICAgICAgICAgIFwiLS1yb3VuZGVkLWJveFwiOiBcIjByZW1cIiwgLy8gYm9yZGVyIHJhZGl1cyByb3VuZGVkLWJveCB1dGlsaXR5IGNsYXNzLCB1c2VkIGluIGNhcmQgYW5kIG90aGVyIGxhcmdlIGJveGVzXG4gICAgICAgICAgXCItLXJvdW5kZWQtYnRuXCI6IFwiMHJlbVwiLCAvLyBib3JkZXIgcmFkaXVzIHJvdW5kZWQtYnRuIHV0aWxpdHkgY2xhc3MsIHVzZWQgaW4gYnV0dG9ucyBhbmQgc2ltaWxhciBlbGVtZW50XG4gICAgICAgICAgXCItLXJvdW5kZWQtYmFkZ2VcIjogXCIwcmVtXCIsIC8vIGJvcmRlciByYWRpdXMgcm91bmRlZC1iYWRnZSB1dGlsaXR5IGNsYXNzLCB1c2VkIGluIGJhZGdlcyBhbmQgc2ltaWxhclxuICAgICAgICAgIFwiLS1hbmltYXRpb24tYnRuXCI6IFwiMHNcIiwgLy8gZHVyYXRpb24gb2YgYW5pbWF0aW9uIHdoZW4geW91IGNsaWNrIG9uIGJ1dHRvblxuICAgICAgICAgIFwiLS1hbmltYXRpb24taW5wdXRcIjogXCIwLjJzXCIsIC8vIGR1cmF0aW9uIG9mIGFuaW1hdGlvbiBmb3IgaW5wdXRzIGxpa2UgY2hlY2tib3gsIHRvZ2dsZSwgcmFkaW8sIGV0Y1xuICAgICAgICAgIFwiLS1idG4tdGV4dC1jYXNlXCI6IFwidXBwZXJjYXNlXCIsIC8vIHNldCBkZWZhdWx0IHRleHQgdHJhbnNmb3JtIGZvciBidXR0b25zXG4gICAgICAgICAgXCItLWJ0bi1mb2N1cy1zY2FsZVwiOiBcIjFcIiwgLy8gc2NhbGUgdHJhbnNmb3JtIG9mIGJ1dHRvbiB3aGVuIHlvdSBmb2N1cyBvbiBpdFxuICAgICAgICAgIFwiLS1ib3JkZXItYnRuXCI6IFwiMXB4XCIsIC8vIGJvcmRlciB3aWR0aCBvZiBidXR0b25zXG4gICAgICAgICAgXCItLXRhYi1ib3JkZXJcIjogXCIxcHhcIiwgLy8gYm9yZGVyIHdpZHRoIG9mIHRhYnNcbiAgICAgICAgICBcIi0tdGFiLXJhZGl1c1wiOiBcIjAuNXJlbVwiLCAvLyBib3JkZXIgcmFkaXVzIG9mIHRhYnNcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgXSxcbiAgICBkYXJrVGhlbWU6IFwiYmFzZVwiLFxuICB9LFxuICBwbHVnaW5zOiBbZGFpc3l1aSwgcGF0dGVyblBs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
