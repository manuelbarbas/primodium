import { execute } from "src/network/actions";
import { components } from "src/network/components";
import { SetupNetworkResult } from "src/network/types";
import { TransactionQueueType } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { Entity } from "@latticexyz/recs";
import { Hex } from "viem";
import { ampli } from "src/ampli";
import { EBuilding, MUDEnums } from "contracts/config/enums";
import { parseReceipt } from "../../analytics/parseReceipt";

export async function demolishBuilding(building: Entity, network: SetupNetworkResult) {
  const position = components.Position.get(building);

  if (!position) return;

  await execute(
    () => network.worldContract.write.destroy([{ ...position, parent: position.parent as Hex }]),
    network,
    {
      id: hashEntities(TransactionQueueType.Demolish, building),
    },
    (receipt) => {
      const asteroid = components.Home.get(network.playerEntity)?.asteroid;
      const buildingType = components.BuildingType.get(building)?.value as unknown as EBuilding;
      const currLevel = components.Level.get(building)?.value || 0;

      ampli.systemDestroy({
        asteroidCoord: asteroid!,
        buildingType: MUDEnums.EBuilding[buildingType],
        coord: [position.x, position.y],
        currLevel: bigintToNumber(currLevel),
        ...parseReceipt(receipt),
      });
    }
  );
}
