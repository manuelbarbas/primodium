import { SingletonID } from "@latticexyz/network";
import { createWorld } from "@latticexyz/recs";
import { defineComponents, defineOffChainComponents } from "./components";

// The world contains references to all entities, all components and disposers.
export const world = createWorld();
export const singletonIndex = world.registerEntity({ id: SingletonID });

export const contractComponents = defineComponents(world);
export const offChainComponents = defineOffChainComponents(world);