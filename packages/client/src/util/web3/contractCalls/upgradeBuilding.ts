import { Entity } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { components } from "src/network/components";
import { SetupNetworkResult } from "src/network/types";
import { bigintToNumber } from "src/util/bigint";
import { getBlockTypeName } from "src/util/common";
import { TransactionQueueType } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { Hex } from "viem";
import { parseReceipt } from "../../analytics/parseReceipt";

export const upgradeBuilding = async (coord: Coord, network: SetupNetworkResult) => {
  const asteroid = components.Home.get(network.playerEntity)?.asteroid;
  if (!asteroid) return;

  const position = { ...coord, parent: asteroid as Hex };
  await execute(
    () => network.worldContract.write.upgradeBuilding([position]),
    network,
    {
      id: hashEntities(TransactionQueueType.Upgrade, coord.x, coord.y),
      type: TransactionQueueType.Upgrade,
    },
    (receipt) => {
      const building = components.SelectedBuilding.get()?.value;
      const buildingType = components.BuildingType.get(building)?.value as Entity;
      const currLevel = components.Level.get(building)?.value || 0n;

      ampli.systemUpgrade({
        asteroidCoord: asteroid!,
        buildingType: getBlockTypeName(buildingType),
        coord: [coord.x, coord.y],
        currLevel: bigintToNumber(currLevel),
        ...parseReceipt(receipt),
      });
    }
  );
};
