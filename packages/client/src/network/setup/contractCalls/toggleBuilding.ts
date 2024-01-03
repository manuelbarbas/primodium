import { Entity } from "@latticexyz/recs";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { components } from "src/network/components";
import { AnyAccount, SetupNetworkResult } from "src/network/types";
import { bigintToNumber } from "src/util/bigint";
import { getBlockTypeName } from "src/util/common";
import { TransactionQueueType } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { Hex } from "viem";
import { parseReceipt } from "../../../util/analytics/parseReceipt";

export async function toggleBuilding(network: SetupNetworkResult, account: AnyAccount, building: Entity) {
  const position = components.Position.get(building);
  const active = components.IsActive.get(building);

  if (!position || !active) return;

  await execute(
    () => account.worldContract.write.toggleBuilding([{ ...position, parent: position.parent as Hex }]),
    network,
    {
      id: hashEntities(TransactionQueueType.Toggle, building),
    },
    (receipt) => {
      const asteroid = components.Home.get(account.entity)?.asteroid;
      const buildingType = components.BuildingType.get(building)?.value as Entity;
      const currLevel = components.Level.get(building)?.value || 0;

      ampli.systemToggleBuilding({
        asteroidCoord: asteroid!,
        buildingType: getBlockTypeName(buildingType),
        buildingActiveFrom: active.value,
        coord: [position.x, position.y],
        currLevel: bigintToNumber(currLevel),
        ...parseReceipt(receipt),
      });
    }
  );
}
