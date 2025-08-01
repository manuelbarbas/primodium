import { CallExecutionError, ContractFunctionExecutionError, Hex, PublicClient, TransactionReceipt } from "viem";

import { Core } from "@/lib/types";

export async function _execute(core: Core, txPromise: Promise<Hex>) {
  const { network } = core;

  const { waitForTransaction, publicClient } = network;

  let receipt: TransactionReceipt | undefined = undefined;
  const startTime = Date.now();

  try {
    const txHash = await txPromise;
    console.log(`[Tx DEBUG] Transaction sent: ${txHash} at ${new Date().toISOString()}`);

    await waitForTransaction(txHash);
    const waitTime = Date.now() - startTime;
    console.log(`[Tx DEBUG] waitForTransaction completed in ${waitTime}ms for ${txHash}`);

    console.log("[Tx] hash: ", txHash);

    // If the transaction runs out of gas, status will be reverted
    // receipt.status is of type TStatus = 'success' | 'reverted' defined in TransactionReceipt
    receipt = await publicClient.getTransactionReceipt({ hash: txHash });

    if (receipt.status === "success" && core.sync?.optimisticUpdateManager) {
      try {
        core.sync.optimisticUpdateManager.applyOptimisticUpdate(receipt);
      } catch (error) {
        console.error(`[Execute] Failed to apply optimistic update:`, error);
      }
    } else {
      console.log(`[Execute DEBUG] Skipping optimistic update - conditions not met`);
    }

    const receiptTime = Date.now() - startTime;

    if (receipt) {
      console.log(
        `[Tx DEBUG] Receipt received in ${receiptTime}ms - Status: ${receipt.status}, Block: ${receipt.blockNumber}, Hash: ${txHash}`,
      );
    }

    if (receipt && receipt.status === "reverted") {
      // Force a CallExecutionError such that we can get the revert reason
      await callTransaction(publicClient, txHash);
      console.error("[Insufficient Gas Limit] You're moving fast! Please wait a moment and then try again.");
    }
    return receipt;
  } catch (error) {
    console.error(error);
    try {
      if (error instanceof ContractFunctionExecutionError) {
        // Thrown by network.waitForTransaction, no receipt is returned
        const reason = error.cause.shortMessage;
        console.warn(reason);
        return receipt;
      } else if (error instanceof CallExecutionError) {
        // Thrown by callTransaction, receipt is returned
        const reason = error.cause.shortMessage;
        console.warn(reason);
        return receipt;
      } else {
        console.error(`${error}`);
        return receipt;
      }
    } catch (error) {
      console.log("ERRORRRRR 2");

      console.error(error);
      // As of MUDv1, this would most likely be a gas error. i.e.:
      //     TypeError: Cannot set properties of null (setting 'gasPrice')
      // so we told the user to try again.
      // However, this is not the case for MUDv2, as network.waitForTransaction no longer
      // throws an error if the transaction fails.
      // We should be on the lookout for other errors that could be thrown here.
      console.error(`${error}`);

      return receipt;
    }
  }
}

// Call from a hash to force a CallExecutionError such that we can get the revert reason
async function callTransaction(publicClient: PublicClient, txHash: Hex): Promise<void> {
  const tx = await publicClient.getTransaction({ hash: txHash });
  if (!tx) throw new Error("Transaction does not exist");
  await publicClient.call({
    account: tx.from!,
    to: tx.to!,
    data: tx.input,
  });
}
