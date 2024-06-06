import { Entity } from "@latticexyz/recs";
import { Coord } from "@primodiumxyz/engine/types";
import { ampli } from "src/ampli";
import { components } from "src/network/components";
import { execute } from "src/network/txExecute/txExecute";
import { MUD } from "src/network/types";
import { getBuildingTopLeft } from "src/util/building";
import { getEntityTypeName } from "src/util/common";
import { TransactionQueueType } from "src/util/constants";
import { getSystemId, hashEntities } from "src/util/encode";
import { bigintToNumber } from "src/util/number";
import { Hex } from "viem";
import { parseReceipt } from "../../../util/analytics/parseReceipt";

export const moveBuilding = async (mud: MUD, building: Entity, coord: Coord, onComplete?: () => void) => {
  // todo: find a cleaner way to extract this value in all web3 functions
  const activeAsteroid = components.ActiveRock.get()?.value;
  if (!activeAsteroid) return;

  const prevPosition = components.Position.get(building);
  const position = { ...coord, parentEntity: activeAsteroid as Hex };
  const buildingType = components.BuildingType.get(building)?.value as Entity;

  if (!prevPosition || !buildingType) return;

  await execute(
    {
      mud,
      functionName: "Pri_11__moveBuilding",
      systemId: getSystemId("MoveBuildingSystem"),
      args: [building as Hex, position],
      withSession: true,
      options: { gas: 3_000_000n },
    },
    {
      id: hashEntities(TransactionQueueType.Move, building),
      type: TransactionQueueType.Move,
      metadata: {
        buildingType,
        coord: getBuildingTopLeft(coord, buildingType),
      },
    },
    // TODO: we don't need to use coord here any longer
    (receipt) => {
      onComplete?.();
      const buildingType = components.BuildingType.get(building)?.value as Entity;
      const currLevel = components.Level.get(building)?.value || 0;

      ampli.systemMoveBuilding({
        asteroidCoord: activeAsteroid,
        buildingType: getEntityTypeName(buildingType),
        coord: [prevPosition.x, prevPosition.y],
        endCoord: [position.x, position.y],
        currLevel: bigintToNumber(currLevel),
        ...parseReceipt(receipt),
      });
    }
  );
};
