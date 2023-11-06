import { getSrcDirectory } from "@latticexyz/common/foundry";
import { loadConfig } from "@latticexyz/config/node";
import path from "path";
import { fileURLToPath } from "url";
import { StoreConfigWithPrototypes } from "../../prototypes/types";
import { terraingen } from "../terraingen";

const srcDir = "../../../../config/terrain.csv";

const __dirname = fileURLToPath(import.meta.url);
const config = (await loadConfig()) as StoreConfigWithPrototypes;
const csvSrc = path.resolve(__dirname, srcDir);
const srcDirectory = await getSrcDirectory();

terraingen(csvSrc, path.join(srcDirectory, config.codegenDirectory));
