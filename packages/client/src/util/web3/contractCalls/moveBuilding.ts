import { Hex } from "viem";
import { Entity } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { components } from "src/network/components";
import { SetupNetworkResult } from "src/network/types";
import { getBuildingTopLeft } from "src/util/building";
import { TransactionQueueType } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { parseReceipt } from "../../analytics/parseReceipt";
import { getBlockTypeName } from "src/util/common";

export const moveBuilding = async (network: SetupNetworkResult, building: Entity, coord: Coord) => {
  // todo: find a cleaner way to extract this value in all web3 functions
  const activeAsteroid = components.Home.get(network.playerEntity)?.asteroid;
  if (!activeAsteroid) return;

  const prevPosition = components.Position.get(building);
  const position = { ...coord, parent: activeAsteroid as Hex };
  const buildingType = components.BuildingType.get(building)?.value as Entity;

  if (!prevPosition || !buildingType) return;

  await execute(
    () => network.worldContract.write.moveBuilding([{ ...prevPosition, parent: prevPosition.parent as Hex }, position]),
    network,
    {
      id: hashEntities(TransactionQueueType.Build, building),
      type: TransactionQueueType.Build,
      metadata: {
        buildingType,
        coord: getBuildingTopLeft(coord, buildingType),
      },
    },
    (receipt) => {
      const asteroid = components.Home.get(network.playerEntity)?.asteroid;
      const buildingType = components.BuildingType.get(building)?.value as Entity;
      const currLevel = components.Level.get(building)?.value || 0;

      ampli.systemMoveBuilding({
        asteroidCoord: asteroid!,
        buildingType: getBlockTypeName(buildingType),
        coord: [prevPosition.x, prevPosition.y],
        endCoord: [position.x, position.y],
        currLevel: bigintToNumber(currLevel),
        ...parseReceipt(receipt),
      });
    }
  );
};
