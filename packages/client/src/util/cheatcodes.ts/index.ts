import { DevSystems } from "src/network/systems/setupDevSystems";
import { Counter } from "src/network/components/chainComponents";
import { singletonIndex } from "src/network/world";
import { Cheatcodes } from "src/components/dev/Cheatcodes";

export const setupCheatCodes = (dev: DevSystems): Cheatcodes => ({
  addCounter: {
    params: [{ name: "off", type: "number" }],
    function: (value: number) => {
      dev.setContractComponentValue(singletonIndex, Counter, {
        value: value,
      });
    },
  },
});
