import { Entity } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { components } from "src/network/components";
import { MUD } from "src/network/types";
import { bigintToNumber } from "src/util/bigint";
import { getBuildingTopLeft } from "src/util/building";
import { getBlockTypeName } from "src/util/common";
import { TransactionQueueType } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { Hex } from "viem";
import { parseReceipt } from "../../../util/analytics/parseReceipt";

export const moveBuilding = async (mud: MUD, building: Entity, coord: Coord) => {
  // todo: find a cleaner way to extract this value in all web3 functions
  const activeAsteroid = components.Home.get(mud.playerAccount.entity)?.asteroid;
  if (!activeAsteroid) return;

  const prevPosition = components.Position.get(building);
  const position = { ...coord, parent: activeAsteroid as Hex };
  const buildingType = components.BuildingType.get(building)?.value as Entity;

  if (!prevPosition || !buildingType) return;

  await execute(
    mud,
    (account) =>
      account.worldContract.write.moveBuilding([{ ...prevPosition, parent: prevPosition.parent as Hex }, position]),
    {
      delegate: true,
      id: hashEntities(TransactionQueueType.Move, building),
      type: TransactionQueueType.Move,
      metadata: {
        buildingType,
        coord: getBuildingTopLeft(coord, buildingType),
      },
    },
    (receipt) => {
      const asteroid = components.Home.get(mud.playerAccount.entity)?.asteroid;
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
