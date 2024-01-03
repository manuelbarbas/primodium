import { ContractWrite, getContract } from "@latticexyz/common";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { Subject } from "rxjs";
import { addressToEntity } from "src/util/encode";
import { Hex, createPublicClient, createWalletClient, custom } from "viem";
import { toAccount } from "viem/accounts";
import { getNetworkConfig } from "../config/getNetworkConfig";

export async function setupPlayerAccount(externalAddress: Hex) {
  const networkConfig = getNetworkConfig();

  const clientOptions = {
    chain: networkConfig.chain,
    transport: custom(window.ethereum),
    pollingInterval: 1000,
    account: toAccount(externalAddress),
  };
  const publicClient = createPublicClient(clientOptions);
  const walletClient = createWalletClient(clientOptions);
  const write$ = new Subject<ContractWrite>();
  const worldContract = getContract({
    address: networkConfig.worldAddress as Hex,
    abi: IWorldAbi,
    publicClient,
    walletClient,

    onWrite: (write) => write$.next(write),
  });
  return {
    worldContract,
    account: walletClient.account,
    address: walletClient.account.address,
    publicClient,
    walletClient,
    entity: addressToEntity(walletClient.account.address),
    write$,
  };
}
