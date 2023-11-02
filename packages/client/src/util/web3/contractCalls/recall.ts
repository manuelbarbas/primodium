import { Entity } from "@latticexyz/recs";
import { decodeEntity } from "@latticexyz/store-sync/recs";
import { execute } from "src/network/actions";
import { components } from "src/network/components";
import { SetupNetworkResult } from "src/network/types";
import { TransactionQueueType } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { Hex } from "viem";

export const recallArrival = async (rockEntity: Entity, arrivalEntity: Entity, network: SetupNetworkResult) => {
  const { key } = decodeEntity(components.MapItemArrivals.metadata.keySchema, arrivalEntity);

  await execute(
    () => network.worldContract.write.recallArrival([rockEntity as Hex, key as Hex]),
    network,
    {
      id: hashEntities(TransactionQueueType.Recall, arrivalEntity, rockEntity),
    },
    (receipt) => {
      // TODO: parse receipt
    }
  );
};

export const recallStationedUnits = async (rockEntity: Entity, network: SetupNetworkResult) => {
  await execute(
    () => network.worldContract.write.recallStationedUnits([rockEntity as Hex]),
    network,
    {
      id: hashEntities(TransactionQueueType.Recall, rockEntity),
    },
    (receipt) => {
      // TODO: parse receipt
    }
  );
};
