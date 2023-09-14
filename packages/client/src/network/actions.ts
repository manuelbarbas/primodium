import { WebSocketProvider } from "@ethersproject/providers";
import { getRevertReason } from "@latticexyz/network";
import { ContractReceipt, ContractTransaction } from "ethers";
import { IComputedValue } from "mobx";
import { toast } from "react-toastify";

// function that takes in an executeTyped promise that resolves to a completed transaction
// providers are returned from the useMud hook
// alerts user if transaction fails
export async function execute(
  txPromise: Promise<ContractTransaction>,
  providers: IComputedValue<{
    json: any;
    ws: WebSocketProvider | undefined;
  }>
): Promise<ContractReceipt | undefined> {
  try {
    const tx = await txPromise;
    const txResponse: ContractReceipt = await tx.wait();
    return txResponse;
  } catch (error: any) {
    try {
      const reason = await getRevertReason(
        error.transactionHash,
        providers.get().json
      );

      toast.warn(reason);
      return error.receipt as ContractReceipt;
    } catch (error: any) {
      // This is most likely a gas error. i.e.:
      //     TypeError: Cannot set properties of null (setting 'gasPrice')
      // so we tell the user to try again

      toast.error(error);
      return undefined;
    }
  }
}
