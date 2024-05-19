import { makeObjectiveClaimable } from "@/util/objectives/makeObjectiveClaimable";
import { Entity } from "@latticexyz/recs";
import { EObjectives } from "contracts/config/enums";
import { TxQueueOptions } from "src/network/components/customComponents/TransactionQueueComponent";
import { execute } from "src/network/txExecute/txExecute";
import { MUD } from "src/network/types";
import { TransactionQueueType } from "src/util/constants";
import { getSystemId } from "src/util/encode";
import { Hex } from "viem";
import { ampli } from "src/ampli";
import { parseReceipt } from "../../../util/analytics/parseReceipt";

export const wormholeDeposit = async (
  mud: MUD,
  wormholeBase: Entity,
  count: bigint,
  options?: Partial<TxQueueOptions<TransactionQueueType.Upgrade>>
) => {
  await execute(
    {
      mud,
      functionName: "Pri_11__wormholeDeposit",
      systemId: getSystemId("ClaimWormholeSystem"),
      args: [wormholeBase as Hex, count],
      withSession: true,
    },
    {
      id: "DEPOSIT" as Entity,
      type: TransactionQueueType.WormholeDeposit,
      ...options,
    },
    (receipt) => {
      makeObjectiveClaimable(mud.playerAccount.entity, EObjectives.TeleportResources);

      ampli.systemClaimWormholeSystemPrimodiumWormholeDeposit({
        wormholeBase: wormholeBase as Hex,
        wormholeResourceCount: count.toString(),
        ...parseReceipt(receipt),
      });
    }
  );
};
