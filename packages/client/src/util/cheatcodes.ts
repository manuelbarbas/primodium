import { Cheatcodes } from "src/components/dev/CheatcodesList";
import { SetupResult } from "src/network/types";

export const setupCheatcodes = (mud: SetupResult): Cheatcodes => {
  return {
    increaseMaxMoves: {
      params: [{ name: "value", type: "number" }],
      function: async (value: number) => {
        console.log("value:", value);
        mud.contractCalls.increment();
      },
    },
  };
};
