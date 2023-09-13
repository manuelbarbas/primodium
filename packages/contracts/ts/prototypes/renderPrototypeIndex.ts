import { renderedSolidityHeader } from "@latticexyz/common/codegen";
import { StoreConfig } from "@latticexyz/store";
import { PrototypesConfig } from "./prototypeConfig";

export function renderPrototypeIndex(prototypes: PrototypesConfig<StoreConfig>) {
  return `
  ${renderedSolidityHeader}
  
  ${Object.keys(prototypes)
    .map((key) => `import {${key}Prototype, ${key}PrototypeId} from "./prototypes/${key}Prototype.sol"`)
    .join(";")};
  `;
}
