import { Cheatcodes } from "src/components/dev/CheatcodesList";
import { SetupResult } from "src/network/types";

export const setupCheatcodes = (mud: SetupResult): Cheatcodes => {
  return {
    increaseMaxMoves: {
      params: [{ name: "value", type: "number" }],
      function: async (value: number) => {
        console.log("value:", value);
        mud.systems.increment();
      },
    },

    setWorldSpeed: {
      params: [{ name: "value", type: "number" }],
      function: async (value: number) => {
        value = SPEED_SCALE / value;
        await mud.dev.setEntityContractComponentValue(singletonEntity, P_WorldSpeed, {
          value,
        });
      },
    },
  };
};
