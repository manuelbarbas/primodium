import { EntityID } from "@latticexyz/recs";
import { BlockType } from "./constants";

export type ResourceCostData = {
  name: string;
  id: EntityID;
  description?: string;
  resources: {
    id: EntityID;
    amount: number;
  }[];
};

// crafting an item in factories require resources
export const CraftRecipe = new Map<EntityID, ResourceCostData[]>([
  [
    BlockType.BulletFactory,
    [
      {
        name: "-1",
        id: BlockType.BulletCrafted,
        resources: [
          { id: BlockType.Iron, amount: 1 },
          { id: BlockType.Copper, amount: 1 },
        ],
      },
    ],
  ],
  [
    BlockType.PlatingFactory,
    [
      {
        name: "0",
        id: BlockType.IronPlateCrafted,
        resources: [{ id: BlockType.Iron, amount: 10 }],
      },
    ],
  ],
  [
    BlockType.BasicBatteryFactory,
    [
      {
        name: "1",
        id: BlockType.BasicPowerSourceCrafted,
        resources: [
          { id: BlockType.Lithium, amount: 100 },
          { id: BlockType.Iron, amount: 20 },
        ],
      },
    ],
  ],
  [
    BlockType.KineticMissileFactory,
    [
      {
        name: "2",
        id: BlockType.KineticMissileCrafted,
        resources: [
          { id: BlockType.BasicPowerSourceCrafted, amount: 10 },
          { id: BlockType.Titanium, amount: 20 },
        ],
      },
    ],
  ],
  [
    BlockType.DenseMetalRefinery,
    [
      {
        name: "3",
        id: BlockType.RefinedOsmiumCrafted,
        resources: [{ id: BlockType.Osmium, amount: 10 }],
      },
    ],
  ],
  [
    BlockType.AdvancedBatteryFactory,
    [
      {
        name: "4",
        id: BlockType.AdvancedPowerSourceCrafted,
        resources: [
          { id: BlockType.RefinedOsmiumCrafted, amount: 10 },
          { id: BlockType.BasicPowerSourceCrafted, amount: 2 },
        ],
      },
    ],
  ],
  [
    BlockType.PenetratorFactory,
    [
      {
        name: "5",
        id: BlockType.PenetratingWarheadCrafted,
        resources: [
          { id: BlockType.RefinedOsmiumCrafted, amount: 20 },
          { id: BlockType.AdvancedPowerSourceCrafted, amount: 5 },
        ],
      },
    ],
  ],
  [
    BlockType.PenetratingMissileFactory,
    [
      {
        name: "6",
        id: BlockType.PenetratingMissileCrafted,
        resources: [
          { id: BlockType.PenetratingWarheadCrafted, amount: 1 },
          { id: BlockType.KineticMissileCrafted, amount: 1 },
        ],
      },
    ],
  ],
  [
    BlockType.HighTempFoundry,
    [
      {
        name: "7",
        id: BlockType.TungstenRodsCrafted,
        resources: [{ id: BlockType.Tungsten, amount: 10 }],
      },
    ],
  ],
  [
    BlockType.PrecisionMachineryFactory,
    [
      {
        name: "8",
        id: BlockType.IridiumCrystalCrafted,
        resources: [{ id: BlockType.Iridium, amount: 10 }],
      },
    ],
  ],
  [
    BlockType.IridiumDrillbitFactory,
    [
      {
        name: "9",
        id: BlockType.IridiumDrillbitCrafted,
        resources: [
          { id: BlockType.IridiumCrystalCrafted, amount: 5 },
          { id: BlockType.TungstenRodsCrafted, amount: 10 },
        ],
      },
    ],
  ],
  [
    BlockType.HighEnergyLaserFactory,
    [
      {
        name: "10",
        id: BlockType.LaserPowerSourceCrafted,
        resources: [
          { id: BlockType.IridiumCrystalCrafted, amount: 10 },
          { id: BlockType.AdvancedPowerSourceCrafted, amount: 5 },
        ],
      },
    ],
  ],
  [
    BlockType.ThermobaricWarheadFactory,
    [
      {
        name: "11",
        id: BlockType.ThermobaricWarheadCrafted,
        resources: [
          { id: BlockType.IridiumDrillbitCrafted, amount: 1 },
          { id: BlockType.LaserPowerSourceCrafted, amount: 1 },
        ],
      },
    ],
  ],
  [
    BlockType.ThermobaricMissileFactory,
    [
      {
        name: "12",
        id: BlockType.ThermobaricMissileCrafted,
        resources: [
          { id: BlockType.PenetratingMissileCrafted, amount: 10 },
          { id: BlockType.ThermobaricWarheadCrafted, amount: 1 },
        ],
      },
    ],
  ],
  [
    BlockType.KimberliteCatalystFactory,
    [
      {
        name: "13",
        id: BlockType.KimberliteCrystalCatalystCrafted,
        resources: [{ id: BlockType.Kimberlite, amount: 10 }],
      },
    ],
  ],
]);

