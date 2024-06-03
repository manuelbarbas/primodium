import { Entity } from "@latticexyz/recs";
import { ampli } from "src/ampli";
import { components } from "src/network/components";
import { execute } from "src/network/txExecute/txExecute";
import { MUD } from "src/network/types";
import { getEntityTypeName } from "src/util/common";
import { TransactionQueueType } from "src/util/constants";
import { getSystemId, hashEntities } from "src/util/encode";
import { bigintToNumber } from "src/util/number";
import { Hex } from "viem";
import { parseReceipt } from "../../../util/analytics/parseReceipt";

export async function demolishBuilding(mud: MUD, building: Entity, onComplete?: () => void) {
  const position = components.Position.get(building);

  if (!position) return;

  await execute(
    {
      mud,
      functionName: "Pri_11__destroy",
      systemId: getSystemId("DestroySystem"),
      args: [building as Hex],
      withSession: true,
    },
    {
      id: hashEntities(TransactionQueueType.Demolish, building),
    },
    // TODO: we don't need to use coord here any longer
    (receipt) => {
      onComplete?.();
      const buildingType = components.BuildingType.get(building)?.value as Entity;
      const currLevel = components.Level.get(building)?.value || 0;

      ampli.systemDestroy({
        asteroidCoord: position.parentEntity,
        buildingType: getEntityTypeName(buildingType),
        coord: [position.x, position.y],
        currLevel: bigintToNumber(currLevel),
        ...parseReceipt(receipt),
      });
    }
  );
}
