import { SetupNetworkResult } from "src/network/types";

export const updateSpaceRock = async (network: SetupNetworkResult) => {
  // todo: find a cleaner way to extract this value in all web3 functions
  // const activeAsteroid = HomeAsteroid.get()?.value;
  // const address = Account.get()?.value;
  // if (!activeAsteroid || !address) return;
  // try {
  //   setTransactionLoading(true);
  //   await execute(
  //     systems["system.S_UpdatePlayerSpaceRock"].executeTyped(address, activeAsteroid, {
  //       gasLimit: 10_000_000,
  //     }),
  //     providers
  //   );
  // }
};
