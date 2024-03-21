import { StoreInput } from "@latticexyz/store";
import { PrototypesConfig } from "./types";

export function renderPrototypeScript(prototypeConfig: PrototypesConfig<StoreInput>) {
  return `
  import { IStore } from "@latticexyz/store/src/IStore.sol";

  function createPrototypes(IStore store) {
    ${Object.keys(prototypeConfig)
      .map((key) => `${key}Prototype(store)`)
      .join(";")};
  }`;
}
