import {
  Type,
  World,
  defineComponent,
  overridableComponent,
} from "@latticexyz/recs";
import {
  defineBoolComponent,
  defineCoordComponent,
  defineNumberComponent,
  defineStringComponent,
} from "@latticexyz/std-client";

export function defineComponents(world: World) {
  return {
    Counter: defineNumberComponent(world, {
      metadata: {
        contractId: "component.Counter",
      },
      id: "Counter",
    }),
    Position: overridableComponent(
      defineCoordComponent(world, {
        metadata: {
          contractId: "component.Position",
        },
        id: "Position",
      })
    ),
    BuildingType: overridableComponent(
      defineStringComponent(world, {
        metadata: {
          contractId: "component.Tile",
        },
        id: "BuildingType",
      })
    ),
    Path: overridableComponent(
      defineStringComponent(world, {
        metadata: {
          contractId: "component.Path",
        },
        id: "Path",
      })
    ),
    OwnedBy: overridableComponent(
      defineStringComponent(world, {
        metadata: {
          contractId: "component.OwnedBy",
        },
        id: "OwnedBy",
      })
    ),
    LastBuiltAt: overridableComponent(
      defineNumberComponent(world, {
        metadata: {
          contractId: "component.LastBuiltAt",
        },
        id: "LastBuiltAt",
      })
    ),
    LastClaimedAt: overridableComponent(
      defineNumberComponent(world, {
        metadata: {
          contractId: "component.LastClaimedAt",
        },
        id: "LastClaimedAt",
      })
    ),
    Health: defineNumberComponent(world, {
      metadata: {
        contractId: "component.Health",
      },
      id: "Health",
    }),
    Item: defineNumberComponent(world, {
      metadata: {
        contractId: "component.Item",
      },
      id: "Item",
    }),
    Research: defineBoolComponent(world, {
      metadata: {
        contractId: "component.Research",
      },
      id: "Research",
    }),
    // starter pack initialized
    StarterPackInitialized: defineBoolComponent(world, {
      metadata: {
        contractId: "component.StarterPackInitialized",
      },
      id: "StarterPackInitialized",
    }),
    // main base initialized
    MainBaseInitialized: defineComponent(
      world,
      { value: Type.Entity },
      {
        metadata: {
          contractId: "component.MainBaseInitialized",
        },
        id: "MainBaseInitialized",
      }
    ),
    // Resource data stored in components
    RequiredResearchComponent: defineNumberComponent(world, {
      metadata: {
        contractId: "component.RequiredResearch",
      },
      id: "RequiredResearchComponent",
    }),
    RequiredResourcesComponent: defineComponent(
      world,
      {
        value: Type.EntityArray,
      },
      {
        metadata: {
          contractId: "component.RequiredResources",
        },
      }
    ),
    MaxLevel: overridableComponent(
      defineNumberComponent(world, {
        metadata: {
          contractId: "component.MaxLevel",
        },
        id: "MaxLevel",
      })
    ),
    BuildingLevel: overridableComponent(
      defineNumberComponent(world, {
        metadata: {
          contractId: "component.BuildingLevel",
        },
        id: "BuildingLevel",
      })
    ),
    StorageCapacity: overridableComponent(
      defineNumberComponent(world, {
        metadata: {
          contractId: "component.StorageCapacity",
        },
        id: "StorageCapacity",
      })
    ),
    StorageCapacityResources: defineComponent(
      world,
      {
        value: Type.EntityArray,
      },
      {
        metadata: {
          contractId: "component.StorageCapacityResources",
        },
        id: "StorageCapacityResources",
      }
    ),
    Mine: overridableComponent(
      defineNumberComponent(world, {
        metadata: {
          contractId: "component.Mine",
        },
        id: "Mine",
      })
    ),
    BuildingLimit: overridableComponent(
      defineNumberComponent(world, {
        metadata: {
          contractId: "component.BuildingLimit",
        },
        id: "BuildingLimit",
      })
    ),
    BuildingTiles: defineComponent(
      world,
      { value: Type.EntityArray },
      {
        metadata: {
          contractId: "component.BuildingTiles",
        },
        id: "BuildingTiles",
      }
    ),
    RawBlueprint: defineComponent(
      world,
      {
        value: Type.NumberArray,
      },
      {
        metadata: {
          contractId: "component.Blueprint",
        },
        id: "RawBlueprint",
      }
    ),

    UnclaimedResource: defineNumberComponent(world, {
      metadata: {
        contractId: "component.UnclaimedResource",
      },
      id: "UnclaimedResources",
    }),
    // TODO: component data for crafting recipes
  };
}

export function defineOffChainComponents(world: World) {
  return {
    BlockNumber: defineNumberComponent(world, {
      metadata: {},
      id: "BlockNumber",
    }),
    GameReady: defineBoolComponent(world, {
      metadata: {},
      id: "GameStatus",
    }),
    DoubleCounter: defineNumberComponent(world, {
      metadata: {},
      id: "DoubleCounter",
    }),
    SelectedTile: defineCoordComponent(world, {
      metadata: {},
      id: "SelectedTile",
    }),
    // Tile position mouse is hovering over
    HoverTile: defineCoordComponent(world, {
      metadata: {},
      id: "HoverTile",
    }),
    // Building entity ID user selected from menu
    SelectedBuilding: defineComponent(
      world,
      {
        value: Type.Entity,
      },
      {
        metadata: {},
        id: "SelectedBuilding",
      }
    ),
    SelectedAction: defineNumberComponent(world, { id: "SelectedAction" }),

    StartSelectedPath: defineCoordComponent(world, {
      metadata: {},
      id: "StartSelectedPath",
    }),
    SelectedAttack: defineComponent(
      world,
      {
        origin: Type.OptionalString,
        target: Type.OptionalString,
      },
      { metadata: {}, id: "SelectedAttack" }
    ),
    // Market types are added to render custom map ui elements like waypoints, arrows, etc
    Marker: defineStringComponent(world, {
      metadata: {},
      id: "Marker",
    }),
  };
}
