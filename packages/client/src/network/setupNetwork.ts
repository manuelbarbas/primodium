import { minEth } from "@game/constants";
import { ContractWrite, createBurnerAccount, getContract, transportObserver } from "@latticexyz/common";
import { createClient as createFaucetClient } from "@latticexyz/faucet";
import { syncToRecs } from "@latticexyz/store-sync/recs";
import mudConfig from "contracts/mud.config";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { Subject, share } from "rxjs";
import { addressToEntity } from "src/util/encode";
import { Hex, createPublicClient, createWalletClient, custom, fallback, formatEther, http } from "viem";
import { toAccount } from "viem/accounts";
import { getNetworkConfig } from "./config/getNetworkConfig";
import { createClock } from "./createClock";
import { otherTables } from "./otherTables";
import { world } from "./world";

export async function setupNetwork(externalAddress?: Hex) {
  const networkConfig = getNetworkConfig();
  const clientOptions = {
    chain: networkConfig.chain,
    transport: transportObserver(fallback([http()])),
    pollingInterval: 1000,
  };

  const publicClient = createPublicClient(clientOptions);

  const burnerAccount = createBurnerAccount(networkConfig.privateKey as Hex);
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

  const { components, latestBlock$, latestBlockNumber$, storedBlockLogs$, waitForTransaction } = await syncToRecs({
    world,
    config: mudConfig,
    address: networkConfig.worldAddress as Hex,
    publicClient,
    startBlock: BigInt(networkConfig.initialBlockNumber),
    indexerUrl: networkConfig.indexerUrl,
    tables: otherTables,
  });

  const clock = createClock(latestBlock$, {
    period: 1100,
    initialTime: 0,
    syncInterval: 10000,
  });

  const sessionAccount = {
    worldContract: sessionWorldContract,
    account: sessionWalletClient.account,
    address: sessionWalletClient.account.address,
    publicClient,
    walletClient: sessionWalletClient,
    entity: addressToEntity(sessionWalletClient.account.address),
  };

  const getPlayerAccount = () => {
    if (!externalAddress) return sessionAccount;
    const clientOptions = {
      chain: networkConfig.chain,
      transport: custom(window.ethereum),
      pollingInterval: 1000,
      account: toAccount(externalAddress),
    };
    const publicClient = createPublicClient(clientOptions);
    const walletClient = createWalletClient(clientOptions);
    const worldContract = getContract({
      address: networkConfig.worldAddress as Hex,
      abi: IWorldAbi,
      publicClient,
      walletClient,
    });
    return {
      worldContract,
      account: walletClient.account,
      address: walletClient.account.address,
      publicClient,
      walletClient,
      entity: addressToEntity(walletClient.account.address),
    };
  };

  const playerAccount = getPlayerAccount();
  // Request drip from faucet
  if (networkConfig.faucetServiceUrl) {
    const faucet = createFaucetClient({ url: networkConfig.faucetServiceUrl });
    const sessionAddress = sessionAccount.address;
    const playerAddress = playerAccount.address;

    const requestDrip = async (address: Hex) => {
      let balance = await publicClient.getBalance({ address });
      console.log("[Faucet] balance:", formatEther(balance));
      balance = await publicClient.getBalance({ address });
      const lowBalance = balance < minEth;
      if (lowBalance) {
        console.info(`[Faucet] Balance is less than ${formatEther(minEth)}, dripping funds`);
        await faucet.drip.mutate({ address: address });
        balance = await publicClient.getBalance({ address });
        console.info(`[Faucet] New balance: ${formatEther(balance)} ETH`);
      }
    };

    requestDrip(sessionAddress);
    setInterval(() => requestDrip(sessionAddress), 4000);
    if (sessionAddress !== playerAddress) {
      requestDrip(playerAddress);
      setInterval(() => requestDrip(playerAddress), 4000);
    }
  }
  // Request a drip every 4 seconds
  return {
    world,
    mudConfig,
    components,
    clock,
    sessionAccount,
    playerAccount,
    latestBlock$,
    latestBlockNumber$,
    storedBlockLogs$,

    waitForTransaction,
    write$: write$.asObservable().pipe(share()),
  };
}
