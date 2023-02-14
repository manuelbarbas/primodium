import ReactDOM from "react-dom/client";
import { setupMUDNetwork } from "@latticexyz/std-client";
import {
  createWorld,
  defineComponentSystem,
  setComponent,
} from "@latticexyz/recs";
import { SystemTypes } from "contracts/types/SystemTypes";
import { SystemAbis } from "contracts/types/SystemAbis.mjs";
import {
  defineNumberComponent,
  defineCoordComponent,
} from "@latticexyz/std-client";
import { GodID as SingletonID } from "@latticexyz/network";

import { config } from "./config";
import App from "./App";

import "./index.css";

const rootElement = document.getElementById("react-root");
if (!rootElement) throw new Error("React root not found");
const root = ReactDOM.createRoot(rootElement);

// The world contains references to all entities, all components and disposers.
const world = createWorld();
export const singletonIndex = world.registerEntity({ id: SingletonID });

// Components contain the application state.
// If a contractId is provided, MUD syncs the state with the corresponding
// component contract (in this case `CounterComponent.sol`)
export const components = {
  Counter: defineNumberComponent(world, {
    metadata: {
      contractId: "component.Counter",
    },
  }),
  Position: defineCoordComponent(world, {
    metadata: {
      contractId: "component.Position",
    },
  }),
  Tile: defineNumberComponent(world, {
    metadata: {
      contractId: "component.Tile",
    },
  }),
  Path: defineNumberComponent(world, {
    metadata: {
      contractId: "component.Path",
    },
  }),
  Item: defineNumberComponent(world, {
    metadata: {
      contractId: "component.Item",
    },
  }),
};

export const offChainComponents = {
  DoubleCounter: defineNumberComponent(world, {
    metadata: {},
    id: "DoubleCounter",
  }),
};

async function boot() {
  // await createNetworkLayer();

  const { startSync, systems } = await setupMUDNetwork<
    typeof components,
    SystemTypes
  >(config, world, components, SystemAbis);

  defineComponentSystem(world, components.Counter, (update) => {
    setComponent(
      offChainComponents.DoubleCounter,
      // world.entityToIndex.get(SingletonID)!,
      singletonIndex,
      {
        value: update.value[0]!.value * 2,
      }
    );
  });

  // index to id
  // world.entities[index]

  startSync();

  root.render(<App world={world} systems={systems} components={components} />);
}

boot();
