import { ContractWrite, createBurnerAccount, createContract, transportObserver } from "@latticexyz/common";
import { createFaucetService } from "@latticexyz/services/faucet";
import { encodeEntity, syncToRecs } from "@latticexyz/store-sync/recs";
import mudConfig from "contracts/mud.config";
import { IWorld__factory } from "contracts/types/ethers-contracts/factories/IWorld__factory";
import { Subject, share } from "rxjs";
import { ClientConfig, Hex, createPublicClient, createWalletClient, fallback, http, parseEther, webSocket } from "viem";
import { NetworkConfig } from "./types";
import { world } from "./world";

export type SetupNetworkResult = Awaited<ReturnType<typeof setupNetwork>>;

export async function setupNetwork(networkConfig: NetworkConfig) {
  const clientOptions = {
    chain: networkConfig.chain,
    transport: transportObserver(fallback([webSocket(), http()])),
    pollingInterval: 1000,
  } as const satisfies ClientConfig;

  const publicClient = createPublicClient(clientOptions);

  const burnerAccount = createBurnerAccount(networkConfig.privateKey as Hex);
  const burnerWalletClient = createWalletClient({
    ...clientOptions,
    account: burnerAccount,
  });

  const write$ = new Subject<ContractWrite>();
  const worldContract = createContract({
    address: networkConfig.worldAddress as Hex,
    abi: IWorld__factory.abi,
    publicClient,
    walletClient: burnerWalletClient,
    onWrite: (write) => write$.next(write),
  });

  const { components, latestBlock$, blockStorageOperations$, waitForTransaction } = await syncToRecs({
    world,
    config: mudConfig,
    address: networkConfig.worldAddress as Hex,
    publicClient,
    startBlock: BigInt(networkConfig.initialBlockNumber),
  });

  // Request drip from faucet
  if (networkConfig.faucetServiceUrl) {
    const address = burnerAccount.address;
    console.info("[Dev Faucet]: Player address -> ", address);

    const faucet = createFaucetService(networkConfig.faucetServiceUrl);

    const requestDrip = async () => {
      const balance = await publicClient.getBalance({ address });
      console.info(`[Dev Faucet]: Player balance -> ${balance}`);
      const lowBalance = balance < parseEther("1");
      if (lowBalance) {
        console.info("[Dev Faucet]: Balance is low, dripping funds to player");
        // Double drip
        await faucet.dripDev({ address });
        await faucet.dripDev({ address });
      }
    };

    requestDrip();
    // Request a drip every 20 seconds
    setInterval(requestDrip, 20000);
  }

  return {
    world,
    components,
    playerEntity: encodeEntity({ address: "address" }, { address: burnerWalletClient.account.address }),
    publicClient,
    walletClient: burnerWalletClient,
    latestBlock$,
    blockStorageOperations$,
    waitForTransaction,
    worldContract,
    write$: write$.asObservable().pipe(share()),
  };
}
