import { Entity } from "@latticexyz/recs";
import { decodeEntity } from "@latticexyz/store-sync/recs";
import { execute } from "src/network/actions";
import { components } from "src/network/components";
import { SetupNetworkResult } from "src/network/types";
import { TransactionQueueType } from "src/util/constants";
import { encodeKeyEntity, encodeNumberEntity } from "src/util/encode";
import { Hex } from "viem";

export const recall = async (rockEntity: Entity, arrivalEntity: Entity, network: SetupNetworkResult) => {
  const { key } = decodeEntity(components.MapItemArrivals.metadata.keySchema, arrivalEntity);

  await execute(() => network.worldContract.write.recall([rockEntity as Hex, key as Hex]), network, {
    id: encodeNumberEntity(TransactionQueueType.Recall, encodeKeyEntity(key, rockEntity)),
  });
};

export const recallAll = async (rockEntity: Entity, network: SetupNetworkResult) => {
  await execute(() => network.worldContract.write.recallAll([rockEntity as Hex]), network, {
    id: encodeNumberEntity(TransactionQueueType.Recall, rockEntity),
  });
};
