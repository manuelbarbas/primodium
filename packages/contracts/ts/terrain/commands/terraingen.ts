import { getSrcDirectory } from "@latticexyz/common/foundry";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { terraingen } from "../terraingen";

const __dirname = fileURLToPath(import.meta.url);

const configDir = path.resolve(__dirname, "../../../../config");
const tmxFiles = fs.readdirSync(configDir).filter((file) => file.endsWith(".tmx"));
const tmxSrcs = tmxFiles.map((file) => ({ id: file.charAt(0), filePath: path.join(configDir, file) }));

const srcDirectory = await getSrcDirectory();

const generateTerrain = () => {
  terraingen(tmxSrcs, path.join(srcDirectory, "codegen"));
};

generateTerrain();
