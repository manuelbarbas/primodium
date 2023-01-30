import ReactDOM from "react-dom/client";
import { setupMUDNetwork } from "@latticexyz/std-client";
import { createWorld, defineComponent, Type } from "@latticexyz/recs";
import { SystemTypes } from "contracts/types/SystemTypes";
import { SystemAbis } from "contracts/types/SystemAbis.mjs";
import { defineNumberComponent } from "@latticexyz/std-client";
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
  // add the new terraintile component here
  TerrainTile: defineComponent(
    world,
    {
      x: Type.Number,
      y: Type.Number,
      id: Type.Number,
    },
    {
      id: "TerrainTile",
      metadata: {
        contractId: "component.TerrainTile",
      },
    }
  ),
};

async function boot() {
  // await createNetworkLayer();

  const { startSync, systems } = await setupMUDNetwork<
    typeof components,
    SystemTypes
  >(config, world, components, SystemAbis);
  startSync();

  root.render(<App world={world} systems={systems} components={components} />);
}

boot();
