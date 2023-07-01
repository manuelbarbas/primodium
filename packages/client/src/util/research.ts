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

export const ResearchTechnologyTree = [
  // {
  //   id: "1",
  //   type: "techTree",
  //   data: {
  //     name: "Main Base",
  //     id: BlockType.MainBaseResearch,
  //     description:
  //       "Unlocked by default. The heart of your operation, protect it at all costs.",
  //     resources: [],
  //   },
  //   position: { x: 150, y: 50 },
  // },
  {
    id: "2",
    type: "techTree",
    data: {
      name: "Iron",
      id: BlockType.Iron,
      description:
        "Unlocked by default. A common metal. Allows you to mine iron ore and store iron.",
      resources: [],
    },
    position: { x: 250, y: 275 },
  },

  // {
  //   id: "3",
  //   type: "techTree",
  //   data: {
  //     name: "Basic Miner",
  //     id: BlockType.BasicMinerResearch,
  //     description: "Unlocked by default. Mines ores slowly.",
  //     resources: [],
  //   },
  //   position: { x: 50, y: 275 },
  // },
  // {
  //   id: "4",
  //   type: "techTree",
  //   data: {
  //     name: "Conveyor",
  //     id: BlockType.ConveyorResearch,
  //     description:
  //       "Unlocked by default. Connects nodes together to move material.",
  //     resources: [],
  //   },
  //   position: { x: -150, y: 275 },
  // },
  // {
  //   id: "5",
  //   type: "techTree",
  //   data: {
  //     name: "Node",
  //     id: BlockType.NodeResearch,
  //     description:
  //       "Unlocked by default. Allows input/output of materials from miners and factories.",
  //     resources: [],
  //   },
  //   position: { x: 450, y: 275 },
  // },
  // Research Copper with 30 IronResource
  {
    id: "6",
    type: "techTree",
    data: {
      name: "Copper",
      id: BlockType.Copper,
      description:
        "A versatile and conductive metal. Researching allows you to mine copper ore and store copper.",
      resources: [{ id: BlockType.Iron, amount: 30 }],
    },
    position: { x: 150, y: 500 },
  },
  // Research PlatingFactory with 200 IronResource and 200 CopperResource
  {
    id: "7",
    type: "techTree",
    data: {
      name: "Plating Factory",
      id: BlockType.PlatingFactoryResearch,
      description: "Makes iron plates from iron.",
      resources: [
        { id: BlockType.Iron, amount: 200 },
        { id: BlockType.Copper, amount: 200 },
      ],
    },
    position: { x: 150, y: 725 },
  },
  // Research Lithium with 20 IronPlateCrafted and 100 CopperResource
  {
    id: "8",
    type: "techTree",
    data: {
      name: "Lithium",
      id: BlockType.Lithium,
      description:
        "A highly reactive metal. Researching allows you to mine lithium ore and store lithium.",
      resources: [
        { id: BlockType.IronPlateCrafted, amount: 20 },
        { id: BlockType.Copper, amount: 100 },
      ],
    },
    position: { x: 150, y: 950 },
  },
  // Research BasicBatteryFactory with 50 IronPlateCrafted and 100 LithiumResource
  {
    id: "9",
    type: "techTree",
    data: {
      name: "Basic Battery Factory",
      id: BlockType.BasicBatteryFactoryResearch,
      description: "Builds Basic Power Sources with lithium and iron.",
      resources: [
        { id: BlockType.IronPlateCrafted, amount: 50 },
        { id: BlockType.Lithium, amount: 100 },
      ],
    },
    position: { x: 150, y: 1175 },
  },
  // Research KineticMissileFactory with 50 BasicPowerSourceCrafted and 100 IronResource
  {
    id: "10",
    type: "techTree",
    data: {
      name: "Kinetic Missile Factory",
      id: BlockType.KineticMissileFactoryResearch,
      description:
        "Builds kinetic missiles with basic power source and titanium.",
      resources: [
        { id: BlockType.BasicPowerSourceCrafted, amount: 50 },
        { id: BlockType.Iron, amount: 100 },
      ],
    },
    position: { x: 250, y: 1400 },
  },
  // Research Titanium with 50 BasicPowerSourceCrafted
  {
    id: "11",
    type: "techTree",
    data: {
      name: "Titanium",
      id: BlockType.Titanium,
      description:
        "A light but sturdy metal. Researching allows you to mine titanium ore and store titanium.",
      resources: [{ id: BlockType.BasicPowerSourceCrafted, amount: 50 }],
    },
    position: { x: 50, y: 1400 },
  },
  // Research ProjectileLauncher with 50 BasicPowerSourceCrafted and 500 TitaniumResource
  {
    id: "12",
    type: "techTree",
    data: {
      name: "Projectile Launcher",
      id: BlockType.ProjectileLauncherResearch,
      description: "Launches projectiles at your enemies with limited range.",
      resources: [
        { id: BlockType.BasicPowerSourceCrafted, amount: 50 },
        { id: BlockType.Titanium, amount: 500 },
      ],
    },
    position: { x: 150, y: 1625 },
  },
  // Research HardenedDrill with 200 TitaniumResource, 500 IronPlateCrafted, and 50 BasicPowerSourceCrafted
  {
    id: "13",
    type: "techTree",
    data: {
      name: "Hardened Drill",
      id: BlockType.HardenedDrillResearch,
      description: "Mines ores at a slightly faster rate.",
      resources: [
        { id: BlockType.Titanium, amount: 200 },
        { id: BlockType.IronPlateCrafted, amount: 500 },
        { id: BlockType.BasicPowerSourceCrafted, amount: 50 },
      ],
    },
    position: { x: 350, y: 1625 },
  },
  // Research Osmium with 300 TitaniumResource
  {
    id: "14",
    type: "techTree",
    data: {
      name: "Osmium",
      id: BlockType.Osmium,
      description:
        "A dense metal. Researching allows you to mine and store osmium.",
      resources: [{ id: BlockType.Titanium, amount: 300 }],
    },
    position: { x: 350, y: 1850 },
  },
  // Research DenseMetalRefinery with 100 OsmiumResource, 300 TitaniumResource, and 100 BasicPowerSourceCrafted
  {
    id: "15",
    type: "techTree",
    data: {
      name: "Dense Metal Refinery",
      id: BlockType.DenseMetalRefineryResearch,
      description:
        "Refines osmium into Refined Osmium. Used for advanced machinery.",
      resources: [
        { id: BlockType.Osmium, amount: 100 },
        { id: BlockType.Titanium, amount: 300 },
        { id: BlockType.BasicPowerSourceCrafted, amount: 100 },
      ],
    },
    position: { x: 350, y: 2075 },
  },
  // Research AdvancedBatteryFactory with 200 OsmiumResource, 100 IronPlateCrafted, and 400 TitaniumResource
  {
    id: "16",
    type: "techTree",
    data: {
      name: "Advanced Battery Factory",
      id: BlockType.AdvancedBatteryFactoryResearch,
      description:
        "Builds advanced power sources with refined osmium and basic power source.",
      resources: [
        { id: BlockType.Osmium, amount: 200 },
        { id: BlockType.IronPlateCrafted, amount: 100 },
        { id: BlockType.Titanium, amount: 400 },
      ],
    },
    position: { x: 350, y: 2300 },
  },
  // Research Tungsten with 100 RefinedOsmiumCrafted 200 TitaniumResource
  {
    id: "17",
    type: "techTree",
    data: {
      name: "Tungsten",
      id: BlockType.Tungsten,
      description:
        "A metal with a high melting point. Researching allows you to mine and store tungsten.",
      resources: [
        { id: BlockType.RefinedOsmiumCrafted, amount: 100 },
        { id: BlockType.Titanium, amount: 200 },
      ],
    },
    position: { x: 250, y: 2525 },
  },
  // Research HighTempFoundry with 200 TungstenResource, 100 OsmiumResource, 50 AdvancedPowerSourceCrafted
  {
    id: "18",
    type: "techTree",
    data: {
      name: "High-Temp Foundry",
      id: BlockType.HighTempFoundryResearch,
      description:
        "Melts tungsten into tungsten rods. Used for even more advanced recipes.",
      resources: [
        { id: BlockType.Tungsten, amount: 200 },
        { id: BlockType.Osmium, amount: 100 },
        { id: BlockType.AdvancedPowerSourceCrafted, amount: 50 },
      ],
    },
    position: { x: 450, y: 2525 },
  },
  // Research Iridium with 100 TungstenRodCrafted 100 OsmiumResource
  {
    id: "19",
    type: "techTree",
    data: {
      name: "Iridium",
      id: BlockType.Iridium,
      description:
        "A rare metal from the cosmos. Researching allows you to mine and store iridium.",
      resources: [
        { id: BlockType.TungstenRodsCrafted, amount: 100 },
        { id: BlockType.Osmium, amount: 100 },
      ],
    },
    position: { x: 450, y: 2750 },
  },
  // Research PrecisionMachineryFactory with 200 IridiumResource and 100 TungstenRodsCrafted
  {
    id: "20",
    type: "techTree",
    data: {
      name: "Precision Machinery Factory",
      id: BlockType.PrecisionMachineryFactoryResearch,
      description:
        "Creates iridium crystals from iridium metal through an esoteric process.",
      resources: [
        { id: BlockType.Iridium, amount: 200 },
        { id: BlockType.TungstenRodsCrafted, amount: 100 },
      ],
    },
    position: { x: 450, y: 2975 },
  },
  // Research IridiumDrillbitFactory with 100 IridiumCrystalCrafted and 20 LaserPowerSourceCrafted
  {
    id: "21",
    type: "techTree",
    data: {
      name: "Iridium Drillbit Factory",
      id: BlockType.IridiumDrillbitFactoryResearch,
      description: "Crafts iridium-tipped drillbits with iridium crystals.",
      resources: [
        { id: BlockType.IridiumCrystalCrafted, amount: 100 },
        { id: BlockType.LaserPowerSourceCrafted, amount: 20 },
      ],
    },
    position: { x: 550, y: 3200 },
  },
  // Research PrecisionPneumaticDrill with 200 TungstenRodsCrafted and 50 IridiumDrillbitCrafted
  {
    id: "22",
    type: "techTree",
    data: {
      name: "Precision Pneumatic Drill",
      id: BlockType.PrecisionPneumaticDrillResearch,
      description:
        "An advanced drill with few mechanical parts. Mines quickly.",
      resources: [
        { id: BlockType.TungstenRodsCrafted, amount: 200 },
        { id: BlockType.IridiumDrillbitCrafted, amount: 50 },
      ],
    },
    position: { x: 350, y: 3200 },
  },
  // Research PenetratorFactory with 500 OsmiumResource and 50 AdvancedPowerSourceCrafted
  {
    id: "23",
    type: "techTree",
    data: {
      name: "Penetrator Factory",
      id: BlockType.PenetratorFactoryResearch,
      description:
        "Builds penetrating warheads out of osmium and advanced power sources.",
      resources: [
        { id: BlockType.Osmium, amount: 500 },
        { id: BlockType.AdvancedPowerSourceCrafted, amount: 50 },
      ],
    },
    position: { x: 350, y: 3425 },
  },
  // Research PenetratingMissileFactory with 100 RefinedOsmiumCrafted and 50 AdvancedPowerSourceCrafted
  {
    id: "24",
    type: "techTree",
    data: {
      name: "Penetrating Missile Factory",
      id: BlockType.PenetratingMissileFactoryResearch,
      description:
        "Builds penetrating missiles with penetrating warheads and kinetic missiles.",
      resources: [
        { id: BlockType.AdvancedPowerSourceCrafted, amount: 50 },
        { id: BlockType.RefinedOsmiumCrafted, amount: 100 },
      ],
    },
    position: { x: 250, y: 2750 },
  },
  // Research MissileLaunchComplex with 50 TungstenRodsCrafted and 100 AdvancedPowerSourceCrafted
  {
    id: "25",
    type: "techTree",
    data: {
      name: "Missile Launch Complex",
      id: BlockType.MissileLaunchComplexResearch,
      description:
        "A launch complex with longer range than the projectile launcher.",
      resources: [
        { id: BlockType.TungstenRodsCrafted, amount: 50 },
        { id: BlockType.AdvancedPowerSourceCrafted, amount: 100 },
      ],
    },
    position: { x: 250, y: 2975 },
  },
  // Research HighEnergyLaserFactory with 200 IridiumCrystalCrafted 150 AdvancedPowerSourceCrafted
  {
    id: "26",
    type: "techTree",
    data: {
      name: "High Energy Laser Factory",
      id: BlockType.HighEnergyLaserFactoryResearch,
      description:
        "Builds high-energy power sources with lasers. Used for high-energy machinery.",
      resources: [
        { id: BlockType.IridiumCrystalCrafted, amount: 200 },
        { id: BlockType.AdvancedPowerSourceCrafted, amount: 150 },
      ],
    },
    position: { x: 150, y: 3200 },
  },
  // Research ThermobaricWarheadFactory with 200 IridiumCrystalCrafted
  {
    id: "27",
    type: "techTree",
    data: {
      name: "Thermobaric Warhead Factory",
      id: BlockType.ThermobaricWarheadFactoryResearch,
      description:
        "Builds thermobaric warheads with iridium drillbits and high-energy laser power sources.",
      resources: [{ id: BlockType.IridiumCrystalCrafted, amount: 200 }],
    },
    position: { x: 150, y: 3425 },
  },
  // Resesarch ThermobaricMissileFactory with 200 IridiumCrystalCrafted and 100 TungstenRodsCrafted
  {
    id: "28",
    type: "techTree",
    data: {
      name: "Thermobaric Missile Factory",
      id: BlockType.ThermobaricMissileFactoryResearch,
      description:
        "Assembles thermobaric missiles with thermobaric warheads and penetrating missiles.",
      resources: [
        { id: BlockType.IridiumCrystalCrafted, amount: 200 },
        { id: BlockType.TungstenRodsCrafted, amount: 100 },
      ],
    },
    position: { x: 150, y: 3650 },
  },
  // Research Kimberlite with 100 IridiumCrystalCrafted 100 TungstenResource
  {
    id: "29",
    type: "techTree",
    data: {
      name: "Kimberlite",
      id: BlockType.Kimberlite,
      description:
        "A precious and extremely hard ore. Researching allows you to mine and store kimberlite.",
      resources: [
        { id: BlockType.IridiumCrystalCrafted, amount: 100 },
        { id: BlockType.Tungsten, amount: 100 },
      ],
    },
    position: { x: 150, y: 3875 },
  },
  // Research KimberliteCatalystFactory with 300 IridiumCrystalCrafted and 20 LaserPowerSourceCrafted
  {
    id: "30",
    type: "techTree",
    data: {
      name: "Kimberlite Catalyst Factory",
      id: BlockType.KimberliteCatalystFactoryResearch,
      description:
        "Refines raw kimberlite into usable material for advanced machinery.",
      resources: [
        { id: BlockType.IridiumCrystalCrafted, amount: 300 },
        { id: BlockType.LaserPowerSourceCrafted, amount: 20 },
      ],
    },
    position: { x: 150, y: 4100 },
  },
];
