import { ContractWrite } from "@latticexyz/common";
import { transactionQueue, writeObserver } from "@latticexyz/common/actions";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { Subject } from "rxjs";
import { normalizeAddress } from "src/util/common";
import { addressToEntity } from "src/util/encode";
import { Account, Address, Hex, createPublicClient, createWalletClient, custom, getContract } from "viem";
import { toAccount } from "viem/accounts";
import { getNetworkConfig } from "../config/getNetworkConfig";

export async function createExternalAccount(address: Address) {
  const networkConfig = getNetworkConfig();

  const clientOptions = {
    chain: networkConfig.chain,
    transport: custom(window.ethereum),
    pollingInterval: 1000,
    account: toAccount(address) as Account,
  };
  const publicClient = createPublicClient(clientOptions);
  const walletClient = createWalletClient(clientOptions);

  const write$ = new Subject<ContractWrite>();
  walletClient.extend(transactionQueue()).extend(writeObserver({ onWrite: (write) => write$.next(write) }));

  const worldContract = getContract({
    address: networkConfig.worldAddress as Hex,
    abi: IWorldAbi,
    client: {
      public: publicClient,
      wallet: walletClient,
    },
  });

  return {
    worldContract,
    account: walletClient.account,
    address: normalizeAddress(walletClient.account.address),
    publicClient,
    walletClient,
    entity: addressToEntity(walletClient.account.address),
    write$,
    privateKey: undefined,
  };
}
