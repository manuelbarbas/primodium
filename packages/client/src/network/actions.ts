import { Hex, TransactionReceipt, ContractFunctionExecutionError, CallExecutionError } from "viem";
import { PublicClient } from "viem/_types/clients/createPublicClient";
import { Entity } from "@latticexyz/recs";
import { SetupNetworkResult } from "./types";
import { toast } from "react-toastify";
import { components } from "./components";
import { MetadataTypes } from "./components/customComponents/TransactionQueueComponent";

export async function _execute(txPromise: Promise<Hex>, network: SetupNetworkResult) {
  let receipt: TransactionReceipt | undefined = undefined;

  try {
    const txHash = await txPromise;
    await network.waitForTransaction(txHash);
    console.log("Transaction Hash: ", txHash);

    // If the transaction runs out of gas, status will be reverted
    // receipt.status is of type TStatus = 'success' | 'reverted' defined in TransactionReceipt
    receipt = await network.publicClient.getTransactionReceipt({ hash: txHash });
    if (receipt && receipt.status === "reverted") {
      // Force a CallExecutionError such that we can get the revert reason
      await callTransaction(txHash, network.publicClient);
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
  queuedTx: () => Promise<Hex>,
  network: SetupNetworkResult,
  queueConfig?: {
    id: Entity;
    type?: T;
    metadata?: MetadataTypes[T];
  },
  onComplete?: (receipt: TransactionReceipt | undefined) => void
) {
  if (queueConfig)
    components.TransactionQueue.enqueue(
      async () => {
        const txPromise = queuedTx();
        const receipt = await _execute(txPromise, network);
        onComplete?.(receipt);
      },
      queueConfig.id,
      queueConfig.type,
      queueConfig.metadata
    );
  else {
    const txPromise = queuedTx();
    const receipt = await _execute(txPromise, network);
    onComplete?.(receipt);
  }
}

// Call from a hash to force a CallExecutionError such that we can get the revert reason
export async function callTransaction(txHash: Hex, publicClient: PublicClient): Promise<void> {
  const tx = await publicClient.getTransaction({ hash: txHash });
  if (!tx) throw new Error("Transaction does not exist");
  await publicClient.call({
    account: tx.from!,
    to: tx.to!,
    data: tx.input,
  });
}
