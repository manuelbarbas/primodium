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
    LastBuiltAt: defineNumberComponent(world, {
      metadata: {
        contractId: "component.LastBuiltAt",
      },
    }),
    LastClaimedAt: defineNumberComponent(world, {
      metadata: {
        contractId: "component.LastClaimedAt",
      },
    }),
    BolutiteResource: defineNumberComponent(world, {
      metadata: {
        contractId: "component.BolutiteResource",
      },
    }),
    CopperResource: defineNumberComponent(world, {
      metadata: {
        contractId: "component.CopperResource",
      },
    }),
    IridiumResource: defineNumberComponent(world, {
      metadata: {
        contractId: "component.IridiumResource",
      },
    }),
    IronResource: defineNumberComponent(world, {
      metadata: {
        contractId: "component.IronResource",
      },
    }),
    KimberliteResource: defineNumberComponent(world, {
      metadata: {
        contractId: "component.KimberliteResource",
      },
    }),
    LithiumResource: defineNumberComponent(world, {
      metadata: {
        contractId: "component.LithiumResource",
      },
    }),
    OsmiumResource: defineNumberComponent(world, {
      metadata: {
        contractId: "component.OsmiumResource",
      },
    }),
    TungstenResource: defineNumberComponent(world, {
      metadata: {
        contractId: "component.TungstenResource",
      },
    }),
    UraniniteResource: defineNumberComponent(world, {
      metadata: {
        contractId: "component.UraniniteResource",
      },
    }),
    BulletCrafted: defineNumberComponent(world, {
      metadata: {
        contractId: "component.BulletCrafted",
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
