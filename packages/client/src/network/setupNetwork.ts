import { ContractWrite, createBurnerAccount, getContract, transportObserver } from "@latticexyz/common";
import { Entity } from "@latticexyz/recs";
import { createClient as createFaucetClient } from "@latticexyz/faucet";
import { syncToRecs } from "@latticexyz/store-sync/recs";
import mudConfig from "contracts/mud.config";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { Subject, share } from "rxjs";
import { Hex, createPublicClient, createWalletClient, encodeAbiParameters, fallback, http, parseEther } from "viem";
import { createClock } from "./createClock";
import { otherTables } from "./otherTables";
import { NetworkConfig } from "./types";
import { world } from "./world";

export async function setupNetwork(networkConfig: NetworkConfig) {
  const clientOptions = {
    chain: networkConfig.chain,
    transport: transportObserver(fallback([http()])),
    pollingInterval: 1000,
  };

  const publicClient = createPublicClient(clientOptions);

  const burnerAccount = createBurnerAccount(networkConfig.privateKey as Hex);
  const burnerWalletClient = createWalletClient({
    ...clientOptions,
    account: burnerAccount,
  });

  const write$ = new Subject<ContractWrite>();
  const worldContract = getContract({
    address: networkConfig.worldAddress as Hex,
    abi: IWorldAbi,
    publicClient,
    walletClient: burnerWalletClient,
    onWrite: (write) => write$.next(write),
  });

  const { components, latestBlock$, latestBlockNumber$, storedBlockLogs$, waitForTransaction } = await syncToRecs({
    world,
    config: mudConfig,
    address: networkConfig.worldAddress as Hex,
    publicClient,
    startBlock: BigInt(networkConfig.initialBlockNumber),
    indexerUrl: networkConfig.indexerUrl,
    tables: otherTables,
  });

  // Request drip from faucet
  if (networkConfig.faucetServiceUrl) {
    const address = burnerAccount.address;
    console.info("[Dev Faucet]: Player address -> ", address);

    const faucet = createFaucetClient({ url: networkConfig.faucetServiceUrl });

    const requestDrip = async () => {
      const balance = await publicClient.getBalance({ address });
      console.info(`[Dev Faucet]: Player balance -> ${balance}`);
      const lowBalance = balance < parseEther("0.2");
      if (lowBalance) {
        console.info("[Dev Faucet]: Balance is low, dripping funds to player");
        await faucet.drip.mutate({ address: address });
      }
    };

    requestDrip();
    // Request a drip every 20 seconds
    setInterval(requestDrip, 20000);
  }

  const clock = createClock(latestBlock$, {
    period: 1100,
    initialTime: 0,
    syncInterval: 10000,
  });

  return {
    world,
    mudConfig,
    components,
    playerEntity: encodeAbiParameters([{ type: "address" }], [burnerWalletClient.account.address]) as Entity,
    address: burnerWalletClient.account.address,
    publicClient,
    walletClient: burnerWalletClient,
    latestBlock$,
    latestBlockNumber$,
    storedBlockLogs$,
    waitForTransaction,
    worldContract,
    write$: write$.asObservable().pipe(share()),
    clock,
  };
}
