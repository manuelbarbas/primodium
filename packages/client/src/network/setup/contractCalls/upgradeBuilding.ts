import { Entity } from "@latticexyz/recs";
import { ampli } from "src/ampli";
import { components } from "src/network/components";
import { TxQueueOptions } from "src/network/components/customComponents/TransactionQueueComponent";
import { execute } from "src/network/txExecute/txExecute";
import { MUD } from "src/network/types";
import { getEntityTypeName } from "src/util/common";
import { TransactionQueueType } from "src/util/constants";
import { getSystemId, hashEntities } from "src/util/encode";
import { bigintToNumber } from "src/util/number";
import { Hex } from "viem";
import { parseReceipt } from "../../../util/analytics/parseReceipt";

export const upgradeBuilding = async (
  mud: MUD,
  building: Entity,
  options?: Partial<TxQueueOptions<TransactionQueueType.Upgrade>>
) => {
  const position = components.Position.get(building);
  if (!position) return;

  await execute(
    {
      mud,
      functionName: "Primodium__upgradeBuilding",
      systemId: getSystemId("UpgradeBuildingSystem"),
      args: [building as Hex],
      withSession: true,
      options: { gas: 2_500_000n },
    },
    {
      id: hashEntities(TransactionQueueType.Upgrade, building),
      type: TransactionQueueType.Upgrade,
      ...options,
    },
    (receipt) => {
      const building = components.SelectedBuilding.get()?.value;
      const buildingType = components.BuildingType.get(building)?.value as Entity;
      const currLevel = components.Level.get(building)?.value || 0n;

      ampli.systemUpgrade({
        asteroidCoord: position.parentEntity!,
        buildingType: getEntityTypeName(buildingType),
        coord: [position.x, position.y],
        currLevel: bigintToNumber(currLevel),
        ...parseReceipt(receipt),
      });
    }
  );
};
