import {
  CallExecutionError,
  ContractFunctionExecutionError,
  createPublicClient,
  createWalletClient,
  custom,
  http,
  TransactionReceipt,
} from "viem";

import { Core, ExternalAccount, LocalAccount } from "@/lib/types";

import { getTransactionData } from "./getTransactionData";

interface RetryConfig {
  maxRetries: number;
  delayMs: number;
  fallbackRpcUrls?: string[];
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  delayMs: 2000,
  fallbackRpcUrls: [],
};

export async function sendTransaction(
  isBite: boolean,
  isDelegated: boolean,
  core: Core,
  playerAccount: ExternalAccount | LocalAccount,
  params: `0x${string}`[],
  retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG,
): Promise<TransactionReceipt> {
  const txData = await getTransactionData(isBite, isDelegated, params);

  retryConfig.fallbackRpcUrls = [...core.config.chain.rpcUrls.fallback.http];

  const transaction = {
    data: txData,
    to: playerAccount.worldContract.address,
    chainId: core.config.chain.id,
    gasPrice: BigInt(100000),
  };

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      const txHash = await playerAccount.walletClient.sendTransaction({
        ...transaction,
      });

      const receipt = await playerAccount.publicClient.waitForTransactionReceipt({
        hash: txHash,
      });

      if (receipt.status === "reverted") {
        throw new Error(`Transaction reverted: ${txHash}`);
      }

      return receipt;
    } catch (error) {
      console.log("This is the error");
      console.log(error);

      const errorMessage = (error as Error).message;

      console.log("errorMessage ");
      console.log(errorMessage);

      // Check for user cancellation - no retry
      if (
        (error as any).code === 4001 ||
        errorMessage.toLowerCase().includes("user rejected") ||
        errorMessage.toLowerCase().includes("user denied")
      ) {
        console.warn("User cancelled the transaction. Aborting retries.");
        console.error(error);
        throw new Error("Transaction cancelled by user");
      }

      if (errorMessage.includes("Execution reverted with reason")) {
        console.warn("Transaction execution failed with specific reason.");
        console.error(error);
        throw new Error("Transaction not allowed");
      }

      lastError = error as Error;
      console.warn(`Transaction attempt ${attempt + 1} failed:`, error);

      if (attempt < retryConfig.maxRetries) {
        console.log(`Retrying in ${retryConfig.delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, retryConfig.delayMs));
      }
    }
  }

  if (retryConfig.fallbackRpcUrls && retryConfig.fallbackRpcUrls.length > 0) {
    console.log("Original RPC failed, trying fallback endpoints...");

    for (const rpcUrl of retryConfig.fallbackRpcUrls) {
      console.log(`Trying fallback RPC: ${rpcUrl}`);

      // Create new clients with fallback RPC
      const fallbackPublicClient = createPublicClient({
        chain: core.config.chain,
        transport: http(rpcUrl),
        pollingInterval: 250,
      });

      let fallbackWalletClient;

      if ("privateKey" in playerAccount && playerAccount.privateKey) {
        // For LocalAccount - create wallet client with private key
        const { privateKeyToAccount } = await import("viem/accounts");
        const account = privateKeyToAccount(playerAccount.privateKey);

        fallbackWalletClient = createWalletClient({
          chain: core.config.chain,
          transport: http(rpcUrl),
          account,
        });
      } else {
        // For ExternalAccount - use browser wallet but with fallback RPC for public client
        fallbackWalletClient = createWalletClient({
          chain: core.config.chain,
          transport: custom((window as any).ethereum),
          account: playerAccount.account,
        });
      }

      // Retry with fallback clients
      for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
        try {
          const txHash = await fallbackWalletClient.sendTransaction({
            ...transaction,
          });

          const receipt = await fallbackPublicClient.waitForTransactionReceipt({
            hash: txHash,
          });

          if (receipt.status === "reverted") {
            throw new Error(`Transaction reverted: ${txHash}`);
          }

          console.log(`Transaction succeeded with fallback RPC: ${rpcUrl}`);
          return receipt;
        } catch (error) {
          lastError = error as Error;
          console.warn(`Fallback attempt ${attempt + 1} with ${rpcUrl} failed:`, error);

          if (attempt < retryConfig.maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, retryConfig.delayMs));
          }
        }
      }
    }
  }

  throw new Error(`Transaction failed after all retries. Last error: ${lastError?.message}`);
}