// building a building requires resources
export const BuildingReceipe = new Map<EntityID, ResourceCostData[]>([
  [
    BlockType.BasicMiner,
    [
      {
        name: "0",
        id: BlockType.BasicMiner,
        resources: [{ id: BlockType.Iron, amount: 100 }],
      },
    ],
  ],
  [
    BlockType.Node,
    [
      {
        name: "1",
        id: BlockType.Node,
        resources: [{ id: BlockType.Iron, amount: 50 }],
      },
    ],
  ],
  [
    BlockType.PlatingFactory,
    [
      {
        name: "2",
        id: BlockType.PlatingFactory,
        resources: [
          { id: BlockType.Iron, amount: 100 },
          { id: BlockType.Copper, amount: 50 },
        ],
      },
    ],
  ],
  [
    BlockType.BasicBatteryFactory,
    [
      {
        name: "3",
        id: BlockType.BasicBatteryFactory,
        resources: [
          { id: BlockType.IronPlateCrafted, amount: 20 },
          { id: BlockType.Copper, amount: 50 },
        ],
      },
    ],
  ],
  [
    BlockType.KineticMissileFactory,
    [
      {
        name: "4",
        id: BlockType.KineticMissileFactory,
        resources: [
          { id: BlockType.IronPlateCrafted, amount: 100 },
          { id: BlockType.Lithium, amount: 50 },
          { id: BlockType.BasicPowerSourceCrafted, amount: 10 },
        ],
      },
    ],
  ],
  [
    BlockType.ProjectileLauncher,
    [
      {
        name: "5",
        id: BlockType.ProjectileLauncher,
        resources: [
          { id: BlockType.IronPlateCrafted, amount: 100 },
          { id: BlockType.Titanium, amount: 100 },
        ],
      },
    ],
  ],
  [
    BlockType.HardenedDrill,
    [
      {
        name: "6",
        id: BlockType.HardenedDrill,
        resources: [
          { id: BlockType.Titanium, amount: 100 },
          { id: BlockType.IronPlateCrafted, amount: 10 },
          { id: BlockType.BasicPowerSourceCrafted, amount: 5 },
        ],
      },
    ],
  ],
  [
    BlockType.DenseMetalRefinery,
    [
      {
        name: "7",
        id: BlockType.DenseMetalRefinery,
        resources: [
          { id: BlockType.Osmium, amount: 50 },
          { id: BlockType.Titanium, amount: 100 },
          { id: BlockType.IronPlateCrafted, amount: 30 },
          { id: BlockType.BasicPowerSourceCrafted, amount: 10 },
        ],
      },
    ],
  ],
  [
    BlockType.AdvancedBatteryFactory,
    [
      {
        name: "8",
        id: BlockType.AdvancedBatteryFactory,
        resources: [
          { id: BlockType.Osmium, amount: 150 },
          { id: BlockType.Titanium, amount: 50 },
          { id: BlockType.BasicPowerSourceCrafted, amount: 20 },
        ],
      },
    ],
  ],
  [
    BlockType.HighTempFoundry,
    [
      {
        name: "9",
        id: BlockType.HighTempFoundry,
        resources: [
          { id: BlockType.Tungsten, amount: 50 },
          { id: BlockType.RefinedOsmiumCrafted, amount: 50 },
          { id: BlockType.AdvancedPowerSourceCrafted, amount: 20 },
        ],
      },
    ],
  ],
  [
    BlockType.PrecisionMachineryFactory,
    [
      {
        name: "10",
        id: BlockType.PrecisionMachineryFactory,
        resources: [
          { id: BlockType.Iridium, amount: 50 },
          { id: BlockType.TungstenRodsCrafted, amount: 50 },
          { id: BlockType.AdvancedPowerSourceCrafted, amount: 10 },
        ],
      },
    ],
  ],
  [
    BlockType.IridiumDrillbitFactory,
    [
      {
        name: "11",
        id: BlockType.IridiumDrillbitFactory,
        resources: [
          { id: BlockType.TungstenRodsCrafted, amount: 50 },
          { id: BlockType.LaserPowerSourceCrafted, amount: 5 },
        ],
      },
    ],
  ],
  [
    BlockType.PrecisionPneumaticDrill,
    [
      {
        name: "12",
        id: BlockType.PrecisionPneumaticDrill,
        resources: [
          { id: BlockType.Tungsten, amount: 100 },

          { id: BlockType.Osmium, amount: 100 },
          { id: BlockType.LaserPowerSourceCrafted, amount: 5 },
        ],
      },
    ],
  ],
  [
    BlockType.PenetratorFactory,
    [
      {
        name: "13",
        id: BlockType.PenetratorFactory,
        resources: [
          { id: BlockType.Osmium, amount: 200 },
          { id: BlockType.IronPlateCrafted, amount: 50 },
          { id: BlockType.AdvancedPowerSourceCrafted, amount: 10 },
        ],
      },
    ],
  ],
  [
    BlockType.PenetratingMissileFactory,
    [
      {
        name: "14",
        id: BlockType.PenetratingMissileFactory,
        resources: [
          { id: BlockType.Osmium, amount: 300 },
          { id: BlockType.Titanium, amount: 100 },
          { id: BlockType.AdvancedPowerSourceCrafted, amount: 15 },
        ],
      },
    ],
  ],
  [
    BlockType.MissileLaunchComplex,
    [
      {
        name: "15",
        id: BlockType.MissileLaunchComplex,
        resources: [
          { id: BlockType.TungstenRodsCrafted, amount: 100 },
          { id: BlockType.Osmium, amount: 100 },
        ],
      },
    ],
  ],
  [
    BlockType.HighEnergyLaserFactory,
    [
      {
        name: "16",
        id: BlockType.HighEnergyLaserFactory,
        resources: [
          { id: BlockType.IridiumCrystalCrafted, amount: 50 },
          { id: BlockType.RefinedOsmiumCrafted, amount: 100 },
          { id: BlockType.AdvancedPowerSourceCrafted, amount: 50 },
        ],
      },
    ],
  ],
  [
    BlockType.ThermobaricWarheadFactory,
    [
      {
        name: "17",
        id: BlockType.ThermobaricWarheadFactory,
        resources: [
          { id: BlockType.RefinedOsmiumCrafted, amount: 200 },
          { id: BlockType.IridiumCrystalCrafted, amount: 100 },
          { id: BlockType.LaserPowerSourceCrafted, amount: 10 },
        ],
      },
    ],
  ],
  [
    BlockType.ThermobaricMissileFactory,
    [
      {
        name: "18",
        id: BlockType.ThermobaricMissileFactory,
        resources: [
          { id: BlockType.IridiumCrystalCrafted, amount: 100 },
          { id: BlockType.TungstenRodsCrafted, amount: 100 },
          { id: BlockType.LaserPowerSourceCrafted, amount: 20 },
        ],
      },
    ],
  ],
  [
    BlockType.KimberliteCatalystFactory,
    [
      {
        name: "19",
        id: BlockType.KimberliteCatalystFactory,
        resources: [
          { id: BlockType.IridiumCrystalCrafted, amount: 200 },
          { id: BlockType.LaserPowerSourceCrafted, amount: 20 },
        ],
      },
    ],
  ],
]);

