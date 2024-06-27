import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: {
      index: "src/index.ts",
    },
    outDir: "dist",
    format: ["esm"],
    dts: true,
    clean: true,
    minify: true,
    tsconfig: "./tsconfig.json",
    define: {
      "process.env.PRI_DEV": JSON.stringify(process.env.PRI_DEV || "false"),
    },
  },
  {
    entry: ["src/react/index.ts"], // Entry point for the React-specific build
    outDir: "dist/react",
    format: ["esm"],
    dts: {
      entry: "src/react/index.ts", // Generate type declaration for the React-specific build
      // outFile: 'dist/react.d.ts',
    },
    minify: true,
    tsconfig: "./tsconfig.json",
    clean: true, // Don't clean the dist folder when building the React file
  },
]);
