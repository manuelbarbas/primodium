import { Entity } from "@latticexyz/recs";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { components } from "src/network/components";
import { AnyAccount, SetupNetworkResult } from "src/network/types";
import { TransactionQueueType } from "src/util/constants";
import { decodeEntity, hashEntities } from "src/util/encode";
import { Hex } from "viem";
import { parseReceipt } from "../../../util/analytics/parseReceipt";

export const recallArrival = async (network: SetupNetworkResult, account: AnyAccount, arrivalEntity: Entity) => {
  const rockEntity = components.Arrival.getEntity(arrivalEntity)?.destination;
  if (!rockEntity) throw new Error("Arrival has no destination");
  const { key } = decodeEntity(components.MapItemArrivals.metadata.keySchema, arrivalEntity);

  await execute(
    () => account.worldContract.write.recallArrival([rockEntity as Hex, key as Hex]),
    network,
    {
      id: hashEntities(TransactionQueueType.Recall, key, rockEntity),
    },
    (receipt) => {
      const asteroid = components.Home.get(account.entity)?.asteroid;

      ampli.systemRecallArrival({
        asteroidCoord: asteroid!,
        ...parseReceipt(receipt),
      });
    }
  );
};

export const recallStationedUnits = async (network: SetupNetworkResult, account: AnyAccount, rockEntity: Entity) => {
  await execute(
    () => account.worldContract.write.recallStationedUnits([rockEntity as Hex]),
    network,
    {
      id: hashEntities(TransactionQueueType.Recall, rockEntity),
    },
    (receipt) => {
      const asteroid = components.Home.get(account.entity)?.asteroid;

      ampli.systemRecallArrival({
        asteroidCoord: asteroid!,
        ...parseReceipt(receipt),
      });
    }
  );
};
