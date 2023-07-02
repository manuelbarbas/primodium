import { EntityID, World, getComponentValue } from "@latticexyz/recs";
import { BlockType } from "./constants";
import { defineComponents } from "../network/components";
import { NetworkComponents } from "@latticexyz/std-client";
import { hashKeyEntity } from "./encode";
import { BigNumber } from "ethers";

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
// fetch directly from component data
export function getRecipe(
  entityId: EntityID,
  world: World,
  components: NetworkComponents<ReturnType<typeof defineComponents>>
): ResourceCostData["resources"] {
  const requiredResources = getComponentValue(
    components.RequiredResourcesComponent,
    world.entityToIndex.get(entityId)!
  );

  if (!requiredResources || requiredResources.value.length == 0) return [];
  return requiredResources!.value.map((resourceId: EntityID) => {
    // remove leading zeros due to mudv1 hashing behavior
    const resourceCost = getComponentValue(
      components.Item,
      world.entityToIndex.get(
        BigNumber.from(
          hashKeyEntity(resourceId, entityId)
        ).toHexString() as EntityID
      )!
    );

    return {
      id: resourceId,
      amount: resourceCost ? parseInt(resourceCost!.value.toString()) : -1,
    };
  });
}

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
