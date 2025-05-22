import { createBurnerAccount, transportObserver } from "@latticexyz/common";
import { createClient as createFaucetClient } from "@latticexyz/faucet";
import React, { createContext, ReactNode, useCallback, useMemo, useRef, useState } from "react";
import { Address, createWalletClient, fallback, formatEther, Hex, http } from "viem";

import { createExternalAccount } from "@/account/createExternalAccount";
import { createLocalAccount } from "@/account/createLocalAccount";
import { minEth } from "@/lib/constants";
import { AccountClient, ExternalAccount, LocalAccount } from "@/lib/types";
import { useCore } from "@/react/hooks/useCore";
import { storage } from "@/utils/global/storage";

import { sfuelDistribution } from "../gasless";

type AccountClientOptions = {
  playerAddress?: Address;
  playerPrivateKey?: Hex;
  sessionPrivateKey?: Hex;
};

type AccountProviderProps = AccountClientOptions & { children: ReactNode };

export const AccountClientContext = createContext<AccountClient | undefined>(undefined);

/**
 * Provides the account client context to its children components.
 *
 * @param children - The child components to be wrapped by the account client context.
 * @param options - The options for the account provider.
 * @returns The account client provider.
 * @throws Will throw an error if neither playerAddress nor playerPrivateKey is provided.
 */
export function AccountClientProvider({ children, ...options }: AccountProviderProps) {
  if (!options.playerAddress && !options.playerPrivateKey) throw new Error("Must provide address or private key");
  const core = useCore();
  const {
    config,
    tables,
    network: { publicClient },
    sync: { syncPlayerData },
  } = core;

  let distributionFlag = false;
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
          console.log("TEST 1");
          console.log("[Faucet] balance:", formatEther(balance));
          console.info(`[Faucet] Balance is less than ${formatEther(minEth)}, dripping funds`);
          await faucet.drip.mutate({ address: address });
          balance = await publicClient.getBalance({ address });
          console.info(`[Faucet] New balance: ${formatEther(balance)} ETH`);
        }
      } else if (externalWalletClient) {
        console.log("TEST 2");
        const balance = await publicClient.getBalance({ address });
        const lowBalance = balance < minEth;
        if (!lowBalance) return;
        console.log("[Dev Drip] balance:", formatEther(balance));
        const amountToDrip = 10n * 10n ** 18n;
        await externalWalletClient.sendTransaction({ to: address, value: amountToDrip });
        console.info(`[Dev Drip] Dripped ${formatEther(amountToDrip)} to ${address}`);
      } else {
        //SKALE Gasless sFUEL Distribution
        const balance = await publicClient.getBalance({ address });
        const lowBalance = balance < minEth;
        if (lowBalance && !distributionFlag) {
          console.log("NOT ENOUGH GAS. NOW GETTING SOME ", balance);
          await sfuelDistribution(address);
          distributionFlag = true;
        } else {
          console.log("HAS ENOUGH");
        }
      }
    },
    [externalWalletClient, faucet, publicClient],
  );

  /* ----------------------------- Player Account ----------------------------- */

  const playerAccountInterval = useRef<NodeJS.Timeout | null>(null);

  const [playerAccount, setPlayerAccount] = useState<LocalAccount | ExternalAccount>(
    // this is a hack to make typescript happy with overloaded function params
    _updatePlayerAccount(options as { playerAddress: Address }),
  );

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

    if (playerAccountInterval.current) {
      clearInterval(playerAccountInterval.current);
    }
    console.log("DRIP _updatePlayerAccount");

    requestDrip(account.address);
    syncPlayerData(account.address, account.entity);
    // playerAccountInterval.current = setInterval(() => requestDrip(account.address), 4000);
    tables.Account.set({ value: account.entity });
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
      console.log("DRIP _updateSessionAccount");
      requestDrip(account.address);
      //   sessionAccountInterval.current = setInterval(() => requestDrip(account.address), 4000);
      return account;
    },
    [playerAccount?.address, requestDrip, sessionAccountInterval],
  );

  const [sessionAccount, setSessionAccount] = useState<LocalAccount | null>(
    options.sessionPrivateKey ? _updateSessionAccount(options.sessionPrivateKey) : null,
  );

  const updateSessionAccount = useCallback(
    async (privateKey: Hex) => {
      const account = _updateSessionAccount(privateKey);
      if (!account) return sessionAccount;
      setSessionAccount(account);
      return account;
    },
    [_updateSessionAccount],
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
