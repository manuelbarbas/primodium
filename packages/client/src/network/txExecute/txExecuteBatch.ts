import { _execute } from "@/network/txExecute/_execute";
import { Abi, ContractFunctionName, Hex, TransactionReceipt } from "viem";
import { components } from "../components";
import { MetadataTypes, TxQueueOptions } from "../components/customComponents/TransactionQueueComponent";
import { encodeSystemCalls, encodeSystemCallsFrom, SystemCallFrom } from "../setup/encodeSystemCall";

import { WorldAbi } from "@/network/world";
import { MUD } from "../types";

export async function executeBatch<
  T extends keyof MetadataTypes,
  abi extends Abi,
  functionName extends ContractFunctionName<abi>
>(
  {
    mud,
    systemCalls,
    withSession,
  }: {
    systemCalls: readonly Omit<SystemCallFrom<abi, functionName>, "abi" | "from">[];
    mud: MUD;
    withSession?: boolean;
  },
  txQueueOptions?: TxQueueOptions<T>,
  onComplete?: (receipt: TransactionReceipt | undefined) => void
) {
  const account = withSession ? mud.sessionAccount ?? mud.playerAccount : mud.playerAccount;
  const authorizing = account !== mud.playerAccount;
  console.log({ authorizing });

  console.log(
    `[Tx] Executing batch:${systemCalls.map(
      (system) => ` ${system.functionName}`
    )} with address ${account.address.slice(0, 6)} ${authorizing ? "(using session account)" : ""}`
  );

  const queuedTx = async () => {
    if (authorizing && mud.sessionAccount) {
      console.log("sending with session account");
      const params = encodeSystemCallsFrom(WorldAbi, mud.sessionAccount.entity as Hex, systemCalls).map(
        ([systemId, callData]) => ({ from: mud.playerAccount.address, systemId, callData })
      );
      const tx = await mud.sessionAccount.worldContract.write.batchCallFrom([params]);
      return tx;
    }
    console.log("sending with main account");
    const params = encodeSystemCalls(WorldAbi, systemCalls).map(([systemId, callData]) => ({ systemId, callData }));
    const tx = await mud.playerAccount.worldContract.write.batchCall([params]);
    return tx;
  };

  if (txQueueOptions)
    components.TransactionQueue.enqueue(async () => {
      const txPromise = queuedTx();
      const receipt = await _execute(mud, txPromise);
      onComplete?.(receipt);
    }, txQueueOptions);
  else {
    const txPromise = queuedTx();
    const receipt = await _execute(mud, txPromise);
    onComplete?.(receipt);
  }
}
