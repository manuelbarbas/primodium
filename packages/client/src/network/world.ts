import { SingletonID } from "@latticexyz/network";
import { createWorld } from "@latticexyz/recs";

// The world contains references to all entities, all components and disposers.
export const world = createWorld();
export const singletonIndex = world.registerEntity({ id: SingletonID });
