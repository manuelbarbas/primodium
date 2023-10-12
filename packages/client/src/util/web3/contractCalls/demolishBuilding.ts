import { Coord } from "@latticexyz/utils";
import { components } from "src/network/components";
import { SetupNetworkResult } from "src/network/types";
import { Hex } from "viem";

export async function demolishBuilding(coord: Coord, network: SetupNetworkResult) {
  const asteroid = components.Home.get(network.playerEntity)?.asteroid;
  if (!asteroid) return;

  const position = { ...coord, parent: asteroid as Hex };
  const tx = await network.worldContract.write.destroy([position]);
  await network.waitForTransaction(tx);
}
