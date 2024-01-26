import { Entity } from "@latticexyz/recs";
import { EFleetStance } from "contracts/config/enums";
import { execute } from "src/network/actions";
import { MUD } from "src/network/types";
import { TransactionQueueType } from "src/util/constants";
import { getSystemId } from "src/util/encode";
import { Hex } from "viem";

export const setFleetStance = async (mud: MUD, fleet: Entity, stance: EFleetStance, target: Entity) => {
  await execute(
    {
      mud,
      functionName: "setFleetStance",
      systemId: getSystemId("FleetStanceSystem"),
      args: [fleet as Hex, stance, target as Hex],
      delegate: true,
    },
    {
      id: "FleetStance" as Entity,
      type: TransactionQueueType.FleetStance,
    }
  );
};

export const clearFleetStance = async (mud: MUD, fleet: Entity) => {
  await execute(
    {
      mud,
      functionName: "clearFleetStance",
      systemId: getSystemId("FleetStanceSystem"),
      args: [fleet as Hex],
      delegate: true,
    },
    {
      id: "FleetStance" as Entity,
      type: TransactionQueueType.FleetStance,
    }
  );
};
