import { Counter } from "src/network/components/chainComponents";
import { singletonIndex } from "src/network/world";
import { Cheatcodes } from "src/components/dev/Cheatcodes";
import { Network } from "src/network/layer";

export const setupCheatCodes = (mud: Network): Cheatcodes => ({
  addCounter: {
    params: [{ name: "off", type: "number" }],
    function: (value: number) => {
      mud.dev.setContractComponentValue(singletonIndex, Counter, {
        value: value,
      });
    },
  },
});
