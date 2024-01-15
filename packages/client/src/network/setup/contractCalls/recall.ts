import { Entity } from "@latticexyz/recs";
import { ampli } from "src/ampli";
import { execute } from "src/network/actions";
import { components } from "src/network/components";
import { MUD } from "src/network/types";
import { TransactionQueueType } from "src/util/constants";
import { decodeEntity, getSystemId, hashEntities } from "src/util/encode";
import { Hex } from "viem";
import { parseReceipt } from "../../../util/analytics/parseReceipt";

export const recallArrival = async (mud: MUD, arrivalEntity: Entity) => {
  const rockEntity = components.Arrival.getEntity(arrivalEntity)?.destination;
  if (!rockEntity) throw new Error("Arrival has no destination");
  const { key } = decodeEntity(components.MapItemArrivals.metadata.keySchema, arrivalEntity);

  await execute(
    {
      mud,
      functionName: "recallArrival",
      systemId: getSystemId("RecallSystem"),
      args: [rockEntity as Hex, key as Hex],
      delegate: true,
    },
    {
      id: hashEntities(TransactionQueueType.Recall, key, rockEntity),
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
    {
      mud,
      functionName: "recallStationedUnits",
      systemId: getSystemId("RecallSystem"),
      args: [rockEntity as Hex],
      delegate: true,
    },
    {
      id: hashEntities(TransactionQueueType.Recall, rockEntity),
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
