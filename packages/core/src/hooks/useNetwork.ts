import { getNetworkConfig } from "@/network/config/networkConfig";
import { SetupResult, UseNetworkResult, BurnerAccount, ExternalAccount } from "@/types";
import { createBurnerAccount as createMudBurnerAccount, transportObserver } from "@latticexyz/common";
import { createClient as createFaucetClient } from "@latticexyz/faucet";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { minEth } from "src/util/constants";
import { Address, Hex, createWalletClient, fallback, formatEther, http } from "viem";

import { hydratePlayerData } from "@/sync/indexer";
import { setup } from "@/network/setup";
import { createBurnerAccount } from "@/account/createBurnerAccount";
import { createExternalAccount } from "@/account/createExternalAccount";

const useNetwork = (): UseNetworkResult => {
  const [setupResult, setSetupResult] = useState<SetupResult>(); // Created once when the site loads
  const [sessionAccount, setSessionAccount] = useState<BurnerAccount>();
  const [playerAccount, setPlayerAccount] = useState<BurnerAccount | ExternalAccount>();
  const sessionAccountInterval = useRef<NodeJS.Timeout | null>(null);
  const playerAccountInterval = useRef<NodeJS.Timeout | null>(null);

  const { externalWalletClient, faucet } = useMemo(() => {
    const networkConfig = getNetworkConfig();
    const externalPKey = networkConfig.chainId === "dev" ? import.meta.env.PRI_DEV_PKEY : undefined;
    const faucet = networkConfig.faucetServiceUrl
      ? createFaucetClient({ url: networkConfig.faucetServiceUrl })
      : undefined;

    const externalWalletClient = externalPKey
      ? createWalletClient({
          chain: networkConfig.chain,
          transport: transportObserver(fallback([http()])),
          pollingInterval: 1000,
          account: createMudBurnerAccount(externalPKey as Hex),
        })
      : undefined;
    return { faucet, externalWalletClient };
  }, []);

  const requestDrip = useCallback(
    async (address: Hex) => {
      const publicClient = setupResult?.network.publicClient;
      if (!publicClient) return;
      if (faucet) {
        let balance = await publicClient.getBalance({ address });
        const lowBalance = balance < minEth;
        if (lowBalance) {
          console.log("[Faucet] balance:", formatEther(balance));
          console.info(`[Faucet] Balance is less than ${formatEther(minEth)}, dripping funds`);
          await faucet.drip.mutate({ address: address });
          balance = await publicClient.getBalance({ address });
          console.info(`[Faucet] New balance: ${formatEther(balance)} ETH`);
        }
      } else if (externalWalletClient) {
        const balance = await publicClient.getBalance({ address });
        const lowBalance = balance < minEth;
        if (!lowBalance) return;
        console.log("[Dev Drip] balance:", formatEther(balance));
        const amountToDrip = 10n * 10n ** 18n;
        await externalWalletClient.sendTransaction({ to: address, value: amountToDrip });
        console.info(`[Dev Drip] Dripped ${formatEther(amountToDrip)} to ${address}`);
      }
    },
    [externalWalletClient, faucet, setupResult?.network.publicClient]
  );

  useEffect(() => {
    if (playerAccount) setup(playerAccount.address).then((res) => setSetupResult(res));
  }, [playerAccount?.address]);

  const updateSessionAccount = useCallback(
    async (pKey: Hex) => {
      if (!setupResult) return;
      const account = await createBurnerAccount(setupResult.network.config, pKey);

      setSessionAccount(account);

      if (account.address === playerAccount?.address) return;
      if (sessionAccountInterval.current) {
        clearInterval(sessionAccountInterval.current);
      }

      requestDrip(account.address);
      sessionAccountInterval.current = setInterval(() => requestDrip(account.address), 4000);
      return account;
    },
    [playerAccount?.address, requestDrip]
  );

  const removeSessionAccount = useCallback(() => {
    if (sessionAccountInterval.current) {
      clearInterval(sessionAccountInterval.current);
    }
    setSessionAccount(undefined);
  }, []);

  function updatePlayerAccount(options: { address: Address }): void;
  function updatePlayerAccount(options: { burner: true; privateKey?: Hex }): void;
  function updatePlayerAccount(options: { address?: Address; burner?: boolean; privateKey?: Hex }) {
    if (!setupResult) return;
    const { config } = setupResult.network;
    const useBurner = options.burner;
    if (!useBurner && !options.address) throw new Error("Must provide address or burner option");
    (useBurner
      ? createBurnerAccount(config, options.privateKey, false)
      : createExternalAccount(config, options.address!)
    ).then((account) => {
      if (useBurner) localStorage.setItem("primodiumPlayerAccount", account.privateKey ?? "");
      setPlayerAccount(account);

      if (playerAccountInterval.current) {
        clearInterval(playerAccountInterval.current);
      }
      requestDrip(account.address);
      hydratePlayerData(account.entity, account.address, setupResult);
      playerAccountInterval.current = setInterval(() => requestDrip(account.address), 4000);
    });
  }

  const memoizedUpdatePlayerAccount = useCallback(updatePlayerAccount, [requestDrip]);

  return {
    network: setupResult?.network,
    components: setupResult?.components,
    sessionAccount,
    playerAccount,
    requestDrip,
    updateSessionAccount,
    removeSessionAccount,
    updatePlayerAccount: memoizedUpdatePlayerAccount,
  };
};

export default useNetwork;
