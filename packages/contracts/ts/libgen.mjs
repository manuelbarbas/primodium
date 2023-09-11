import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(import.meta.url);
const librariesFolder = path.resolve(__dirname, "../../src/libraries");

const outputFileName = "Libraries.sol";

const files = fs.readdirSync(librariesFolder);

const fileList = files.map((file) => {
  if (file == outputFileName) return "";
  return `import { ${file.slice(0, -4)} } from "libraries/${file}";`;
});

const output = `// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

${fileList.join("\n")}
`;

fs.writeFileSync(path.resolve(librariesFolder, outputFileName), output);
