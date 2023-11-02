import { execute } from "src/network/actions";
import { components } from "src/network/components";
import { SetupNetworkResult } from "src/network/types";
import { TransactionQueueType } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { Entity } from "@latticexyz/recs";
import { Hex } from "viem";

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
      // TODO: parse receipt
    }
  );
}
