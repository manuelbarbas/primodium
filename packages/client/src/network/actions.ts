// import { getRevertReason } from "@latticexyz/network";
import { TransactionReceipt } from "viem";
import { SetupNetworkResult } from "./types";

// function that takes in an executeTyped promise that resolves to a completed transaction
// providers are returned from the useMud hook
// alerts user if transaction fails

// To use providers with getRevertReason, use the following type:
// providers: {
//   json: any;
//   ws: WebSocketProvider | undefined;
// },

export async function execute(
  txHash: `0x${string}`,
  network: SetupNetworkResult
  // setNotification?: (message: string) => void
): Promise<TransactionReceipt | undefined> {
  try {
    await network.waitForTransaction(txHash);
    const receipt = await network.publicClient.getTransactionReceipt({ hash: txHash });
    return receipt;
  } catch (error: any) {
    // try {
    //   const reason = await getRevertReason(error.transactionHash, providers.json);
    //   if (setNotification) {
    //     setNotification("Warning", reason);
    //   } else {
    //     alert(reason);
    //   }
    //   return error.receipt as ContractReceipt;
    // } catch (error: any) {
    //   // This is most likely a gas error. i.e.:
    //   //     TypeError: Cannot set properties of null (setting 'gasPrice')
    //   // so we tell the user to try again
    //   if (setNotification) {
    //     setNotification("Try Again", `${error}`);
    //   } else {
    //     alert(error);
    //   }
    //   return undefined;
    // }
  }
}
