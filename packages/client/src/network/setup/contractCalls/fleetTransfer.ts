import { Entity } from "@latticexyz/recs";
import { execute } from "src/network/actions";
import { components } from "src/network/components";
import { MUD } from "src/network/types";
import { TransactionQueueType } from "src/util/constants";
import { getSystemId } from "src/util/encode";
import { toTransportableResourceArray, toUnitCountArray } from "src/util/send";
import { Hex } from "viem";

export const transferFleet = async (mud: MUD, from: Entity, to: Entity, deltas: Map<Entity, bigint>) => {
  const fromIsSpaceRock = components.Asteroid.has(from);
  const toIsSpaceRock = components.Asteroid.has(to);

  const unitCounts = toUnitCountArray(deltas);
  const resourceCounts = toTransportableResourceArray(deltas);

  const totalUnits = unitCounts.reduce((acc, cur) => acc + cur, 0n);
  const totalResources = resourceCounts.reduce((acc, cur) => acc + cur, 0n);

  if (totalUnits == 0n && totalResources == 0n) return;

  const metadata = {
    id: "TRANSFER" as Entity,
    type: TransactionQueueType.TransferFleet,
  } as const;

  if (totalResources == 0n) {
    const functionName = fromIsSpaceRock
      ? "transferUnitsFromSpaceRockToFleet"
      : toIsSpaceRock
      ? "transferUnitsFromFleetToSpaceRock"
      : "transferUnitsFromFleetToFleet";
    await execute(
      {
        mud,
        functionName,
        systemId: getSystemId("FleetTransferSystem"),
        args: [from as Hex, to as Hex, unitCounts],
        withSession: true,
      },
      metadata
    );
  } else if (totalUnits == 0n) {
    const functionName = fromIsSpaceRock
      ? "transferResourcesFromSpaceRockToFleet"
      : toIsSpaceRock
      ? "transferResourcesFromFleetToSpaceRock"
      : "transferResourcesFromFleetToFleet";
    await execute(
      {
        mud,
        functionName,
        systemId: getSystemId("FleetTransferSystem"),
        args: [from as Hex, to as Hex, resourceCounts],
        withSession: true,
      },
      metadata
    );
  } else {
    const functionName = fromIsSpaceRock
      ? "transferUnitsAndResourcesFromSpaceRockToFleet"
      : toIsSpaceRock
      ? "transferUnitsAndResourcesFromFleetToSpaceRock"
      : "transferUnitsAndResourcesFromFleetToFleet";
    await execute(
      {
        mud,
        functionName,
        systemId: getSystemId("FleetTransferSystem"),
        args: [from as Hex, to as Hex, unitCounts, resourceCounts],
        withSession: true,
      },
      metadata
    );
  }
};
