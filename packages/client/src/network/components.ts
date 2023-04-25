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
    CopperResearch: defineBoolComponent(world, {
      metadata: {
        contractId: "component.CopperResearch",
      },
    }),
    LithiumResearch: defineBoolComponent(world, {
      metadata: {
        contractId: "component.LithiumResearch",
      },
    }),
    TitaniumResearch: defineBoolComponent(world, {
      metadata: {
        contractId: "component.TitaniumResearch",
      },
    }),
    OsmiumResearch: defineBoolComponent(world, {
      metadata: {
        contractId: "component.OsmiumResearch",
      },
    }),
    TungstenResearch: defineBoolComponent(world, {
      metadata: {
        contractId: "component.TungstenResearch",
      },
    }),
    IridiumResearch: defineBoolComponent(world, {
      metadata: {
        contractId: "component.IridiumResearch",
      },
    }),
    KimberliteResearch: defineBoolComponent(world, {
      metadata: {
        contractId: "component.KimberliteResearch",
      },
    }),

    PlatingFactoryResearch: defineBoolComponent(world, {
      metadata: {
        contractId: "component.PlatingFactoryResearch",
      },
    }),
    BasicBatteryFactoryResearch: defineBoolComponent(world, {
      metadata: {
        contractId: "component.BasicBatteryFactoryResearch",
      },
    }),
    KineticMissileFactoryResearch: defineBoolComponent(world, {
      metadata: {
        contractId: "component.KineticMissileFactoryResearch",
      },
    }),
    ProjectileLauncherResearch: defineBoolComponent(world, {
      metadata: {
        contractId: "component.ProjectileLauncherResearch",
      },
    }),
    HardenedDrillResearch: defineBoolComponent(world, {
      metadata: {
        contractId: "component.HardenedDrillResearch",
      },
    }),
    DenseMetalRefineryResearch: defineBoolComponent(world, {
      metadata: {
        contractId: "component.DenseMetalRefineryResearch",
      },
    }),
    AdvancedBatteryFactoryResearch: defineBoolComponent(world, {
      metadata: {
        contractId: "component.AdvancedBatteryFactoryResearch",
      },
    }),
    HighTempFoundryResearch: defineBoolComponent(world, {
      metadata: {
        contractId: "component.HighTempFoundryResearch",
      },
    }),
    PrecisionMachineryFactoryResearch: defineBoolComponent(world, {
      metadata: {
        contractId: "component.PrecisionMachineryFactoryResearch",
      },
    }),
    IridiumDrillbitFactoryResearch: defineBoolComponent(world, {
      metadata: {
        contractId: "component.IridiumDrillbitFactoryResearch",
      },
    }),
    PrecisionPneumaticDrillResearch: defineBoolComponent(world, {
      metadata: {
        contractId: "component.PrecisionPneumaticDrillResearch",
      },
    }),
    PenetratorFactoryResearch: defineBoolComponent(world, {
      metadata: {
        contractId: "component.PenetratorFactoryResearch",
      },
    }),
    PenetratingMissileFactoryResearch: defineBoolComponent(world, {
      metadata: {
        contractId: "component.PenetratingMissileFactoryResearch",
      },
    }),
    MissileLaunchComplexResearch: defineBoolComponent(world, {
      metadata: {
        contractId: "component.MissileLaunchComplexResearch",
      },
    }),
    HighEnergyLaserFactoryResearch: defineBoolComponent(world, {
      metadata: {
        contractId: "component.HighEnergyLaserFactoryResearch",
      },
    }),
    ThermobaricWarheadFactoryResearch: defineBoolComponent(world, {
      metadata: {
        contractId: "component.ThermobaricWarheadFactoryResearch",
      },
    }),
    ThermobaricMissileFactoryResearch: defineBoolComponent(world, {
      metadata: {
        contractId: "component.ThermobaricMissileFactoryResearch",
      },
    }),
    KimberliteCatalystFactoryResearch: defineBoolComponent(world, {
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
