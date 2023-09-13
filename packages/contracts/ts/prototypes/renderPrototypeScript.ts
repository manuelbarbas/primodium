import { renderedSolidityHeader } from "@latticexyz/common/codegen";
import { StoreConfig } from "@latticexyz/store";
import { PrototypesConfig } from "./prototypeConfig";

export function renderPrototypeScript(prototypeConfig: PrototypesConfig<StoreConfig>) {
  return `
  ${renderedSolidityHeader}
  
  import { IStore } from "@latticexyz/store/src/IStore.sol";

  import {${Object.keys(prototypeConfig)
    .map((key) => `${key}Prototype`)
    .join(",")}} from "../Prototypes.sol";

  function createPrototypes(IStore store) {
    ${Object.keys(prototypeConfig)
      .map((key) => `${key}Prototype(store)`)
      .join(";")};
  }`;
}
