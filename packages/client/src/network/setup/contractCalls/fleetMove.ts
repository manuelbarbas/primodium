import { Entity } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { execute } from "src/network/txExecute";
import { MUD } from "src/network/types";
import { TransactionQueueType } from "src/util/constants";
import { getSystemId, hashEntities } from "src/util/encode";
import { Hex } from "viem";

export const sendFleet = async (mud: MUD, fleet: Entity, spaceRock: Entity) => {
  await execute(
    {
      mud,
      functionName: "Primodium__sendFleet",
      systemId: getSystemId("FleetMoveSystem"),
      args: [fleet as Hex, spaceRock as Hex],
      withSession: true,
    },
    {
      id: hashEntities(TransactionQueueType.SendFleet),
      type: TransactionQueueType.SendFleet,
    }
  );
};

export const sendFleetPosition = async (mud: MUD, fleet: Entity, position: Coord) => {
  await execute(
    {
      mud,
      functionName: "Primodium__sendFleet",
      systemId: getSystemId("FleetMoveSystem"),
      args: [fleet as Hex, { ...position, parentEntity: fleet as Hex }],
      withSession: true,
    },
    {
      id: hashEntities(TransactionQueueType.SendFleet),
      type: TransactionQueueType.SendFleet,
    }
  );
};

export const recallFleet = async (mud: MUD, fleet: Entity) => {
  await execute(
    {
      mud,
      functionName: "Primodium__recallFleet",
      systemId: getSystemId("FleetMoveSystem"),
      args: [fleet as Hex],
      withSession: true,
    },
    {
      id: hashEntities(TransactionQueueType.SendFleet),
      type: TransactionQueueType.SendFleet,
    }
  );
};
