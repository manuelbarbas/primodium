import { minEth } from "@game/constants";
import { createBurnerAccount, transportObserver } from "@latticexyz/common";
import { createClient as createFaucetClient } from "@latticexyz/faucet";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getNetworkConfig } from "src/network/config/getNetworkConfig";
import { setup } from "src/network/setup/setup";
import { setupBurnerAccount } from "src/network/setup/setupBurnerAccount";
import { setupExternalAccount } from "src/network/setup/setupExternalAccount";
import { BurnerAccount, ExternalAccount, SetupResult } from "src/network/types";
import { Hex, createWalletClient, fallback, formatEther, http } from "viem";

const useSetupResult = () => {
  const [network, setNetwork] = useState<SetupResult>(); // Created once when the site loads
  const [sessionAccount, setSessionAccount] = useState<BurnerAccount>();
  const [playerAccount, setPlayerAccount] = useState<BurnerAccount | ExternalAccount>();
  const sessionAccountInterval = useRef<NodeJS.Timeout | null>(null);
  const playerAccountInterval = useRef<NodeJS.Timeout | null>(null);

  const { daddyWalletClient, faucet } = useMemo(() => {
    const networkConfig = getNetworkConfig();
    const daddyPKey = networkConfig.chainId === "dev" ? import.meta.env.PRI_DEV_PKEY : undefined;
    const faucet = networkConfig.faucetServiceUrl
      ? createFaucetClient({ url: networkConfig.faucetServiceUrl })
      : undefined;

    const daddyWalletClient = daddyPKey
      ? createWalletClient({
          chain: networkConfig.chain,
          transport: transportObserver(fallback([http()])),
          pollingInterval: 1000,
          account: createBurnerAccount(daddyPKey as Hex),
        })
      : undefined;
    return { faucet, daddyWalletClient };
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
      } else if (daddyWalletClient) {
        const balance = await publicClient.getBalance({ address });
        const lowBalance = balance < minEth;
        if (!lowBalance) return;
        console.log("[Dev Drip] balance:", formatEther(balance));
        const amountToDrip = 69n * 10n ** 18n;
        await daddyWalletClient.sendTransaction({ to: address, value: amountToDrip });
        console.info(`[Dev Drip] Dripped ${formatEther(amountToDrip)} to ${address}`);
      }
    },
    [daddyWalletClient, faucet, network?.network.publicClient]
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

  function updatePlayerAccount(options: { address: Hex }): void;
  function updatePlayerAccount(options: { burner: true }): void;
  function updatePlayerAccount(options: { address?: Hex; burner?: boolean }) {
    const useBurner = options.burner;
    const address = options.address;
    if (!useBurner && !address) throw new Error("Must provide address or burner option");
    (useBurner ? setupBurnerAccount() : setupExternalAccount(address!)).then((account) => {
      setPlayerAccount(account);

      if (account.address === sessionAccount?.address) return;
      if (playerAccountInterval.current) {
        clearInterval(playerAccountInterval.current);
      }
      requestDrip(account.address);
      playerAccountInterval.current = setInterval(() => requestDrip(account.address), 4000);
    });
  }

  const memoizedUpdatePlayerAccount = useCallback(updatePlayerAccount, [requestDrip, sessionAccount?.address]);

  return {
    network: network?.network,
    components: network?.components,
    sessionAccount,
    playerAccount,
    updateSessionAccount,
    updatePlayerAccount: memoizedUpdatePlayerAccount,
  };
};

export default useSetupResult;
