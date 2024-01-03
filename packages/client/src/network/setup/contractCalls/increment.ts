import { components } from "src/network/components";
import { AnyAccount, SetupNetworkResult } from "src/network/types";

export const increment = async (network: SetupNetworkResult, account: AnyAccount) => {
  components.CurrentTransaction.set({ value: true });
  const tx = await account.worldContract.write.increment();
  await network.waitForTransaction(tx);

  components.CurrentTransaction.set({ value: false });
  return components.Counter.get();
};
