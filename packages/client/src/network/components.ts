import { World } from "@latticexyz/recs";
import {
  defineNumberComponent,
  defineCoordComponent,
} from "@latticexyz/std-client";

export function defineComponents(world: World) {
  return {
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
    OwnedBy: defineNumberComponent(world, {
      metadata: {
        contractId: "component.OwnedBy",
      },
    }),
    Item: defineNumberComponent(world, {
      metadata: {
        contractId: "component.Item",
      },
    }),
  };
}

export function defineOffChainComponents(world: World) {
  return {
    DoubleCounter: defineNumberComponent(world, {
      metadata: {},
      id: "DoubleCounter",
    }),
  };
}
