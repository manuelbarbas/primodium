import { TransactionReceipt } from "viem";

import { Core, ExternalAccount, LocalAccount } from "@/lib/types";

import { getTransactionData } from "./getTransactionData";

export async function sendTransaction(
  isBite: boolean,
  core: Core,
  playerAccount: ExternalAccount | LocalAccount,
  params: [`0x${string}`, `0x${string}`],
): Promise<TransactionReceipt> {
  const txData = await getTransactionData(isBite, params);

  const transaction = {
    data: txData,
    to: playerAccount.worldContract.address,
    chainId: core.config.chain.id,
    gasPrice: BigInt(100000),
  };

  const txHash = await playerAccount.walletClient.sendTransaction({
    ...transaction,
  });

  const receipt = await playerAccount.publicClient.waitForTransactionReceipt({
    hash: txHash,
  });

  return receipt;
}
