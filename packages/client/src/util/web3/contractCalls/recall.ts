import { Hex } from "viem";
import { Entity } from "@latticexyz/recs";
import { decodeEntity } from "@latticexyz/store-sync/recs";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { components } from "src/network/components";
import { SetupNetworkResult } from "src/network/types";
import { TransactionQueueType } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { parseReceipt } from "../../analytics/parseReceipt";

export const recallArrival = async (rockEntity: Entity, arrivalEntity: Entity, network: SetupNetworkResult) => {
  const { key } = decodeEntity(components.MapItemArrivals.metadata.keySchema, arrivalEntity);

  await execute(
    () => network.worldContract.write.recallArrival([rockEntity as Hex, key as Hex]),
    network,
    {
      id: hashEntities(TransactionQueueType.Recall, key, rockEntity),
    },
    (receipt) => {
      const asteroid = components.Home.get(network.playerEntity)?.asteroid;

      ampli.systemRecallArrival({
        asteroidCoord: asteroid!,
        ...parseReceipt(receipt),
      });
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
      const asteroid = components.Home.get(network.playerEntity)?.asteroid;

      ampli.systemRecallArrival({
        asteroidCoord: asteroid!,
        ...parseReceipt(receipt),
      });
    }
  );
};
