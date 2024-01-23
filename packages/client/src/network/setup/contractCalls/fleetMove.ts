import { Entity } from "@latticexyz/recs";
import { execute } from "src/network/actions";
import { MUD } from "src/network/types";
import { TransactionQueueType } from "src/util/constants";
import { getSystemId, hashEntities } from "src/util/encode";
import { Hex } from "viem";

export const sendFleet = async (mud: MUD, fleet: Entity, spaceRock: Entity) => {
  await execute(
    {
      mud,
      functionName: "sendFleet",
      systemId: getSystemId("FleetMoveSystem"),
      args: [fleet as Hex, spaceRock as Hex],
      delegate: true,
    },
    {
      id: hashEntities(TransactionQueueType.SendFleet, fleet, spaceRock),
      type: TransactionQueueType.SendFleet,
    }
  );
};

export const recallFleet = async (mud: MUD, fleet: Entity) => {
  await execute(
    {
      mud,
      functionName: "recallFleet",
      systemId: getSystemId("FleetMoveSystem"),
      args: [fleet as Hex],
      delegate: true,
    },
    {
      id: hashEntities(TransactionQueueType.SendFleet, fleet),
      type: TransactionQueueType.SendFleet,
    }
  );
};
