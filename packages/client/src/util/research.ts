import { EntityID, World, getComponentValue } from "@latticexyz/recs";
import { NetworkComponents } from "@latticexyz/std-client";

import { BlockType } from "./constants";
import { ResourceCostData } from "./resource";
import { defineComponents } from "../network/components";

// Research Technology Tree
export type TechnologyTreeNode = {
  id: string;
  data: ResourceCostData;
  position: {
    x: number;
    y: number;
  };
};

export const ResearchDefaultUnlocked = new Set<EntityID>([
  BlockType.MainBaseResearch,
  BlockType.Iron,
  BlockType.BasicMinerResearch,
  BlockType.NodeResearch,

  // debug
  BlockType.ConveyorResearch,
  BlockType.BulletFactoryResearch,
  BlockType.SiloResearch,
]);

export function getBuildingResearchRequirement(
  buildingId: EntityID,
  world: World,
  components: NetworkComponents<ReturnType<typeof defineComponents>>
): EntityID | null {
  const requiredResearch = getComponentValue(
    components.RequiredResearchComponent,
    world.entityToIndex.get(buildingId)!
  );

  if (!requiredResearch) return null;
  return requiredResearch.value as unknown as EntityID;
}

// Research resource data should be read from getRecipe() in ../util/resource.ts

