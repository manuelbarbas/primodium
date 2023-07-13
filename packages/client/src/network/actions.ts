import {
  TransactionResponse,
  WebSocketProvider,
} from "@ethersproject/providers";
import { primodium } from "@game/api";
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
  }>,
  setNotification?: (title: string, message: string) => void
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
      if (setNotification) {
        setNotification("Warning", reason);
        primodium.camera.shake();
      } else {
        alert(reason);
      }
    } catch (error: any) {
      // This is most likely a gas error. i.e.:
      //     TypeError: Cannot set properties of null (setting 'gasPrice')
      // so we tell the user to try again
      if (setNotification) {
        setNotification("Try Again", `${error}`);
        primodium.camera.shake();
      } else {
        alert(error);
      }
    }
  }
}
