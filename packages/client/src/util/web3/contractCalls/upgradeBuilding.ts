import { Coord } from "@latticexyz/utils";
import { execute } from "src/network/actions";
import { components } from "src/network/components";
import { SetupNetworkResult } from "src/network/types";
import { TransactionQueueType } from "src/util/constants";
import { Hex } from "viem";
import { encodeCoord, encodeNumberEntity } from "src/util/encode";
import { ampli } from "src/ampli";
import { EBuilding, MUDEnums } from "contracts/config/enums";
import { parseReceipt } from "../../analytics/parseReceipt";

export const upgradeBuilding = async (coord: Coord, network: SetupNetworkResult) => {
  const asteroid = components.Home.get(network.playerEntity)?.asteroid;
  if (!asteroid) return;

  const position = { ...coord, parent: asteroid as Hex };
  await execute(
    () => network.worldContract.write.upgradeBuilding([position]),
    network,
    {
      id: encodeNumberEntity(TransactionQueueType.Upgrade, encodeCoord(coord)),
      type: TransactionQueueType.Upgrade,
    },
    (receipt) => {
      const building = components.SelectedBuilding.get()?.value;
      const buildingType = components.BuildingType.get(building)?.value as unknown as EBuilding;
      const currLevel = components.Level.get(building)?.value || 0n;

      ampli.systemUpgrade({
        asteroidCoord: asteroid!,
        buildingType: MUDEnums.EBuilding[buildingType!],
        coord: [coord.x, coord.y],
        currLevel: bigintToNumber(currLevel),
        ...parseReceipt(receipt),
      });
    }
  );
};
