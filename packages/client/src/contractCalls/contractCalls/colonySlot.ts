import { EResource } from "contracts/config/enums";
import { ampli } from "src/ampli";
import { Core, ExecuteFunctions, ResourceEntityLookup, bigintToNumber } from "@primodiumxyz/core";
import { Entity } from "@primodiumxyz/reactive-tables";
import { parseReceipt } from "@/contractCalls/parseReceipt";

export const createColonySlotsCalls =
  ({ tables }: Core, { execute }: ExecuteFunctions) =>
  async (shipyardEntity: Entity, deltas: Record<Entity, bigint>) => {
    const resources = tables.P_ColonySlotsConfig.get()?.resources;
    if (!resources) return;

    const resourceCounts = resources.map((r) => deltas[ResourceEntityLookup[r as EResource]] || 0n);
    await execute({
      functionName: "Pri_11__payForMaxColonySlots",

      args: [shipyardEntity, resourceCounts],
      withSession: true,
      txQueueOptions: {
        id: "pay",
      },
      onComplete: (receipt) => {
        ampli.systemColonySystemPrimodiumPayForMaxColonySlots({
          shipyard: shipyardEntity,
          resourceCounts: resourceCounts.map((resourceCount) => bigintToNumber(resourceCount)),
          ...parseReceipt(receipt),
        });
      },
    });
  };
