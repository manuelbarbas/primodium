import { makeObjectiveClaimable } from "@/util/objectives/makeObjectiveClaimable";
import { EObjectives } from "contracts/config/enums";
import { ampli } from "src/ampli";
import { Core, AccountClient, getSystemId, TxQueueOptions } from "@primodiumxyz/core";
import { ExecuteFunctions } from "@/contractCalls/txExecute/createExecute";
import { parseReceipt } from "@/util/analytics/parseReceipt";
import { Entity } from "@primodiumxyz/reactive-tables";

export const createWormholeDeposit = (core: Core, { playerAccount }: AccountClient, { execute }: ExecuteFunctions) => {
  const wormholeDeposit = async (wormholeBase: Entity, count: bigint, options?: Partial<TxQueueOptions>) => {
    await execute(
      {
        functionName: "Pri_11__wormholeDeposit",
        systemId: getSystemId("ClaimWormholeSystem"),
        args: [wormholeBase, count],
        withSession: true,
      },
      {
        id: "DEPOSIT",
        ...options,
      },
      (receipt) => {
        makeObjectiveClaimable(playerAccount.entity, EObjectives.TeleportResources);

        ampli.systemClaimWormholeSystemPrimodiumWormholeDeposit({
          wormholeBase: wormholeBase,
          wormholeResourceCount: count.toString(),
          ...parseReceipt(receipt),
        });
      }
    );
  };

  return wormholeDeposit;
};
