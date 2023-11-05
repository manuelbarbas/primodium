import { Coord } from "@latticexyz/utils";
import { Hex } from "viem";
import { BigNumber } from "ethers";
import { ampli } from "src/ampli";
import { EBuilding } from "contracts/config/enums";
import { components } from "src/network/components";
import { SetupNetworkResult } from "src/network/types";
import { execute } from "src/network/actions";
import { parseReceipt } from "../../analytics/parseReceipt";
import { BuildingEntityLookup, TransactionQueueType } from "src/util/constants";
import { getBuildingTopLeft } from "src/util/building";
import { encodeCoord, hashEntities } from "src/util/encode";
import { getBlockTypeName } from "src/util/common";

export const buildBuilding = async (network: SetupNetworkResult, building: EBuilding, coord: Coord) => {
  const activeAsteroid = components.Home.get(network.playerEntity)?.asteroid;
  if (!activeAsteroid) return;

  const position = { ...coord, parent: activeAsteroid as Hex };

  await execute(
    () => network.worldContract.write.build([building, position]),
    network,
    {
      id: hashEntities(TransactionQueueType.Build, encodeCoord(coord)),
      type: TransactionQueueType.Build,
      metadata: {
        coord: getBuildingTopLeft(coord, BuildingEntityLookup[building]),
        buildingType: BuildingEntityLookup[building],
      },
    },
    (receipt) => {
      ampli.systemBuild({
        asteroidCoord: BigNumber.from(activeAsteroid).toString(),
        buildingType: getBlockTypeName(BuildingEntityLookup[building]),
        coord: [coord.x, coord.y],
        currLevel: 0,
        ...parseReceipt(receipt),
      });
    }
  );
};
