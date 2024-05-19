import { components } from "@/network/components";
import { Entity } from "@latticexyz/recs";
import { EResource } from "contracts/config/enums";
import { execute } from "src/network/txExecute/txExecute";
import { MUD } from "src/network/types";
import { ResourceEntityLookup, TransactionQueueType } from "src/util/constants";
import { getSystemId } from "src/util/encode";

export const payForColonySlot = async (mud: MUD, shipyardEntity: Entity, deltas: Record<Entity, bigint>) => {
  const resources = components.P_ColonySlotsConfig.get()?.resources;
  if (!resources) return;

  const resourceCounts = resources.map((r) => deltas[ResourceEntityLookup[r as EResource]] || 0n);
  await execute(
    {
      mud,
      functionName: "Pri_11__payForMaxColonySlots",
      systemId: getSystemId("ColonySystem"),
      args: [shipyardEntity, resourceCounts],
      withSession: true,
    },
    {
      id: "pay" as Entity,
      type: TransactionQueueType.PayForColonySlot,
    }
  );
};
