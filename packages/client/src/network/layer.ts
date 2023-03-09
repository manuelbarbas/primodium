import { SetupContractConfig, setupMUDNetwork } from "@latticexyz/std-client";
import {
  createWorld,
  defineComponentSystem,
  setComponent,
} from "@latticexyz/recs";
import { SingletonID } from "@latticexyz/network";

import { SystemTypes } from "contracts/types/SystemTypes";
import { SystemAbis } from "contracts/types/SystemAbis.mjs";
import { defineComponents, defineOffChainComponents } from "./components";

export async function createNetworkLayer(config: SetupContractConfig) {
  // The world contains references to all entities, all components and disposers.
  const world = createWorld();
  const singletonIndex = world.registerEntity({ id: SingletonID });

  // Components contain the application state.
  // If a contractId is provided, MUD syncs the state with the corresponding
  // component contract (in this case `CounterComponent.sol`)

  const contractComponents = defineComponents(world);
  const offChainComponents = defineOffChainComponents(world);

  const { startSync, systems, components } = await setupMUDNetwork<
    typeof contractComponents,
    SystemTypes
  >(config, world, contractComponents, SystemAbis);

  defineComponentSystem(world, components.Counter, (update) => {
    setComponent(offChainComponents.DoubleCounter, singletonIndex, {
      value: update.value[0]!.value * 2,
    });
  });

  startSync();

  return {
    world,
    systems,
    components,
    offChainComponents,
    singletonIndex,
  };
}
