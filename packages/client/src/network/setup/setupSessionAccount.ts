import {
  ContractWrite,
  createBurnerAccount,
  getBurnerPrivateKey,
  getContract,
  transportObserver,
} from "@latticexyz/common";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { Subject } from "rxjs";
import { addressToEntity } from "src/util/encode";
import { Hex, createPublicClient, createWalletClient, fallback, http } from "viem";
import { getNetworkConfig } from "../config/getNetworkConfig";

export async function setupSessionAccount(pKey?: Hex) {
  const networkConfig = getNetworkConfig();
  const cacheKey = "primodium:sessionKey";
  const privateKey = pKey ?? getBurnerPrivateKey(cacheKey);
  localStorage.setItem(cacheKey, privateKey);
  const clientOptions = {
    chain: networkConfig.chain,
    transport: transportObserver(fallback([http()])),
    pollingInterval: 1000,
  };

  const publicClient = createPublicClient(clientOptions);

  const burnerAccount = createBurnerAccount(privateKey);
  const sessionWalletClient = createWalletClient({
    ...clientOptions,
    account: burnerAccount,
  });

  const write$ = new Subject<ContractWrite>();
  const sessionWorldContract = getContract({
    address: networkConfig.worldAddress as Hex,
    abi: IWorldAbi,
    publicClient,
    walletClient: sessionWalletClient,
    onWrite: (write) => write$.next(write),
  });
  return {
    worldContract: sessionWorldContract,
    account: sessionWalletClient.account,
    address: sessionWalletClient.account.address,
    publicClient,
    walletClient: sessionWalletClient,
    entity: addressToEntity(sessionWalletClient.account.address),
    write$,
  };
}
