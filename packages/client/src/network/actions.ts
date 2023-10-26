import { Hex, TransactionReceipt } from "viem";
import { SetupNetworkResult } from "./types";

// Function that takes in a transaction promise that resolves to a completed transaction
// Alerts the user if the transaction failed
// Providers renamed to client: https://viem.sh/docs/ethers-migration.html
export async function execute(
  txPromise: Promise<Hex>,
  network: SetupNetworkResult,
  setNotification?: (message: string) => void
): Promise<TransactionReceipt | undefined> {
  if (setNotification) {
    setNotification("Transaction Executed");
  } else {
    alert("Transaction Executed");
  }

  try {
    const txHash = await txPromise;
    await network.waitForTransaction(txHash);
    const receipt = await network.publicClient.getTransactionReceipt({ hash: txHash });
    return receipt;
  } catch (error: any) {
    try {
      const reason = error.cause.reason;
      if (setNotification) {
        setNotification(reason);
      } else {
        alert(reason);
      }
      return undefined;
    } catch (error: any) {
      // This is most likely a gas error. i.e.:
      //     TypeError: Cannot set properties of null (setting 'gasPrice')
      // so we tell the user to try again
      if (setNotification) {
        setNotification(`${error}`);
      } else {
        alert(error);
      }
      return undefined;
    }
  }
}