// researching an item requires resources
// refer to research.ts for the actual research tree

// Building can claim, store, but not craft
// with the exception of MainBase, which claims directly to wallet instead of its own storage
export function isClaimable(tileId: EntityID) {
  return (
    tileId == BlockType.MainBase ||
    tileId == BlockType.ProjectileLauncher ||
    tileId == BlockType.MissileLaunchComplex ||
    // debug
    tileId == BlockType.Silo
  );
}

// Building can claim, store, and craft
export function isClaimableFactory(tileId: EntityID) {
  return (
    tileId == BlockType.PlatingFactory ||
    tileId == BlockType.BasicBatteryFactory ||
    tileId == BlockType.KineticMissileFactory ||
    tileId == BlockType.HardenedDrill ||
    tileId == BlockType.DenseMetalRefinery ||
    tileId == BlockType.AdvancedBatteryFactory ||
    tileId == BlockType.HighTempFoundry ||
    tileId == BlockType.PrecisionMachineryFactory ||
    tileId == BlockType.IridiumDrillbitFactory ||
    tileId == BlockType.PrecisionPneumaticDrill ||
    tileId == BlockType.PenetratorFactory ||
    tileId == BlockType.PenetratingMissileFactory ||
    tileId == BlockType.HighEnergyLaserFactory ||
    tileId == BlockType.ThermobaricWarheadFactory ||
    tileId == BlockType.ThermobaricMissileFactory ||
    tileId == BlockType.KimberliteCatalystFactory ||
    // debug
    tileId == BlockType.BulletFactory
  );
}

// Main base claims to inventory, not storage
export function isMainBase(tileId: EntityID) {
  return tileId == BlockType.MainBase;
}
