import { World } from "@latticexyz/recs";
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
    // debug craft resource
    BulletCrafted: defineNumberComponent(world, {
      metadata: {
        contractId: "component.BulletCrafted",
      },
    }),

    // Research Components
    PlatingFactoryResearch: defineNumberComponent(world, {
      metadata: {
        contractId: "component.PlatingFactoryResearch",
      },
    }),
    BasicBatteryFactoryResearch: defineNumberComponent(world, {
      metadata: {
        contractId: "component.BasicBatteryFactoryResearch",
      },
    }),
    KineticMissileFactoryResearch: defineNumberComponent(world, {
      metadata: {
        contractId: "component.KineticMissileFactoryResearch",
      },
    }),
    ProjectileLauncherResearch: defineNumberComponent(world, {
      metadata: {
        contractId: "component.ProjectileLauncherResearch",
      },
    }),
    HardenedDrillResearch: defineNumberComponent(world, {
      metadata: {
        contractId: "component.HardenedDrillResearch",
      },
    }),
    DenseMetalRefineryResearch: defineNumberComponent(world, {
      metadata: {
        contractId: "component.DenseMetalRefineryResearch",
      },
    }),
    AdvancedBatteryFactoryResearch: defineNumberComponent(world, {
      metadata: {
        contractId: "component.AdvancedBatteryFactoryResearch",
      },
    }),
    HighTempFoundryResearch: defineNumberComponent(world, {
      metadata: {
        contractId: "component.HighTempFoundryResearch",
      },
    }),
    PrecisionMachineryFactoryResearch: defineNumberComponent(world, {
      metadata: {
        contractId: "component.PrecisionMachineryFactoryResearch",
      },
    }),
    IridiumDrillbitFactoryResearch: defineNumberComponent(world, {
      metadata: {
        contractId: "component.IridiumDrillbitFactoryResearch",
      },
    }),
    PrecisionPneumaticDrillResearch: defineNumberComponent(world, {
      metadata: {
        contractId: "component.PrecisionPneumaticDrillResearch",
      },
    }),
    PenetratorFactoryResearch: defineNumberComponent(world, {
      metadata: {
        contractId: "component.PenetratorFactoryResearch",
      },
    }),
    PenetratingMissileFactoryResearch: defineNumberComponent(world, {
      metadata: {
        contractId: "component.PenetratingMissileFactoryResearch",
      },
    }),
    MissileLaunchComplexResearch: defineNumberComponent(world, {
      metadata: {
        contractId: "component.MissileLaunchComplexResearch",
      },
    }),
    HighEnergyLaserFactoryResearch: defineNumberComponent(world, {
      metadata: {
        contractId: "component.HighEnergyLaserFactoryResearch",
      },
    }),
    ThermobaricWarheadFactoryResearch: defineNumberComponent(world, {
      metadata: {
        contractId: "component.ThermobaricWarheadFactoryResearch",
      },
    }),
    ThermobaricMissileFactoryResearch: defineNumberComponent(world, {
      metadata: {
        contractId: "component.ThermobaricMissileFactoryResearch",
      },
    }),
    KimberliteCatalystFactoryResearch: defineNumberComponent(world, {
      metadata: {
        contractId: "component.KimberliteCatalystFactoryResearch",
      },
    }),

    // Crafted Components
    IronPlateCrafted: defineBoolComponent(world, {
      metadata: {
        contractId: "component.IronPlateCrafted",
      },
    }),
    BasicPowerSourceCrafted: defineBoolComponent(world, {
      metadata: {
        contractId: "component.BasicPowerSourceCrafted",
      },
    }),
    KineticMissileCrafted: defineBoolComponent(world, {
      metadata: {
        contractId: "component.KineticMissileCrafted",
      },
    }),
    RefinedOsmiumCrafted: defineBoolComponent(world, {
      metadata: {
        contractId: "component.RefinedOsmiumCrafted",
      },
    }),
    AdvancedPowerSourceCrafted: defineBoolComponent(world, {
      metadata: {
        contractId: "component.AdvancedPowerSourceCrafted",
      },
    }),
    PenetratingWarheadCrafted: defineBoolComponent(world, {
      metadata: {
        contractId: "component.PenetratingWarheadCrafted",
      },
    }),
    PenetratingMissileCrafted: defineBoolComponent(world, {
      metadata: {
        contractId: "component.PenetratingMissileCrafted",
      },
    }),
    TungstenRodsCrafted: defineBoolComponent(world, {
      metadata: {
        contractId: "component.TungstenRodsCrafted",
      },
    }),
    IridiumCrystalCrafted: defineBoolComponent(world, {
      metadata: {
        contractId: "component.IridiumCrystalCrafted",
      },
    }),
    IridiumDrillbitCrafted: defineBoolComponent(world, {
      metadata: {
        contractId: "component.IridiumDrillbitCrafted",
      },
    }),
    LaserPowerSourceCrafted: defineBoolComponent(world, {
      metadata: {
        contractId: "component.LaserPowerSourceCrafted",
      },
    }),
    ThermobaricWarheadCrafted: defineBoolComponent(world, {
      metadata: {
        contractId: "component.ThermobaricWarheadCrafted",
      },
    }),
    ThermobaricMissileCrafted: defineBoolComponent(world, {
      metadata: {
        contractId: "component.ThermobaricMissileCrafted",
      },
    }),
    KimberliteCrystalCatalystCrafted: defineBoolComponent(world, {
      metadata: {
        contractId: "component.KimberliteCrystalCatalystCrafted",
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
