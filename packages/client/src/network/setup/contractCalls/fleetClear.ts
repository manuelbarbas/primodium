import { Entity } from "@latticexyz/recs";
import { components } from "src/network/components";
import { execute } from "src/network/txExecute/txExecute";
import { MUD } from "src/network/types";
import { TransactionQueueType } from "src/util/constants";
import { getSystemId, hashEntities } from "src/util/encode";
import { toTransportableResourceArray, toUnitCountArray } from "src/util/send";
import { Hex } from "viem";

const clearId = "clear" as Entity;

export const clearFleet = async (mud: MUD, fleet: Entity) => {
  await execute(
    {
      mud,
      functionName: "Pri_11__clearFleet",
      systemId: getSystemId("FleetClearSystem"),
      args: [fleet as Hex],
      withSession: true,
    },
    {
      id: clearId,
      type: TransactionQueueType.ClearFleet,
    },
    () => components.SelectedFleet.remove()
  );
};

export const clearFleetUnitsResources = async (mud: MUD, fleet: Entity, content: Map<Entity, bigint>) => {
  const unitCounts = toUnitCountArray(content);
  const resourceCounts = toTransportableResourceArray(content);
  const totalUnits = unitCounts.reduce((acc, cur) => acc + cur, 0n);
  const totalResources = resourceCounts.reduce((acc, cur) => acc + cur, 0n);

  if (totalUnits == 0n && totalResources == 0n) return;

  if (totalUnits == 0n) {
    return await execute(
      {
        mud,
        functionName: "Pri_11__clearResources",
        systemId: getSystemId("FleetClearSystem"),
        args: [fleet as Hex, resourceCounts],
        withSession: true,
      },
      {
        id: clearId,
        type: TransactionQueueType.CreateFleet,
      }
    );
  }
  if (totalResources == 0n) {
    return await execute(
      {
        mud,
        functionName: "Pri_11__clearUnits",
        systemId: getSystemId("FleetClearSystem"),
        args: [fleet as Hex, unitCounts],
        withSession: true,
      },
      {
        id: hashEntities(TransactionQueueType.ClearFleet, fleet),
        type: TransactionQueueType.CreateFleet,
      }
    );
  } else {
    await execute(
      {
        mud,
        functionName: "Pri_11__clearUnitsAndResourcesFromFleet",
        systemId: getSystemId("FleetClearSystem"),
        args: [fleet as Hex, unitCounts, resourceCounts],
        withSession: true,
      },
      {
        id: hashEntities(TransactionQueueType.ClearFleet, fleet),
        type: TransactionQueueType.CreateFleet,
      }
    );
  }
};
