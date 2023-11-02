import { Entity } from "@latticexyz/recs";
import { execute } from "src/network/actions";
import { SetupNetworkResult } from "src/network/types";
import { TransactionQueueType } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { Hex } from "viem";

export const invade = async (rockEntity: Entity, network: SetupNetworkResult) => {
  await execute(
    () => network.worldContract.write.invade([rockEntity as Hex]),
    network,
    {
      id: hashEntities(TransactionQueueType.Land, rockEntity),
    },
    (receipt) => {
      // handle amplitude here
    }
  );
};
