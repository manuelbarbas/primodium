import { TransactionReceipt, zeroAddress } from "viem";

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
    // NOTE: assuming that the gasUsed does not exceed the bigInt limit.
    return {
      transactionFrom: receipt.from,
      transactionGasUsed: Number(receipt.gasUsed),
      transactionHash: receipt.transactionHash,
      transactionStatus: receipt.status === "success" ? 1 : 0,
      transactionTo: receipt.to || zeroAddress,
      transactionValid: true,
    };
  }
};
