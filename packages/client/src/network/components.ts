import { World } from "@latticexyz/recs";
import { overridableComponent } from "@latticexyz/recs";
import {
  defineBoolComponent,
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
    Position: overridableComponent(
      defineCoordComponent(world, {
        metadata: {
          contractId: "component.Position",
        },
      })
    ),
    Tile: overridableComponent(
      defineNumberComponent(world, {
        metadata: {
          contractId: "component.Tile",
        },
      })
    ),
    Path: defineNumberComponent(world, {
      metadata: {
        contractId: "component.Path",
      },
    }),
    OwnedBy: overridableComponent(
      defineNumberComponent(world, {
        metadata: {
          contractId: "component.OwnedBy",
        },
      })
    ),
    LastBuiltAt: overridableComponent(
      defineNumberComponent(world, {
        metadata: {
          contractId: "component.LastBuiltAt",
        },
      })
    ),
    LastClaimedAt: overridableComponent(
      defineNumberComponent(world, {
        metadata: {
          contractId: "component.LastClaimedAt",
        },
      })
    ),
    Health: defineNumberComponent(world, {
      metadata: {
        contractId: "component.Health",
      },
    }),
    Item: defineNumberComponent(world, {
      metadata: {
        contractId: "component.Item",
      },
    }),
    Research: defineBoolComponent(world, {
      metadata: {
        contractId: "component.Research",
      },
    }),
    // starter pack initialized
    StarterPackInitialized: defineBoolComponent(world, {
      metadata: {
        contractId: "component.StarterPackInitialized",
      },
    }),
    // main base initialized
    MainBaseInitialized: defineCoordComponent(world, {
      metadata: {
        contractId: "component.MainBaseInitialized",
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
