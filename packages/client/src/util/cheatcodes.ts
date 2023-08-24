import {
  MaxUtility,
  OccupiedUtilityResource,
} from "src/network/components/chainComponents";
import { Cheatcodes } from "src/components/dev/Cheatcodes";
import { Network } from "src/network/layer";
import { BlockType } from "./constants";
import { Account } from "src/network/components/clientComponents";
import { hashKeyEntity } from "./encode";

export const setupCheatcodes = (mud: Network): Cheatcodes => {
  return {
    setMaxHousing: {
      params: [{ name: "maxHousing", type: "number" }],
      function: (maxHousing: number) => {
        const player = Account.get()?.value;
        if (!player) throw new Error("No player found");
        const playerResource = hashKeyEntity(
          BlockType.HousingUtilityResource,
          player
        );
        mud.dev.setEntityContractComponentValue(playerResource, MaxUtility, {
          value: maxHousing,
        });
      },
    },
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
  };
};
