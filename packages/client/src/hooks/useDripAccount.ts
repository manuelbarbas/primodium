import { useAccountClient, useCore } from "@primodiumxyz/core/react";
import { useCallback, useEffect, useMemo } from "react";
import { createClient as createFaucetClient } from "@latticexyz/faucet";
import { Hex, createWalletClient, fallback, formatEther, http } from "viem";
import { createBurnerAccount as createMudBurnerAccount, transportObserver } from "@latticexyz/common";
import { minEth } from "@primodiumxyz/core";
import { useBalance } from "wagmi";

export const DEV_CHAIN = import.meta.env.PRI_CHAIN_ID === "dev";

export type DripAccountHook = {
  playerAccountBalance: bigint;
  sessionAccountBalance: bigint;
  requestDrip: (address: Hex) => void;
};
export const useDripAccount = (): DripAccountHook => {
  const { network, config } = useCore();
  const { sessionAccount, playerAccount } = useAccountClient();

  const { externalWalletClient, faucet } = useMemo(() => {
    const externalPKey = config.chain.name === "Foundry" ? import.meta.env.PRI_DEV_PKEY : undefined;
    const faucetUrl = config.chain.faucetUrl;
    const faucet = faucetUrl ? createFaucetClient({ url: faucetUrl }) : undefined;

    const externalWalletClient = externalPKey
      ? createWalletClient({
          chain: config.chain,
          transport: transportObserver(fallback([http()])),
          pollingInterval: 1000,
          account: createMudBurnerAccount(externalPKey as Hex),
        })
      : undefined;
    return { faucet, externalWalletClient };
  }, []);

  const requestDrip = useCallback(
    async (address: Hex) => {
      const publicClient = network?.publicClient;
      if (!publicClient) return;
      if (faucet) {
        console.info(`[Faucet] Balance is less than ${formatEther(minEth)}, dripping funds`);
        await faucet.drip.mutate({ address: address });
        const balance = await publicClient.getBalance({ address });
        console.info(`[Faucet] New balance: ${formatEther(balance)} ETH`);
      } else if (externalWalletClient) {
        const amountToDrip = 10n * 10n ** 18n;
        await externalWalletClient.sendTransaction({ chain: config.chain, to: address, value: amountToDrip });
        console.info(`[Dev Drip] Dripped ${formatEther(amountToDrip)} to ${address}`);
      }
    },
    [externalWalletClient, faucet, network?.publicClient]
  );

  const playerAccountBalance =
    useBalance({ address: playerAccount.address, chainId: config.chain.id }).data?.value ?? 0n;
  const sessionAccountBalance =
    useBalance({ address: sessionAccount?.address, chainId: config.chain.id }).data?.value ?? 0n;

  useEffect(() => {
    console.log("session account balance:", sessionAccountBalance);
    if (!sessionAccount?.address || sessionAccountBalance >= minEth) return;
    requestDrip(sessionAccount.address);
  }, [sessionAccount?.address, sessionAccountBalance]);

  useEffect(() => {
    console.log("player account balance:", playerAccountBalance);
    if (sessionAccountBalance >= minEth) return;
    requestDrip(playerAccount.address);
  }, [playerAccount.address, playerAccountBalance]);

  return { playerAccountBalance, sessionAccountBalance, requestDrip };
};
