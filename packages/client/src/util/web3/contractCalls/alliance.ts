import { SetupNetworkResult } from "src/network/types";
import { toHex32 } from "src/util/constants";

export const createAlliance = async (name: string, inviteOnly: boolean, network: SetupNetworkResult) => {
  const tx = await network.worldContract.write.create([
    toHex32(name.substring(0, 5).toUpperCase()),
    Number(inviteOnly),
  ]);
  await network.waitForTransaction(tx);
};
