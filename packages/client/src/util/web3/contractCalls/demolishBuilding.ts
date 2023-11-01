import { Coord } from "@latticexyz/utils";
import { execute } from "src/network/actions";
import { components } from "src/network/components";
import { SetupNetworkResult } from "src/network/types";
import { Hex } from "viem";

export async function demolishBuilding(coord: Coord, network: SetupNetworkResult) {
  const asteroid = components.Home.get(network.playerEntity)?.asteroid;
  if (!asteroid) return;

  const position = { ...coord, parent: asteroid as Hex };

  await execute(() => network.worldContract.write.destroy([position]), network);
}
