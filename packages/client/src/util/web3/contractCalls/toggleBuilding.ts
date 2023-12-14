import { execute } from "src/network/actions";
import { components } from "src/network/components";
import { SetupNetworkResult } from "src/network/types";
import { TransactionQueueType } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { Entity } from "@latticexyz/recs";
import { Hex } from "viem";
import { ampli } from "src/ampli";
import { parseReceipt } from "../../analytics/parseReceipt";
import { getBlockTypeName } from "src/util/common";
import { bigintToNumber } from "src/util/bigint";

export async function toggleBuilding(building: Entity, network: SetupNetworkResult) {
  const position = components.Position.get(building);
  const active = components.IsActive.get(building);

  if (!position || !active) return;

  await execute(
    () => network.worldContract.write.toggleBuilding([{ ...position, parent: position.parent as Hex }]),
    network,
    {
      id: hashEntities(TransactionQueueType.Toggle, building),
    },
    (receipt) => {
      const asteroid = components.Home.get(network.playerEntity)?.asteroid;
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
