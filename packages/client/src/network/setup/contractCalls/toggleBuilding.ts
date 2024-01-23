import { Entity } from "@latticexyz/recs";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { components } from "src/network/components";
import { MUD } from "src/network/types";
import { getBlockTypeName } from "src/util/common";
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
      functionName: "toggleBuilding",
      systemId: getSystemId("ToggleBuildingSystem"),
      args: [{ ...position, parent: position.parent as Hex }],
      delegate: true,
    },
    {
      id: hashEntities(TransactionQueueType.Toggle, building),
    },
    (receipt) => {
      const buildingType = components.BuildingType.get(building)?.value as Entity;
      const currLevel = components.Level.get(building)?.value || 0;

      ampli.systemToggleBuilding({
        asteroidCoord: position.parent,
        buildingType: getBlockTypeName(buildingType),
        buildingActiveFrom: active.value,
        coord: [position.x, position.y],
        currLevel: bigintToNumber(currLevel),
        ...parseReceipt(receipt),
      });
    }
  );
}
