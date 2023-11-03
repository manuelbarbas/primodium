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
    return receipt;
  } catch (error: any) {
    console.error(error);
    try {
      const reason = error.cause.reason;
      toast.warn(reason);
      return undefined;
    } catch (error: any) {
      console.error(error);
      // This is most likely a gas error. i.e.:
      //     TypeError: Cannot set properties of null (setting 'gasPrice')
      // so we tell the user to try again
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
