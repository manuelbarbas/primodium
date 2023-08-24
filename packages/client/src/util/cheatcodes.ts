import {
  MaxUtility,
  OccupiedUtilityResource,
} from "src/network/components/chainComponents";
import { Cheatcode, Cheatcodes } from "src/components/dev/Cheatcodes";
import { Network } from "src/network/layer";
import { BlockIdToKey, BlockType } from "./constants";
import {
  Account,
  SelectedBuilding,
} from "src/network/components/clientComponents";
import { hashKeyEntity } from "./encode";
import { train } from "./web3";

export const setupCheatcodes = (mud: Network): Cheatcodes => {
  const setMaxHousing: Cheatcode = {
    params: [{ name: "maxHousing", type: "number" }],
    function: async (maxHousing: number) => {
      const player = Account.get()?.value;
      if (!player) throw new Error("No player found");
      const playerResource = hashKeyEntity(
        BlockType.HousingUtilityResource,
        player
      );
      await mud.dev.setEntityContractComponentValue(
        playerResource,
        MaxUtility,
        {
          value: maxHousing,
        }
      );
    },
  };

  return {
    setMaxHousing,
    setHousing: {
      params: [{ name: "housing", type: "number" }],
      function: (housing: number) => {
        const player = Account.get()?.value;
        if (!player) throw new Error("No player found");
        const playerResource = hashKeyEntity(
          BlockType.HousingUtilityResource,
          player
        );
        mud.dev.setEntityContractComponentValue(
          playerResource,
          OccupiedUtilityResource,
          {
            value: housing,
          }
        );
      },
    },
    trainDebugUnits: {
      params: [{ name: "count", type: "number" }],
      function: async (count: number) => {
        const building = SelectedBuilding.get()?.value;
        if (!building) throw new Error("No building selected");
        setMaxHousing.function(count);
        console.log(
          `Training ${count} debug units on building ${BlockIdToKey[building]}`
        );
        await train(building, BlockType.DebugUnit, count, mud);
        return `Training ${count} debug units on building ${BlockIdToKey[building]}`;
      },
    },
  };
};
