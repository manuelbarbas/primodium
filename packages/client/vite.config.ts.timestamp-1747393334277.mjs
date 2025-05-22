// vite.config.ts
import path from "path";
import react from "file:///Users/manuelbarbas/Documents/GitHub/primodium/node_modules/.pnpm/@vitejs+plugin-react@3.1.0_vite@3.2.10/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { defineConfig } from "file:///Users/manuelbarbas/Documents/GitHub/primodium/node_modules/.pnpm/vite@3.2.10_@types+node@16.18.11/node_modules/vite/dist/node/index.js";
import { comlink } from "file:///Users/manuelbarbas/Documents/GitHub/primodium/node_modules/.pnpm/vite-plugin-comlink@3.0.5_comlink@4.4.1_vite@3.2.10/node_modules/vite-plugin-comlink/dist/index.js";
import tsconfigPaths from "file:///Users/manuelbarbas/Documents/GitHub/primodium/node_modules/.pnpm/vite-tsconfig-paths@4.3.2_typescript@5.5.2_vite@3.2.10/node_modules/vite-tsconfig-paths/dist/index.mjs";
import { viteStaticCopy } from "file:///Users/manuelbarbas/Documents/GitHub/primodium/node_modules/.pnpm/vite-plugin-static-copy@2.3.1_vite@3.2.10/node_modules/vite-plugin-static-copy/dist/index.js";

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
    comlink(),
    viteStaticCopy({
      targets: [
        {
          src: "node_modules/@primodiumxyz/core/node_modules/@skalenetwork/libte-ts/node_modules/@skalenetwork/t-encrypt/encrypt.wasm",
          dest: ""
        }
      ]
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAicG9zdGNzcy5jb25maWcudHMiLCAidGFpbHdpbmQuY29uZmlnLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL21hbnVlbGJhcmJhcy9Eb2N1bWVudHMvR2l0SHViL3ByaW1vZGl1bS9wYWNrYWdlcy9jbGllbnRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9tYW51ZWxiYXJiYXMvRG9jdW1lbnRzL0dpdEh1Yi9wcmltb2RpdW0vcGFja2FnZXMvY2xpZW50L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9tYW51ZWxiYXJiYXMvRG9jdW1lbnRzL0dpdEh1Yi9wcmltb2RpdW0vcGFja2FnZXMvY2xpZW50L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgeyBjb21saW5rIH0gZnJvbSBcInZpdGUtcGx1Z2luLWNvbWxpbmtcIjtcbmltcG9ydCB0c2NvbmZpZ1BhdGhzIGZyb20gXCJ2aXRlLXRzY29uZmlnLXBhdGhzXCI7XG5pbXBvcnQgeyB2aXRlU3RhdGljQ29weSB9IGZyb20gJ3ZpdGUtcGx1Z2luLXN0YXRpYy1jb3B5JztcblxuaW1wb3J0IHBvc3Rjc3MgZnJvbSBcIi4vcG9zdGNzcy5jb25maWdcIjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIHRzY29uZmlnUGF0aHMoe1xuICAgICAgcHJvamVjdHM6IFtcIi4uL2dhbWVcIl0sXG4gICAgICBwYXJzZU5hdGl2ZTogdHJ1ZSxcbiAgICB9KSxcbiAgICByZWFjdCgpLFxuICAgIGNvbWxpbmsoKSxcbiAgICB2aXRlU3RhdGljQ29weSh7XG4gICAgICB0YXJnZXRzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgICAvLyBDb3B5IGVuY3J5cHQud2FzbSBmcm9tIHRoZSB0LWVuY3J5cHQgaW50byBkaXN0XG4gICAgICAgICAgICAgIHNyYzogJ25vZGVfbW9kdWxlcy9AcHJpbW9kaXVteHl6L2NvcmUvbm9kZV9tb2R1bGVzL0Bza2FsZW5ldHdvcmsvbGlidGUtdHMvbm9kZV9tb2R1bGVzL0Bza2FsZW5ldHdvcmsvdC1lbmNyeXB0L2VuY3J5cHQud2FzbScsXG4gICAgICAgICAgICAgIGRlc3Q6ICcnLFxuICAgICAgICAgIH0sXG4gICAgICBdLFxuICB9KSxcbiAgXSxcbiAgc2VydmVyOiB7XG4gICAgcG9ydDogMzAwMCxcbiAgICBmczoge1xuICAgICAgc3RyaWN0OiBmYWxzZSxcbiAgICB9LFxuICB9LFxuICB3b3JrZXI6IHtcbiAgICBwbHVnaW5zOiBbY29tbGluaygpXSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBleHRlcm5hbDogWy9eY29udHJhY3RzOi4qL10sXG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB7XG4gICAgICAgICAgcmVhY3Q6IFtcInJlYWN0XCIsIFwicmVhY3QtZG9tXCJdLFxuICAgICAgICAgIG11ZDogW1wiQGxhdHRpY2V4eXovY29tbW9uXCJdLFxuICAgICAgICAgIGNvcmU6IFtcIkBwcmltb2RpdW14eXovY29yZVwiXSxcbiAgICAgICAgICBwaGFzZXI6IFtcInBoYXNlclwiXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICB0YXJnZXQ6IFwiRVMyMDIyXCIsXG4gIH0sXG5cbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgZXNidWlsZE9wdGlvbnM6IHtcbiAgICAgIHN1cHBvcnRlZDoge1xuICAgICAgICBiaWdpbnQ6IHRydWUsXG4gICAgICB9LFxuICAgIH0sXG4gICAgaW5jbHVkZTogW1wiYm4uanNcIiwgXCJqcy1zaGEzXCIsIFwiaGFzaC5qc1wiLCBcImJlY2gzMlwiLCBcImxvbmdcIiwgXCJwcm90b2J1ZmpzL21pbmltYWxcIiwgXCJkZWJ1Z1wiLCBcImlzLW9ic2VydmFibGVcIl0sXG4gICAgZXhjbHVkZTogW1wiQHByaW1vZGl1bXh5ei9hc3NldHNcIiwgXCJjb250cmFjdFwiXSxcbiAgfSxcbiAgZW52UHJlZml4OiBcIlBSSV9cIixcbiAgZW52RGlyOiBcIi4uLy4uL1wiLFxuICBjc3M6IHtcbiAgICBwb3N0Y3NzLFxuICB9LFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxuICAgIH0sXG4gIH0sXG59KTtcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL21hbnVlbGJhcmJhcy9Eb2N1bWVudHMvR2l0SHViL3ByaW1vZGl1bS9wYWNrYWdlcy9jbGllbnRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9tYW51ZWxiYXJiYXMvRG9jdW1lbnRzL0dpdEh1Yi9wcmltb2RpdW0vcGFja2FnZXMvY2xpZW50L3Bvc3Rjc3MuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9tYW51ZWxiYXJiYXMvRG9jdW1lbnRzL0dpdEh1Yi9wcmltb2RpdW0vcGFja2FnZXMvY2xpZW50L3Bvc3Rjc3MuY29uZmlnLnRzXCI7aW1wb3J0IGF1dG9wcmVmaXhlciBmcm9tIFwiYXV0b3ByZWZpeGVyXCI7XG5pbXBvcnQgdGFpbHdpbmQgZnJvbSBcInRhaWx3aW5kY3NzXCI7XG5cbmltcG9ydCB0YWlsd2luZENvbmZpZyBmcm9tIFwiLi90YWlsd2luZC5jb25maWcuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQge1xuICBwbHVnaW5zOiBbdGFpbHdpbmQodGFpbHdpbmRDb25maWcpLCBhdXRvcHJlZml4ZXJdLFxufTtcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL21hbnVlbGJhcmJhcy9Eb2N1bWVudHMvR2l0SHViL3ByaW1vZGl1bS9wYWNrYWdlcy9jbGllbnRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9tYW51ZWxiYXJiYXMvRG9jdW1lbnRzL0dpdEh1Yi9wcmltb2RpdW0vcGFja2FnZXMvY2xpZW50L3RhaWx3aW5kLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvbWFudWVsYmFyYmFzL0RvY3VtZW50cy9HaXRIdWIvcHJpbW9kaXVtL3BhY2thZ2VzL2NsaWVudC90YWlsd2luZC5jb25maWcudHNcIjsvKiogQHR5cGUge2ltcG9ydChcInRhaWx3aW5kY3NzXCIpLkNvbmZpZ30gKi9cbmltcG9ydCBkYWlzeXVpIGZyb20gXCJkYWlzeXVpXCI7XG5pbXBvcnQgdGFpbHdpbmRBbmltYXRlIGZyb20gXCJ0YWlsd2luZGNzcy1hbmltYXRlXCI7XG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50XG4vLyBAdHMtaWdub3JlXG5pbXBvcnQgcGF0dGVyblBsdWdpbiBmcm9tIFwidGFpbHdpbmRjc3MtaGVyby1wYXR0ZXJuc1wiO1xuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudFxuLy8gQHRzLWlnbm9yZVxuaW1wb3J0IHBhdHRlcm5zIGZyb20gXCJ0YWlsd2luZGNzcy1oZXJvLXBhdHRlcm5zL3NyYy9wYXR0ZXJuc1wiO1xuaW1wb3J0IGNvbG9ycyBmcm9tIFwidGFpbHdpbmRjc3MvY29sb3JzXCI7XG5pbXBvcnQgZGVmYXVsdFRoZW1lIGZyb20gXCJ0YWlsd2luZGNzcy9kZWZhdWx0VGhlbWVcIjtcblxuZXhwb3J0IGRlZmF1bHQge1xuICBjb250ZW50OiBbXCIuL2luZGV4Lmh0bWxcIiwgXCIuL3NyYy8qKi8qLntqcyx0cyxqc3gsdHN4fVwiXSxcbiAgdGhlbWU6IHtcbiAgICBoZXJvUGF0dGVybnNPcGFjaXRpZXM6IFtcIjBcIiwgXCIxMFwiLCBcIjI1XCIsIFwiNTBcIiwgXCI5MFwiLCBcIjEwMFwiXSxcbiAgICBoZXJvUGF0dGVybnM6IHtcbiAgICAgIGdyYXBocGFwZXI6IHBhdHRlcm5zLmdyYXBocGFwZXIsXG4gICAgICBza3VsbHM6IHBhdHRlcm5zLnNrdWxscyxcbiAgICAgIHRvcG9ncmFwaHk6IHBhdHRlcm5zLnRvcG9ncmFwaHksXG4gICAgfSxcbiAgICBleHRlbmQ6IHtcbiAgICAgIGZvbnRGYW1pbHk6IHtcbiAgICAgICAgbW9ubzogW1wiU3BhY2UgTW9ub1wiLCAuLi5kZWZhdWx0VGhlbWUuZm9udEZhbWlseS5tb25vXSxcbiAgICAgICAgcGl4ZWw6IFtcIlNpbGtzY3JlZW5cIiwgLi4uZGVmYXVsdFRoZW1lLmZvbnRGYW1pbHkubW9ub10sXG4gICAgICB9LFxuICAgICAgYmFja2dyb3VuZENvbG9yOiB7XG4gICAgICAgIGdsYXNzOiBcInJnYigyNTUgMjU1IDI1NSAvIC4wNSlcIixcbiAgICAgIH0sXG4gICAgICB3aWR0aDoge1xuICAgICAgICAxMDg6IFwiMjdyZW1cIixcbiAgICAgICAgMTIwOiBcIjMwcmVtXCIsXG4gICAgICAgIDEzMjogXCIzM3JlbVwiLFxuICAgICAgfSxcbiAgICAgIGRyb3BTaGFkb3c6IHtcbiAgICAgICAgaGFyZDogXCIycHggMnB4IDBweCByZ2JhKDAsIDAsIDAsIDAuNSlcIiwgLy8gQWRkIHlvdXIgY3VzdG9tIHNoYWRvdyBoZXJlXG4gICAgICB9LFxuICAgICAgYW5pbWF0aW9uOiB7XG4gICAgICAgIGZsb2F0OiBcImZsb2F0IDVzIGVhc2UtaW4tb3V0IGluZmluaXRlXCIsXG4gICAgICB9LFxuICAgICAgY3Vyc29yOiB7XG4gICAgICAgIG5vcm1hbDogJ3VybChcIi9pbWcvY3Vyc29ycy9ub3JtYWwucG5nXCIpLCBhdXRvJyxcblxuICAgICAgICBwb2ludGVyOiAndXJsKFwiL2ltZy9jdXJzb3JzL3BvaW50ZXIucG5nXCIpIDEyIDAsIGF1dG8nLFxuICAgICAgICBwb2ludGVyRG93bjogJ3VybChcIi9pbWcvY3Vyc29ycy9wb2ludGVyZG93bi5wbmdcIikgMTIgMCwgYXV0bycsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIGRhaXN5dWk6IHtcbiAgICB0aGVtZXM6IFtcbiAgICAgIHtcbiAgICAgICAgYmFzZToge1xuICAgICAgICAgIHByaW1hcnk6IGNvbG9ycy5jeWFuWzkwMF0sXG4gICAgICAgICAgc2Vjb25kYXJ5OiBjb2xvcnMuY3lhbls3MDBdLFxuICAgICAgICAgIGFjY2VudDogY29sb3JzLmN5YW5bNDAwXSxcbiAgICAgICAgICBuZXV0cmFsOiBjb2xvcnMuc2xhdGVbOTAwXSxcbiAgICAgICAgICBcImJhc2UtMTAwXCI6IGNvbG9ycy5zbGF0ZVs4MDBdLFxuICAgICAgICAgIGluZm86IGNvbG9ycy5pbmRpZ29bODAwXSxcbiAgICAgICAgICBzdWNjZXNzOiBjb2xvcnMuZW1lcmFsZFs2MDBdLFxuICAgICAgICAgIHdhcm5pbmc6IGNvbG9ycy55ZWxsb3dbNjAwXSxcbiAgICAgICAgICBlcnJvcjogXCIjQTgzNzVEXCIsXG5cbiAgICAgICAgICBcIi0tcm91bmRlZC1ib3hcIjogXCIwcmVtXCIsIC8vIGJvcmRlciByYWRpdXMgcm91bmRlZC1ib3ggdXRpbGl0eSBjbGFzcywgdXNlZCBpbiBjYXJkIGFuZCBvdGhlciBsYXJnZSBib3hlc1xuICAgICAgICAgIFwiLS1yb3VuZGVkLWJ0blwiOiBcIjByZW1cIiwgLy8gYm9yZGVyIHJhZGl1cyByb3VuZGVkLWJ0biB1dGlsaXR5IGNsYXNzLCB1c2VkIGluIGJ1dHRvbnMgYW5kIHNpbWlsYXIgZWxlbWVudFxuICAgICAgICAgIFwiLS1yb3VuZGVkLWJhZGdlXCI6IFwiMHJlbVwiLCAvLyBib3JkZXIgcmFkaXVzIHJvdW5kZWQtYmFkZ2UgdXRpbGl0eSBjbGFzcywgdXNlZCBpbiBiYWRnZXMgYW5kIHNpbWlsYXJcbiAgICAgICAgICBcIi0tYW5pbWF0aW9uLWJ0blwiOiBcIjBzXCIsIC8vIGR1cmF0aW9uIG9mIGFuaW1hdGlvbiB3aGVuIHlvdSBjbGljayBvbiBidXR0b25cbiAgICAgICAgICBcIi0tYW5pbWF0aW9uLWlucHV0XCI6IFwiMC4yc1wiLCAvLyBkdXJhdGlvbiBvZiBhbmltYXRpb24gZm9yIGlucHV0cyBsaWtlIGNoZWNrYm94LCB0b2dnbGUsIHJhZGlvLCBldGNcbiAgICAgICAgICBcIi0tYnRuLXRleHQtY2FzZVwiOiBcInVwcGVyY2FzZVwiLCAvLyBzZXQgZGVmYXVsdCB0ZXh0IHRyYW5zZm9ybSBmb3IgYnV0dG9uc1xuICAgICAgICAgIFwiLS1idG4tZm9jdXMtc2NhbGVcIjogXCIxXCIsIC8vIHNjYWxlIHRyYW5zZm9ybSBvZiBidXR0b24gd2hlbiB5b3UgZm9jdXMgb24gaXRcbiAgICAgICAgICBcIi0tYm9yZGVyLWJ0blwiOiBcIjFweFwiLCAvLyBib3JkZXIgd2lkdGggb2YgYnV0dG9uc1xuICAgICAgICAgIFwiLS10YWItYm9yZGVyXCI6IFwiMXB4XCIsIC8vIGJvcmRlciB3aWR0aCBvZiB0YWJzXG4gICAgICAgICAgXCItLXRhYi1yYWRpdXNcIjogXCIwLjVyZW1cIiwgLy8gYm9yZGVyIHJhZGl1cyBvZiB0YWJzXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIF0sXG4gICAgZGFya1RoZW1lOiBcImJhc2VcIixcbiAgfSxcbiAgcGx1Z2luczogW2RhaXN5dWksIHBhdHRlcm5QbHVnaW4sIHRhaWx3aW5kQW5pbWF0ZV0sXG59O1xuIl0sCiAgIm1hcHBpbmdzIjog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
