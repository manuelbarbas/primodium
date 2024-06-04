import { ContractWrite, createBurnerAccount as createMudBurnerAccount, transportObserver } from "@latticexyz/common";
import { transactionQueue, writeObserver } from "@latticexyz/common/actions";
import { Subject } from "rxjs";
import { Hex, createPublicClient, createWalletClient, fallback, getContract, http } from "viem";
import { generatePrivateKey } from "viem/accounts";
import { NetworkConfig } from "@/lib/types";
import { STORAGE_PREFIX } from "@/lib/constants";
import { WorldAbi } from "@/worldAbi";
import { normalizeAddress } from "@/utils/global/common";
import { addressToEntity } from "@/utils/global/encode";

export async function createBurnerAccount(networkConfig: NetworkConfig, privateKey?: Hex, saveToStorage = true) {
  const key = privateKey ?? generatePrivateKey();
  const burnerAccount = createMudBurnerAccount(key);
  if (saveToStorage) localStorage.setItem(STORAGE_PREFIX + burnerAccount.address, key);
  const clientOptions = {
    chain: networkConfig.chain,
    transport: transportObserver(fallback([http()])),
    pollingInterval: 1000,
  };

  const publicClient = createPublicClient(clientOptions);

  const sessionWalletClient = createWalletClient({
    ...clientOptions,
    account: burnerAccount,
  });

  const write$ = new Subject<ContractWrite>();
  sessionWalletClient.extend(transactionQueue()).extend(writeObserver({ onWrite: (write) => write$.next(write) }));

  const sessionWorldContract = getContract({
    address: networkConfig.worldAddress as Hex,
    abi: WorldAbi,
    client: {
      public: publicClient,
      wallet: sessionWalletClient,
    },
  });
  return {
    worldContract: sessionWorldContract,
    account: sessionWalletClient.account,
    address: normalizeAddress(sessionWalletClient.account.address),
    publicClient,
    walletClient: sessionWalletClient,
    entity: addressToEntity(sessionWalletClient.account.address),
    privateKey: key,
    write$,
  };
}
