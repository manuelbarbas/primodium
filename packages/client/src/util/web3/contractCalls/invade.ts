import { Entity } from "@latticexyz/recs";
import { execute } from "src/network/actions";
import { SetupNetworkResult } from "src/network/types";
import { TransactionQueueType } from "src/util/constants";
import { encodeNumberEntity } from "src/util/encode";
import { Hex } from "viem";

export const invade = async (rockEntity: Entity, network: SetupNetworkResult) => {
  await execute(() => network.worldContract.write.invade([rockEntity as Hex]), network, {
    id: encodeNumberEntity(TransactionQueueType.Land, rockEntity),
  });
};
