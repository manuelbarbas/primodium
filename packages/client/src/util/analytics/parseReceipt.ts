import { Hex, TransactionReceipt, zeroAddress } from "viem";
import { bigintToNumber } from "../bigint";
import { PublicClient } from "viem/_types/clients/createPublicClient";

// See Amplitude dashboard for more details on the event properties:
type ParsedReceipt =
  | {
      transactionValid: boolean;
    }
  | {
      transactionFrom: string;
      transactionGasUsed: number;
      transactionHash: string;
      transactionStatus: number;
      transactionTo: string;
      transactionValid: boolean;
    };

export const parseReceipt = (receipt: TransactionReceipt | undefined): ParsedReceipt => {
  if (receipt === undefined) {
    return {
      transactionValid: false,
    };
  } else {
    return {
      transactionFrom: receipt.from,
      transactionGasUsed: bigintToNumber(receipt.gasUsed),
      transactionHash: receipt.transactionHash,
      transactionStatus: receipt.status === "success" ? 1 : 0,
      transactionTo: receipt.to || zeroAddress,
      transactionValid: true,
    };
  }
};

// Call from a hash to force a CallExecutionError such that we can get the revert reason
export async function callTransaction(txHash: Hex, publicClient: PublicClient): Promise<void> {
  const tx = await publicClient.getTransaction({ hash: txHash });
  if (!tx) throw new Error("This transaction doesn't exist. Can't get the revert reason");
  await publicClient.call({
    account: tx.from!,
    to: tx.to!,
    data: tx.input,
  });
}
