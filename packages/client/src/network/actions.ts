import {
  TransactionResponse,
  WebSocketProvider,
} from "@ethersproject/providers";
import { getRevertReason } from "@latticexyz/network";
import { ContractTransaction } from "ethers";
import { IComputedValue } from "mobx";

// function that takes in an executeTyped promise that resolves to a completed transaction
// providers are returned from the useMud hook
// alerts user if transaction fails
export async function execute(
  txPromise: Promise<ContractTransaction>,
  providers: IComputedValue<{
    json: any;
    ws: WebSocketProvider | undefined;
  }>
) {
  try {
    const tx = await txPromise;
    await tx.wait();
  } catch (error: TransactionResponse | any) {
    try {
      const reason = await getRevertReason(
        error.transactionHash,
        providers.get().json
      );
      alert(reason);
    } catch (error: any) {
      alert(error);
    }
  }
}
