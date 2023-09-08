import { singletonEntity } from "@latticexyz/store-sync/recs";
import { Cheatcodes } from "@primodiumxyz/mud-game-tools";
import { SetupResult } from "src/network/types";

export const setupCheatcodes = (mud: SetupResult): Cheatcodes => {
  return {
    setCounter: {
      params: [{ name: "value", type: "number" }],
      function: async (value: number) => {
        console.log("value:", value);
        mud.contractCalls.setComponentValue(mud.components.Counter, singletonEntity, { value });
      },
    },
    removeCounter: {
      params: [],
      function: async () => {
        mud.contractCalls.removeComponent(mud.components.Counter, singletonEntity);
      },
    },
  };
};
