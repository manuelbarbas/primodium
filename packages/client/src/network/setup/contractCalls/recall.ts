import { Entity } from "@latticexyz/recs";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { components } from "src/network/components";
import { MUD } from "src/network/types";
import { TransactionQueueType } from "src/util/constants";
import { decodeEntity, hashEntities } from "src/util/encode";
import { Hex } from "viem";
import { parseReceipt } from "../../../util/analytics/parseReceipt";

export const recallArrival = async (mud: MUD, arrivalEntity: Entity) => {
  const rockEntity = components.Arrival.getEntity(arrivalEntity)?.destination;
  if (!rockEntity) throw new Error("Arrival has no destination");
  const { key } = decodeEntity(components.MapItemArrivals.metadata.keySchema, arrivalEntity);

  await execute(
    mud,
    (account) => account.worldContract.write.recallArrival([rockEntity as Hex, key as Hex]),
    {
      id: hashEntities(TransactionQueueType.Recall, key, rockEntity),
      delegate: true,
    },
    (receipt) => {
      const asteroid = components.Home.get(mud.playerAccount.entity)?.asteroid;

      ampli.systemRecallArrival({
        asteroidCoord: asteroid!,
        ...parseReceipt(receipt),
      });
    }
  );
};

export const recallStationedUnits = async (mud: MUD, rockEntity: Entity) => {
  await execute(
    mud,
    (account) => account.worldContract.write.recallStationedUnits([rockEntity as Hex]),
    {
      id: hashEntities(TransactionQueueType.Recall, rockEntity),
      delegate: true,
    },
    (receipt) => {
      const asteroid = components.Home.get(mud.playerAccount.entity)?.asteroid;

      ampli.systemRecallArrival({
        asteroidCoord: asteroid!,
        ...parseReceipt(receipt),
      });
    }
  );
};
