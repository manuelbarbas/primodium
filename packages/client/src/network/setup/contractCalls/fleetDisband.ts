import { Entity } from "@latticexyz/recs";
import { execute } from "src/network/actions";
import { MUD } from "src/network/types";
import { TransactionQueueType } from "src/util/constants";
import { getSystemId, hashEntities } from "src/util/encode";
import { toTransportableResourceArray, toUnitCountArray } from "src/util/send";
import { Hex } from "viem";

const disbandId = "disband" as Entity;

export const disbandFleet = async (mud: MUD, fleet: Entity) => {
  await execute(
    {
      mud,
      functionName: "disbandFleet",
      systemId: getSystemId("FleetDisbandSystem"),
      args: [fleet as Hex],
      delegate: true,
    },
    {
      id: disbandId,
      type: TransactionQueueType.DisbandFleet,
    }
  );
};

export const disbandFleetUnitsResources = async (
  mud: MUD,
  fleet: Entity,
  content: {
    units?: Record<Entity, bigint>;
    resources?: Record<Entity, bigint>;
  }
) => {
  const unitCounts = toUnitCountArray(content.units ?? {});
  const resourceCounts = toTransportableResourceArray(content.resources ?? {});
  const totalUnits = unitCounts.reduce((acc, cur) => acc + cur, 0n);
  const totalResources = resourceCounts.reduce((acc, cur) => acc + cur, 0n);

  if (totalUnits == 0n && totalResources == 0n) return;

  if (totalUnits == 0n) {
    return await execute(
      {
        mud,
        functionName: "disbandResources",
        systemId: getSystemId("FleetDisbandSystem"),
        args: [fleet as Hex, resourceCounts],
        delegate: true,
      },
      {
        id: disbandId,
        type: TransactionQueueType.CreateFleet,
      }
    );
  }
  if (totalResources == 0n) {
    return await execute(
      {
        mud,
        functionName: "disbandUnits",
        systemId: getSystemId("FleetDisbandSystem"),
        args: [fleet as Hex, unitCounts],
        delegate: true,
      },
      {
        id: hashEntities(TransactionQueueType.DisbandFleet, fleet),
        type: TransactionQueueType.CreateFleet,
      }
    );
  } else {
    await execute(
      {
        mud,
        functionName: "disbandUnitsAndResourcesFromFleet",
        systemId: getSystemId("FleetDisbandSystem"),
        args: [fleet as Hex, unitCounts, resourceCounts],
        delegate: true,
      },
      {
        id: hashEntities(TransactionQueueType.DisbandFleet, fleet),
        type: TransactionQueueType.CreateFleet,
      }
    );
  }
};
