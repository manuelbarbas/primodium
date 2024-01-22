import { minEth } from "@game/constants";
import { createBurnerAccount, transportObserver } from "@latticexyz/common";
import { createClient as createFaucetClient } from "@latticexyz/faucet";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getNetworkConfig } from "src/network/config/getNetworkConfig";
import { setup } from "src/network/setup/setup";
import { setupBurnerAccount } from "src/network/setup/setupBurnerAccount";
import { setupExternalAccount } from "src/network/setup/setupExternalAccount";
import { hydratePlayerData } from "src/network/sync/indexer";
import { BurnerAccount, ExternalAccount, SetupResult } from "src/network/types";
import { Hex, createWalletClient, fallback, formatEther, http } from "viem";

const useSetupResult = () => {
  const [network, setNetwork] = useState<SetupResult>(); // Created once when the site loads
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
          account: createBurnerAccount(externalPKey as Hex),
        })
      : undefined;
    return { faucet, externalWalletClient };
  }, []);

  const requestDrip = useCallback(
    async (address: Hex) => {
      const publicClient = network?.network.publicClient;
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
        const amountToDrip = 69n * 10n ** 18n;
        await externalWalletClient.sendTransaction({ to: address, value: amountToDrip });
        console.info(`[Dev Drip] Dripped ${formatEther(amountToDrip)} to ${address}`);
      }
    },
    [externalWalletClient, faucet, network?.network.publicClient]
  );

  useEffect(() => {
    setup().then((network) => setNetwork(network));
  }, []);

  const updateSessionAccount = useCallback(
    (pKey: Hex) => {
      setupBurnerAccount(pKey).then((account) => {
        setSessionAccount(account);

        if (account.address === playerAccount?.address) return;
        if (sessionAccountInterval.current) {
          clearInterval(sessionAccountInterval.current);
        }

        requestDrip(account.address);
        sessionAccountInterval.current = setInterval(() => requestDrip(account.address), 4000);
      });
    },
    [playerAccount?.address, requestDrip]
  );

  const removeSessionAccount = useCallback(() => {
    if (sessionAccountInterval.current) {
      clearInterval(sessionAccountInterval.current);
    }
    setSessionAccount(undefined);
  }, []);

  function updatePlayerAccount(options: { address: Hex }): void;
  function updatePlayerAccount(options: { burner: true; privateKey?: Hex }): void;
  function updatePlayerAccount(options: { address?: Hex; burner?: boolean; privateKey?: Hex }) {
    const useBurner = options.burner;
    const address = options.address;
    if (!useBurner && !address) throw new Error("Must provide address or burner option");
    (useBurner ? setupBurnerAccount(options.privateKey, false) : setupExternalAccount(address!)).then((account) => {
      if (useBurner) localStorage.setItem("primodiumPlayerAccount", account.privateKey ?? "");
      setPlayerAccount(account);

      if (playerAccountInterval.current) {
        clearInterval(playerAccountInterval.current);
      }
      requestDrip(account.address);
      if (network) hydratePlayerData(account.entity, network);
      playerAccountInterval.current = setInterval(() => requestDrip(account.address), 4000);
    });
  }

  const memoizedUpdatePlayerAccount = useCallback(updatePlayerAccount, [requestDrip]);

  return {
    network: network?.network,
    components: network?.components,
    sessionAccount,
    playerAccount,
    updateSessionAccount,
    removeSessionAccount,
    updatePlayerAccount: memoizedUpdatePlayerAccount,
  };
};

export default useSetupResult;
