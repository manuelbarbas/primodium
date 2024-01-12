import { Entity } from "@latticexyz/recs";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { components } from "src/network/components";
import { MUD } from "src/network/types";
import { bigintToNumber } from "src/util/bigint";
import { getBlockTypeName } from "src/util/common";
import { TransactionQueueType } from "src/util/constants";
import { getSystemId, hashEntities } from "src/util/encode";
import { Hex } from "viem";
import { parseReceipt } from "../../../util/analytics/parseReceipt";

export async function demolishBuilding(mud: MUD, building: Entity) {
  const position = components.Position.get(building);

  if (!position) return;

  await execute(
    {
      mud,
      functionName: "destroy",
      systemId: getSystemId("DestroySystem"),
      args: [{ ...position, parent: position.parent as Hex }],
      delegate: true,
    },
    {
      id: hashEntities(TransactionQueueType.Demolish, building),
    },
    (receipt) => {
      const asteroid = components.Home.get(mud.playerAccount.entity)?.asteroid;
      const buildingType = components.BuildingType.get(building)?.value as Entity;
      const currLevel = components.Level.get(building)?.value || 0;

      ampli.systemDestroy({
        asteroidCoord: asteroid!,
        buildingType: getBlockTypeName(buildingType),
        coord: [position.x, position.y],
        currLevel: bigintToNumber(currLevel),
        ...parseReceipt(receipt),
      });
    }
  );
}