export const ResearchTechnologyTree = [
  // Main Base Level 1
  {
    data: {
      name: "Copper Mine",
      id: BlockType.CopperMineResearch,
      description:
        "allows you to build Copper Mine building which produces Copper Ore.",
      resources: [],
    },
  },
  {
    data: {
      name: "Iron Mine 2",
      id: BlockType.IronMine2Research,
      description:
        "allows you to upgrade Iron Mine building to level 2 increasing production to 2",
      resources: [],
    },
  },
  // Main Base Level 3
  {
    data: {
      name: "Storage Unit",
      id: BlockType.StorageUnitResearch,
      description:
        "allows you to build Storage Unit building which increases your Iron and Copper storage by 1000 each",
      resources: [],
    },
  },
  {
    data: {
      name: "IronPlate Factory",
      id: BlockType.IronPlateFactoryResearch,
      description:
        "allows you to build IronPlate Factory building which produces Iron Plates from Iron Ore. Requires 1 connected Iron Mine to function",
      resources: [],
    },
  },
  // Main Base Level 4
  {
    data: {
      name: "Lithium Mine",
      id: BlockType.LithiumMineResearch,
      description:
        "allows you to build Lithium Mine building to level 2 increasing production to 2",
      resources: [],
    },
  },
  {
    data: {
      name: "Copper Mine 2",
      id: BlockType.CopperMine2Research,
      description:
        "allows you to upgrade Copper Mine building to level 2 increasing production to 2",
      resources: [],
    },
  },
  {
    data: {
      name: "Iron Mine 3",
      id: BlockType.IronMine3Research,
      description:
        "allows you to upgrade Iron Mine building to level 3 increasing production to 3",
      resources: [],
    },
  },
  {
    data: {
      name: "Storage Unit 2",
      id: BlockType.StorageUnit2Research,
      description:
        "allows you to upgrade Storage Unit building to level 2 increasing production to 3",
      resources: [],
    },
  },
  {
    data: {
      name: "Basic Battery Factory",
      id: BlockType.BasicBatteryFactoryResearch,
      description: "Builds Basic Power Sources with lithium and iron.",
      resources: [],
    },
  },
  {
    data: {
      name: "Kinetic Missile Factory",
      id: BlockType.KineticMissileFactoryResearch,
      description:
        "Builds kinetic missiles with basic power source and titanium.",
      resources: [],
    },
  },
  {
    data: {
      name: "Titanium",
      id: BlockType.Titanium,
      description:
        "A light but sturdy metal. Researching allows you to mine titanium ore and store titanium.",
      resources: [],
    },
  },
  {
    data: {
      name: "Projectile Launcher",
      id: BlockType.ProjectileLauncherResearch,
      description: "Launches projectiles at your enemies with limited range.",
      resources: [],
    },
  },
  {
    data: {
      name: "Hardened Drill",
      id: BlockType.HardenedDrillResearch,
      description: "Mines ores at a slightly faster rate.",
      resources: [],
    },
  },
  {
    data: {
      name: "Osmium",
      id: BlockType.Osmium,
      description:
        "A dense metal. Researching allows you to mine and store osmium.",
      resources: [],
    },
  },
  {
    data: {
      name: "Dense Metal Refinery",
      id: BlockType.DenseMetalRefineryResearch,
      description:
        "Refines osmium into Refined Osmium. Used for advanced machinery.",
      resources: [],
    },
  },
  {
    data: {
      name: "Advanced Battery Factory",
      id: BlockType.AdvancedBatteryFactoryResearch,
      description:
        "Builds advanced power sources with refined osmium and basic power source.",
      resources: [],
    },
  },
  {
    data: {
      name: "Tungsten",
      id: BlockType.Tungsten,
      description:
        "A metal with a high melting point. Researching allows you to mine and store tungsten.",
      resources: [],
    },
  },
  {
    data: {
      name: "High-Temp Foundry",
      id: BlockType.HighTempFoundryResearch,
      description:
        "Melts tungsten into tungsten rods. Used for even more advanced recipes.",
      resources: [],
    },
  },
  {
    data: {
      name: "Iridium",
      id: BlockType.Iridium,
      description:
        "A rare metal from the cosmos. Researching allows you to mine and store iridium.",
      resources: [],
    },
  },
  {
    data: {
      name: "Precision Machinery Factory",
      id: BlockType.PrecisionMachineryFactoryResearch,
      description:
        "Creates iridium crystals from iridium metal through an esoteric process.",
      resources: [],
    },
  },
  {
    data: {
      name: "Iridium Drillbit Factory",
      id: BlockType.IridiumDrillbitFactoryResearch,
      description: "Crafts iridium-tipped drillbits with iridium crystals.",
      resources: [],
    },
  },
  {
    data: {
      name: "Precision Pneumatic Drill",
      id: BlockType.PrecisionPneumaticDrillResearch,
      description:
        "An advanced drill with few mechanical parts. Mines quickly.",
      resources: [],
    },
  },
  {
    data: {
      name: "Penetrator Factory",
      id: BlockType.PenetratorFactoryResearch,
      description:
        "Builds penetrating warheads out of osmium and advanced power sources.",
      resources: [],
    },
  },
  {
    data: {
      name: "Penetrating Missile Factory",
      id: BlockType.PenetratingMissileFactoryResearch,
      description:
        "Builds penetrating missiles with penetrating warheads and kinetic missiles.",
      resources: [],
    },
  },
  {
    data: {
      name: "Missile Launch Complex",
      id: BlockType.MissileLaunchComplexResearch,
      description:
        "A launch complex with longer range than the projectile launcher.",
      resources: [],
    },
  },
  {
    data: {
      name: "High Energy Laser Factory",
      id: BlockType.HighEnergyLaserFactoryResearch,
      description:
        "Builds high-energy power sources with lasers. Used for high-energy machinery.",
      resources: [],
    },
  },
  {
    data: {
      name: "Thermobaric Warhead Factory",
      id: BlockType.ThermobaricWarheadFactoryResearch,
      description:
        "Builds thermobaric warheads with iridium drillbits and high-energy laser power sources.",
      resources: [],
    },
  },
  {
    data: {
      name: "Thermobaric Missile Factory",
      id: BlockType.ThermobaricMissileFactoryResearch,
      description:
        "Assembles thermobaric missiles with thermobaric warheads and penetrating missiles.",
      resources: [],
    },
  },
  {
    data: {
      name: "Kimberlite",
      id: BlockType.Kimberlite,
      description:
        "A precious and extremely hard ore. Researching allows you to mine and store kimberlite.",
      resources: [],
    },
  },
  {
    data: {
      name: "Kimberlite Catalyst Factory",
      id: BlockType.KimberliteCatalystFactoryResearch,
      description:
        "Refines raw kimberlite into usable material for advanced machinery.",
      resources: [],
    },
  },
];
