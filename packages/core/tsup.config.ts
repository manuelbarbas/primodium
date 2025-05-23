import fs from "fs";
import path from "path";
import { defineConfig } from "tsup";

/*const copyWasmFile = async () => {
  try {
    const sourceWasm = path.resolve(
      "node_modules/@skalenetwork/libte-ts/node_modules/@skalenetwork/t-encrypt/encrypt.wasm",
    );

    // Copy to dist folder
    const targetDir = path.resolve("dist");
    const targetWasm = path.join(targetDir, "encrypt.wasm");

    // Create directory if it doesn't exist
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Copy the file using the synchronous method
    fs.copyFileSync(sourceWasm, targetWasm);
    console.log("Copied encrypt.wasm to dist folder");

    // ALSO copy to public folder for development server
    const publicDir = path.resolve("public");
    const publicWasm = path.join(publicDir, "encrypt.wasm");

    // Create public directory if it doesn't exist
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Copy the file to public folder
    fs.copyFileSync(sourceWasm, publicWasm);
    console.log("Copied encrypt.wasm to public folder");
  } catch (error) {
    console.error("Error copying WASM file:", error);
  }
};*/

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
      "process.env.NODE_ENV": '"production"',
    },
    external: ["dotenv"],
    //  onSuccess: copyWasmFile,
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
    external: ["dotenv"],
  },
]);
