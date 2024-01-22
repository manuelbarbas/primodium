import { Entity } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
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

export const upgradeBuilding = async (mud: MUD, coord: Coord) => {
  const asteroid = components.SelectedRock.get()?.value;
  if (!asteroid) return;

  const position = { ...coord, parent: asteroid as Hex };
  await execute(
    {
      mud,
      functionName: "upgradeBuilding",
      systemId: getSystemId("UpgradeBuildingSystem"),
      args: [position],
      delegate: true,
    },
    {
      id: hashEntities(TransactionQueueType.Upgrade, coord.x, coord.y),
      type: TransactionQueueType.Upgrade,
    },
    (receipt) => {
      const building = components.SelectedBuilding.get()?.value;
      const buildingType = components.BuildingType.get(building)?.value as Entity;
      const currLevel = components.Level.get(building)?.value || 0n;

      ampli.systemUpgrade({
        asteroidCoord: asteroid!,
        buildingType: getBlockTypeName(buildingType),
        coord: [coord.x, coord.y],
        currLevel: bigintToNumber(currLevel),
        ...parseReceipt(receipt),
      });
    }
  );
};
