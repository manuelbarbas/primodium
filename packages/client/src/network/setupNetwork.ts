import { minEth } from "@game/constants";
import { ContractWrite, createBurnerAccount, getContract, transportObserver } from "@latticexyz/common";
import { createClient as createFaucetClient } from "@latticexyz/faucet";
import { Entity } from "@latticexyz/recs";
import { syncToRecs } from "@latticexyz/store-sync/recs";
import mudConfig from "contracts/mud.config";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { Subject, share } from "rxjs";
import { Hex, createPublicClient, createWalletClient, encodeAbiParameters, fallback, formatEther, http } from "viem";
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
    const faucet = createFaucetClient({ url: networkConfig.faucetServiceUrl });
    const address = burnerAccount.address;

    let balance = await publicClient.getBalance({ address });
    console.log("[Faucet] balance:", formatEther(balance));
    const requestDrip = async () => {
      balance = await publicClient.getBalance({ address });
      const lowBalance = balance < minEth;
      if (lowBalance) {
        console.info(`[Faucet] Balance is less than ${formatEther(minEth)}, dripping funds`);
        await faucet.drip.mutate({ address: address });
        balance = await publicClient.getBalance({ address });
        console.info(`[Faucet] New balance: ${formatEther(balance)} ETH`);
      }
    };

    requestDrip();
    // Request a drip every 4 seconds
    setInterval(requestDrip, 4000);
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
