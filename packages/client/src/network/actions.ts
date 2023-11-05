import { Hex, TransactionReceipt } from "viem";
import { Entity } from "@latticexyz/recs";
import { SetupNetworkResult } from "./types";
import { toast } from "react-toastify";
import { components } from "./components";
import { MetadataTypes } from "./components/customComponents/TransactionQueueComponent";

export async function _execute(txPromise: Promise<Hex>, network: SetupNetworkResult) {
  try {
    const txHash = await txPromise;
    await network.waitForTransaction(txHash);
    console.log("Transaction Hash: ", txHash);
    const receipt = await network.publicClient.getTransactionReceipt({ hash: txHash });

    // If the transaction runs out of gas, status will be reverted
    // receipt.status is of type TStatus = 'success' | 'reverted' defined in TransactionReceipt
    if (receipt.status === "reverted") {
      toast.error("You're moving fast! Please wait a moment and then try again.");
    }
    // Even if the transaction fails, we still want to return the receipt to log gas usage etc.
    return receipt;
  } catch (error: any) {
    console.error(error);
    try {
      // error is of type ContractFunctionExecutionError;
      const reason = error.cause.reason;
      toast.warn(reason);
      return undefined;
    } catch (error: any) {
      console.error(error);
      // As of MUDv1, this would most likely be a gas error. i.e.:
      //     TypeError: Cannot set properties of null (setting 'gasPrice')
      // so we told the user to try again.
      // However, this is not the case for MUDv2, as network.waitForTransaction no longer
      // throws an error if the transaction fails.
      // We should be on the lookout for other errors that could be thrown here.
      toast.error(`${error}`);
      return undefined;
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
