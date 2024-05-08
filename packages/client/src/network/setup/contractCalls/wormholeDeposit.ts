import { makeObjectiveClaimable } from "@/util/objectives/makeObjectiveClaimable";
import { Entity } from "@latticexyz/recs";
import { EObjectives } from "contracts/config/enums";
import { TxQueueOptions } from "src/network/components/customComponents/TransactionQueueComponent";
import { execute } from "src/network/txExecute/txExecute";
import { MUD } from "src/network/types";
import { TransactionQueueType } from "src/util/constants";
import { getSystemId } from "src/util/encode";
import { Hex } from "viem";

export const wormholeDeposit = async (
  mud: MUD,
  wormholeBase: Entity,
  count: bigint,
  options?: Partial<TxQueueOptions<TransactionQueueType.Upgrade>>
) => {
  await execute(
    {
      mud,
      functionName: "Primodium__wormholeDeposit",
      systemId: getSystemId("ClaimWormholeSystem"),
      args: [wormholeBase as Hex, count],
      withSession: true,
    },
    {
      id: "DEPOSIT" as Entity,
      type: TransactionQueueType.WormholeDeposit,
      ...options,
    },
    () => {
      console.log("Wormhole deposit complete");
      makeObjectiveClaimable(mud.playerAccount.entity, EObjectives.TeleportResources);
    }
  );
};
