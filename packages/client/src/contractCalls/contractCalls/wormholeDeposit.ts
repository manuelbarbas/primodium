import { EObjectives } from "contracts/config/enums";

import { AccountClient, Core, ExecuteFunctions, TxQueueOptions } from "@primodiumxyz/core";
import { Entity } from "@primodiumxyz/reactive-tables";
import { ampli } from "@/ampli";
import { parseReceipt } from "@/contractCalls/parseReceipt";
import { makeObjectiveClaimable } from "@/util/objectives/makeObjectiveClaimable";

export const createWormholeDeposit = (core: Core, { playerAccount }: AccountClient, { execute }: ExecuteFunctions) => {
  const wormholeDeposit = async (wormholeBase: Entity, count: bigint, options?: Partial<TxQueueOptions>) => {
    await execute({
      functionName: "Pri_11__wormholeDeposit",

      args: [wormholeBase, count],
      withSession: true,
      txQueueOptions: {
        id: "DEPOSIT",
        ...options,
      },
      onComplete: (receipt) => {
        makeObjectiveClaimable(core, playerAccount.entity, EObjectives.TeleportResources);

        ampli.systemClaimWormholeSystemPrimodiumWormholeDeposit({
          wormholeBase: wormholeBase,
          wormholeResourceCount: count.toString(),
          ...parseReceipt(receipt),
        });
      },
    });
  };

  return wormholeDeposit;
};
