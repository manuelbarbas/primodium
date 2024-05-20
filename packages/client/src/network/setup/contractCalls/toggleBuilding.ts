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

export async function toggleBuilding(mud: MUD, building: Entity) {
  const position = components.Position.get(building);
  const active = components.IsActive.get(building);

  if (!position || !active) return;

  await execute(
    {
      mud,
      functionName: "Pri_11__toggleBuilding",
      systemId: getSystemId("ToggleBuildingSystem"),
      args: [building as Hex],
      withSession: true,
    },
    {
      id: hashEntities(TransactionQueueType.Toggle, building),
    },
    (receipt) => {
      const buildingType = components.BuildingType.get(building)?.value as Entity;
      const currLevel = components.Level.get(building)?.value || 0;

      ampli.systemToggleBuilding({
        asteroidCoord: position.parentEntity,
        buildingType: getEntityTypeName(buildingType),
        buildingActiveFrom: active.value,
        coord: [position.x, position.y],
        currLevel: bigintToNumber(currLevel),
        ...parseReceipt(receipt),
      });
    }
  );
}
