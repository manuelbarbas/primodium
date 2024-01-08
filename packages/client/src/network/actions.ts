import { Entity } from "@latticexyz/recs";
import { toast } from "react-toastify";
import { CallExecutionError, ContractFunctionExecutionError, Hex, TransactionReceipt } from "viem";
import { PublicClient } from "viem/_types/clients/createPublicClient";
import { components } from "./components";
import { MetadataTypes } from "./components/customComponents/TransactionQueueComponent";
import { AnyAccount, MUD } from "./types";

export async function _execute({ network: { waitForTransaction, publicClient } }: MUD, txPromise: Promise<Hex>) {
  let receipt: TransactionReceipt | undefined = undefined;

  try {
    const txHash = await txPromise;
    await waitForTransaction(txHash);
    console.log("[Tx] hash: ", txHash);

    // If the transaction runs out of gas, status will be reverted
    // receipt.status is of type TStatus = 'success' | 'reverted' defined in TransactionReceipt
    receipt = await publicClient.getTransactionReceipt({ hash: txHash });
    if (receipt && receipt.status === "reverted") {
      // Force a CallExecutionError such that we can get the revert reason
      await callTransaction(publicClient, txHash);
      toast.error("[Insufficient Gas Limit] You're moving fast! Please wait a moment and then try again.");
    }
    return receipt;
  } catch (error) {
    console.error(error);
    try {
      if (error instanceof ContractFunctionExecutionError) {
        // Thrown by network.waitForTransaction, no receipt is returned
        const reason = error.cause.shortMessage;
        toast.warn(reason);
        return receipt;
      } else if (error instanceof CallExecutionError) {
        // Thrown by callTransaction, receipt is returned
        const reason = error.cause.shortMessage;
        toast.warn(reason);
        return receipt;
      } else {
        toast.error(`${error}`);
        return receipt;
      }
    } catch (error) {
      console.error(error);
      // As of MUDv1, this would most likely be a gas error. i.e.:
      //     TypeError: Cannot set properties of null (setting 'gasPrice')
      // so we told the user to try again.
      // However, this is not the case for MUDv2, as network.waitForTransaction no longer
      // throws an error if the transaction fails.
      // We should be on the lookout for other errors that could be thrown here.
      toast.error(`${error}`);
      return receipt;
    }
  }
}

// Function that takes in a transaction promise that resolves to a completed transaction
// Alerts the user if the transaction failed
// Providers renamed to client: https://viem.sh/docs/ethers-migration.html
export async function execute<T extends keyof MetadataTypes>(
  mud: MUD,
  queuedTx: (account: AnyAccount) => Promise<Hex>,
  options?: {
    id: Entity;
    type?: T;
    metadata?: MetadataTypes[T];
    delegate?: boolean;
  },
  onComplete?: (receipt: TransactionReceipt | undefined) => void
) {
  const account = options?.delegate ? mud.sessionAccount ?? mud.playerAccount : mud.playerAccount;
  console.log("[Tx] Executing with address: ", account.address.slice(0, 6));
  if (options)
    components.TransactionQueue.enqueue(
      async () => {
        const txPromise = queuedTx(account);
        const receipt = await _execute(mud, txPromise);
        onComplete?.(receipt);
      },
      options.id,
      options.type,
      options.metadata
    );
  else {
    const txPromise = queuedTx(account);
    const receipt = await _execute(mud, txPromise);
    onComplete?.(receipt);
  }
}

// Call from a hash to force a CallExecutionError such that we can get the revert reason
export async function callTransaction(publicClient: PublicClient, txHash: Hex): Promise<void> {
  const tx = await publicClient.getTransaction({ hash: txHash });
  if (!tx) throw new Error("Transaction does not exist");
  await publicClient.call({
    account: tx.from!,
    to: tx.to!,
    data: tx.input,
  });
}
