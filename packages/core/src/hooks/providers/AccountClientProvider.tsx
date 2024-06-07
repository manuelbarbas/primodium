import { useCore } from "@/hooks/useCore";
import { createBurnerAccount, transportObserver } from "@latticexyz/common";
import { createClient as createFaucetClient } from "@latticexyz/faucet";
import { useCallback, useMemo, useRef, useState } from "react";
import { createLocalAccount } from "@/account/createLocalAccount";
import { createExternalAccount } from "@/account/createExternalAccount";
import { AccountClient, ExternalAccount, LocalAccount } from "@/lib/types";
import { minEth } from "@/lib/constants";
import { Address, Hex, createWalletClient, fallback, formatEther, http } from "viem";
import { storage } from "@/utils/global/storage";

import { createContext, ReactNode } from "react";

interface AccountProviderProps {
  options: {
    playerAddress?: Address;
    playerPrivateKey?: Hex;
    sessionPrivateKey?: Hex;
  };
  children: ReactNode;
}

export const AccountClientContext = createContext<AccountClient | undefined>(undefined);

export function AccountClientProvider({ options, children }: AccountProviderProps) {
  if (!options.playerAddress && !options.playerPrivateKey) throw new Error("Must provide address or private key");
  const core = useCore();
  const {
    config,
    components,
    network: { publicClient },
    sync: { syncPlayerData },
  } = core;

  const { externalWalletClient, faucet } = useMemo(() => {
    const externalPKey = config.chain.name === "Foundry" ? config.devPrivateKey : undefined;
    const faucet = config.chain.faucetUrl ? createFaucetClient({ url: config.chain.faucetUrl }) : undefined;

    const externalWalletClient = externalPKey
      ? createWalletClient({
          chain: config.chain,
          transport: transportObserver(fallback([http()])),
          pollingInterval: 1000,
          account: createBurnerAccount(externalPKey as Hex),
        })
      : undefined;
    return { faucet, externalWalletClient };
  }, [config]);

  const requestDrip = useCallback(
    async (address: Address) => {
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
    [externalWalletClient, faucet, publicClient]
  );

  /* ----------------------------- Player Account ----------------------------- */

  const [playerAccount, setPlayerAccount] = useState<LocalAccount | ExternalAccount>(
    // this is a hack to make typescript happy with overloaded function params
    _updatePlayerAccount(options as { playerAddress: Address })
  );

  const playerAccountInterval = useRef<NodeJS.Timeout | null>(null);

  function _updatePlayerAccount(options: { playerAddress: Address }): ExternalAccount;
  function _updatePlayerAccount(options: { playerPrivateKey: Hex }): LocalAccount;
  function _updatePlayerAccount(options: { playerAddress?: Address; playerPrivateKey?: Hex }) {
    const useLocal = !!options.playerPrivateKey;
    if (!useLocal && !options.playerAddress) throw new Error("Must provide address or private key");

    if (useLocal && options.playerPrivateKey)
      console.warn("Private key provided for local account creation, ignoring address");

    const account = useLocal
      ? createLocalAccount(config, options.playerPrivateKey, false)
      : createExternalAccount(config, options.playerAddress!);

    if (useLocal) storage.setItem("primodiumPlayerAccount", account.privateKey ?? "");
    setPlayerAccount(account);

    if (playerAccountInterval.current) {
      clearInterval(playerAccountInterval.current);
    }

    requestDrip(account.address);
    syncPlayerData(account.entity, account.address);
    playerAccountInterval.current = setInterval(() => requestDrip(account.address), 4000);
    components.Account.set({ value: account.entity });
    return account;
  }

  function updatePlayerAccount(options: { playerAddress?: Address; playerPrivateKey?: Hex }) {
    if (!options.playerAddress && !options.playerAddress) throw new Error("Must provide address or private key");
    // this is a hack to make typescript happy with overloaded function params
    const account = _updatePlayerAccount(options as { playerAddress: Address });
    setPlayerAccount(account);
    return account;
  }

  const memoizedUpdatePlayerAccount = useCallback(updatePlayerAccount, [requestDrip]);

  /* ----------------------------- Session Account ---------------------------- */

  const sessionAccountInterval = useRef<NodeJS.Timeout | null>(null);
  const _updateSessionAccount = useCallback(
    (privateKey: Hex): LocalAccount | null => {
      const account = createLocalAccount(config, privateKey);

      if (account.address === playerAccount?.address) return null;
      if (sessionAccountInterval.current) {
        clearInterval(sessionAccountInterval.current);
      }

      requestDrip(account.address);
      sessionAccountInterval.current = setInterval(() => requestDrip(account.address), 4000);
      return account;
    },
    [playerAccount?.address, requestDrip, sessionAccountInterval]
  );

  const [sessionAccount, setSessionAccount] = useState<LocalAccount | null>(
    options.sessionPrivateKey ? _updateSessionAccount(options.sessionPrivateKey) : null
  );

  const updateSessionAccount = useCallback(
    async (privateKey: Hex) => {
      const account = _updateSessionAccount(privateKey);
      if (!account) return sessionAccount;
      setSessionAccount(account);
      return account;
    },
    [_updateSessionAccount]
  );

  const removeSessionAccount = useCallback(() => {
    if (sessionAccountInterval.current) {
      clearInterval(sessionAccountInterval.current);
    }
    setSessionAccount(null);
  }, [config]);

  const accountClient: AccountClient = {
    sessionAccount,
    playerAccount,
    requestDrip,
    setPlayerAccount: memoizedUpdatePlayerAccount,
    setSessionAccount: updateSessionAccount,
    removeSessionAccount,
  };

  return <AccountClientContext.Provider value={accountClient}>{children}</AccountClientContext.Provider>;
}
