import { Entity } from "@latticexyz/recs";
import { TxQueueOptions } from "src/network/components/customComponents/TransactionQueueComponent";
import { execute } from "src/network/txExecute";
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
      systemId: getSystemId("WormholeDepositSystem"),
      args: [wormholeBase as Hex, count],
      withSession: true,
    },
    {
      id: "DEPOSIT" as Entity,
      type: TransactionQueueType.WormholeDeposit,
      ...options,
    }
  );
};
