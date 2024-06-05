import { ContractWrite, createBurnerAccount as createMudBurnerAccount, transportObserver } from "@latticexyz/common";
import { transactionQueue, writeObserver } from "@latticexyz/common/actions";
import { Subject } from "rxjs";
import { Hex, createPublicClient, createWalletClient, fallback, getContract, http } from "viem";
import { generatePrivateKey } from "viem/accounts";
import { CoreConfig } from "@/lib/types";
import { STORAGE_PREFIX } from "@/lib/constants";
import { WorldAbi } from "@/lib/WorldAbi";
import { normalizeAddress } from "@/utils/global/common";
import { addressToEntity } from "@/utils/global/encode";
import { storage } from "@/utils/global/storage";

export async function createBurnerAccount(coreConfig: CoreConfig, privateKey?: Hex, saveToStorage = true) {
  const key = privateKey ?? generatePrivateKey();
  const burnerAccount = createMudBurnerAccount(key);
  if (saveToStorage) storage.setItem(STORAGE_PREFIX + burnerAccount.address, key);
  const clientOptions = {
    chain: coreConfig.chain,
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
    address: coreConfig.worldAddress as Hex,
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
