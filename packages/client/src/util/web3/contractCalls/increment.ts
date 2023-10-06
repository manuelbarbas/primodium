import { Entity } from "@latticexyz/recs";
import { SetupNetworkResult } from "src/network/types";

export const increment = async (entity: Entity, network: SetupNetworkResult) => {
  // const counter = Counter.get();
  // const receipt = await execute(
  //   systems["system.Increment"].executeTyped(entity, {
  //     gasLimit: 1_000_000,
  //   }),
  //   providers
  // );
  // ampli.systemIncrement({
  //   currIncrementLevel: counter?.value ?? 0,
  //   ...parseReceipt(receipt),
  // });
};
