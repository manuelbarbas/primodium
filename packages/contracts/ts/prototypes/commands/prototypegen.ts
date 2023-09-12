import { getSrcDirectory } from "@latticexyz/common/foundry";
import { loadConfig } from "@latticexyz/config/node";
import path from "path";
import { StoreConfigWithPrototypes } from "../prototypeConfig";
import { prototypegen } from "../prototypegen";

const config = (await loadConfig()) as StoreConfigWithPrototypes;
const srcDirectory = await getSrcDirectory();

prototypegen(config, path.join(srcDirectory, config.codegenDirectory));
