import { Coord } from "@latticexyz/utils";
import { EBuilding } from "contracts/config/enums";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { components } from "src/network/components";
import { SetupNetworkResult } from "src/network/types";
import { getBuildingTopLeft } from "src/util/building";
import { getBlockTypeName } from "src/util/common";
import { BuildingEntityLookup, TransactionQueueType } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { Hex } from "viem";
import { parseReceipt } from "../../analytics/parseReceipt";

export const buildBuilding = async (network: SetupNetworkResult, building: EBuilding, coord: Coord) => {
  const activeAsteroid = components.Home.get(network.playerEntity)?.asteroid;
  if (!activeAsteroid) return;

  const position = { ...coord, parent: activeAsteroid as Hex };

  await execute(
    () => network.worldContract.write.build([building, position], { gas: 7000000n }),
    network,
    {
      id: hashEntities(TransactionQueueType.Build, coord.x, coord.y),
      type: TransactionQueueType.Build,
      metadata: {
        coord: getBuildingTopLeft(coord, BuildingEntityLookup[building]),
        buildingType: BuildingEntityLookup[building],
      },
    },
    (receipt) => {
      ampli.systemBuild({
        asteroidCoord: activeAsteroid,
        buildingType: getBlockTypeName(BuildingEntityLookup[building]),
        coord: [coord.x, coord.y],
        currLevel: 0,
        ...parseReceipt(receipt),
      });
    }
  );
};
