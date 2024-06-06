/// <reference types="vitest" />
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: [
      { find: "@", replacement: resolve(__dirname, "src") },
      { find: "@test", replacement: resolve(__dirname, "__tests__") },
      { find: "@primodiumxyz/reactive-tables", replacement: resolve(__dirname, "dist") },
    ],
  },
});
