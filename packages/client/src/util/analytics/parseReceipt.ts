import { ContractReceipt } from "ethers";

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

export const parseReceipt = (
  receipt: ContractReceipt | undefined
): ParsedReceipt => {
  if (receipt === undefined) {
    return {
      transactionValid: false,
    };
  } else {
    return {
      transactionFrom: receipt.from,
      transactionGasUsed: receipt.gasUsed.toNumber(),
      transactionHash: receipt.transactionHash,
      transactionStatus: receipt.status,
      transactionTo: receipt.to,
      transactionValid: true,
    };
  }
};
