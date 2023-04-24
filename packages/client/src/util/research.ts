import { BlockType } from "./constants";
import { ResourceCostData } from "./resource";

// Research Technology Tree
export type TechnologyTreeNode = {
  id: string;
  data: ResourceCostData;
  position: {
    x: number;
    y: number;
  };
};

export const technologyTree = [
  {
    id: "1",
    type: "techTree",
    data: {
      name: "Main Base",
      id: BlockType.MainBaseResearch,
      resources: [],
    },
    position: { x: 150, y: 50 },
  },
  {
    id: "2",
    type: "techTree",
    data: {
      name: "Iron",
      id: BlockType.IronResearch,
      resources: [],
    },
    position: { x: 250, y: 275 },
  },

  {
    id: "3",
    type: "techTree",
    data: {
      name: "Basic Miner",
      id: BlockType.BasicMiner,
      resources: [],
    },
    position: { x: 50, y: 275 },
  },
  {
    id: "4",
    type: "techTree",
    data: {
      name: "Conveyor",
      id: BlockType.Conveyer,
      resources: [],
    },
    position: { x: -150, y: 275 },
  },
  {
    id: "5",
    type: "techTree",
    data: {
      name: "Node",
      id: BlockType.Node,
      resources: [],
    },
    position: { x: 450, y: 275 },
  },
  {
    id: "6",
    type: "techTree",
    data: {
      name: "Copper",
      id: BlockType.Node,
      resources: [{ id: BlockType.Iron, amount: 200 }],
    },
    position: { x: 150, y: 500 },
  },
  {
    id: "7",
    type: "techTree",
    data: {
      name: "Plating Factory",
      id: BlockType.PlatingFactory,
      resources: [
        { id: BlockType.Iron, amount: 200 },
        { id: BlockType.Copper, amount: 200 },
      ],
    },
    position: { x: 150, y: 725 },
  },
  {
    id: "8",
    type: "techTree",
    data: {
      name: "Lithium",
      id: BlockType.LithiumResearch,
      resources: [
        { id: BlockType.IronPlateCrafted, amount: 20 },
        { id: BlockType.Copper, amount: 100 },
      ],
    },
    position: { x: 150, y: 950 },
  },
  {
    id: "9",
    type: "techTree",
    data: {
      name: "Basic Battery Factory",
      id: BlockType.BasicBatteryFactoryResearch,
      resources: [
        { id: BlockType.IronPlateCrafted, amount: 50 },
        { id: BlockType.Lithium, amount: 100 },
      ],
    },
    position: { x: 150, y: 1175 },
  },
  {
    id: "10",
    type: "techTree",
    data: {
      name: "Kinetic Missile Factory",
      id: BlockType.KineticMissileFactoryResearch,
      resources: [
        { id: BlockType.BasicPowerSourceCrafted, amount: 50 },
        { id: BlockType.Iron, amount: 100 },
      ],
    },
    position: { x: 250, y: 1400 },
  },
  {
    id: "11",
    type: "techTree",
    data: {
      name: "Titanium",
      id: BlockType.TitaniumResearch,
      resources: [
        { id: BlockType.Iron, amount: 100 },
        { id: BlockType.Lithium, amount: 100 },
      ],
    },
    position: { x: 50, y: 1400 },
  },
  {
    id: "12",
    type: "techTree",
    data: {
      name: "ProjectileLauncher",
      id: BlockType.ProjectileLauncherResearch,
      resources: [
        { id: BlockType.Iron, amount: 100 },
        { id: BlockType.Titanium, amount: 100 },
      ],
    },
    position: { x: 150, y: 1625 },
  },
  {
    id: "13",
    type: "techTree",
    data: {
      name: "HardenedDrill",
      id: BlockType.HardenedDrillResearch,
      resources: [
        { id: BlockType.Iron, amount: 100 },
        { id: BlockType.Titanium, amount: 100 },
      ],
    },
    position: { x: 350, y: 1625 },
  },
  {
    id: "14",
    type: "techTree",
    data: {
      name: "Osmium",
      id: BlockType.OsmiumResearch,
      resources: [{ id: BlockType.Titanium, amount: 300 }],
    },
    position: { x: 350, y: 1850 },
  },
  {
    id: "15",
    type: "techTree",
    data: {
      name: "Dense Metal Refinery",
      id: BlockType.DenseMetalRefineryResearch,
      resources: [
        { id: BlockType.Osmium, amount: 100 },
        { id: BlockType.Titanium, amount: 300 },
        { id: BlockType.BasicPowerSourceCrafted, amount: 100 },
      ],
    },
    position: { x: 350, y: 2075 },
  },
  {
    id: "16",
    type: "techTree",
    data: {
      name: "Advanced Battery Factory",
      id: BlockType.AdvancedBatteryFactoryResearch,
      resources: [
        { id: BlockType.Osmium, amount: 200 },
        { id: BlockType.IronPlateCrafted, amount: 100 },
        { id: BlockType.Titanium, amount: 400 },
      ],
    },
    position: { x: 350, y: 2300 },
  },
  {
    id: "17",
    type: "techTree",
    data: {
      name: "Tungsten",
      id: BlockType.TungstenResearch,
      resources: [
        { id: BlockType.RefinedOsmiumCrafted, amount: 100 },
        { id: BlockType.Titanium, amount: 200 },
      ],
    },
    position: { x: 250, y: 2525 },
  },
  {
    id: "18",
    type: "techTree",
    data: {
      name: "High-Temp Foundry",
      id: BlockType.HighTempFoundryResearch,
      resources: [
        { id: BlockType.Tungsten, amount: 200 },
        { id: BlockType.Osmium, amount: 100 },
        { id: BlockType.AdvancedPowerSourceCrafted, amount: 50 },
      ],
    },
    position: { x: 450, y: 2525 },
  },
  {
    id: "19",
    type: "techTree",
    data: {
      name: "Iridium",
      id: BlockType.IridiumResearch,
      resources: [
        { id: BlockType.TungstenRodsCrafted, amount: 100 },
        { id: BlockType.Osmium, amount: 100 },
      ],
    },
    position: { x: 450, y: 2750 },
  },
  {
    id: "20",
    type: "techTree",
    data: {
      name: "Precision Machinery Factory",
      id: BlockType.PrecisionMachineryFactoryResearch,
      resources: [
        { id: BlockType.Iridium, amount: 200 },
        { id: BlockType.TungstenRodsCrafted, amount: 100 },
      ],
    },
    position: { x: 450, y: 2975 },
  },
  {
    id: "21",
    type: "techTree",
    data: {
      name: "Iridium Drillbit Factory",
      id: BlockType.IridiumDrillbitFactoryResearch,
      resources: [
        { id: BlockType.IridiumCrystalCrafted, amount: 100 },
        { id: BlockType.LaserPowerSourceCrafted, amount: 20 },
      ],
    },
    position: { x: 550, y: 3200 },
  },
  {
    id: "22",
    type: "techTree",
    data: {
      name: "PrecisionPneumaticDrill",
      id: BlockType.PrecisionPneumaticDrillResearch,
      resources: [
        { id: BlockType.TungstenRodsCrafted, amount: 200 },
        { id: BlockType.IridiumDrillbitCrafted, amount: 50 },
      ],
    },
    position: { x: 350, y: 3200 },
  },
  {
    id: "23",
    type: "techTree",
    data: {
      name: "Penetrator Factory",
      id: BlockType.PenetratorFactoryResearch,
      resources: [
        { id: BlockType.Osmium, amount: 500 },
        { id: BlockType.AdvancedPowerSourceCrafted, amount: 50 },
      ],
    },
    position: { x: 350, y: 3425 },
  },
  {
    id: "24",
    type: "techTree",
    data: {
      name: "Penetrating Missile Factory",
      id: BlockType.PenetratingMissileFactoryResearch,
      resources: [
        { id: BlockType.RefinedOsmiumCrafted, amount: 100 },
        { id: BlockType.AdvancedPowerSourceCrafted, amount: 50 },
      ],
    },
    position: { x: 250, y: 2750 },
  },
  {
    id: "25",
    type: "techTree",
    data: {
      name: "Missile Launch Complex",
      id: BlockType.MissileLaunchComplexResearch,
      resources: [
        { id: BlockType.TungstenRodsCrafted, amount: 50 },
        { id: BlockType.AdvancedPowerSourceCrafted, amount: 100 },
      ],
    },
    position: { x: 250, y: 2975 },
  },
  {
    id: "26",
    type: "techTree",
    data: {
      name: "High Energy Laser Factory",
      id: BlockType.HighEnergyLaserFactoryResearch,
      resources: [
        { id: BlockType.IridiumCrystalCrafted, amount: 200 },
        { id: BlockType.AdvancedPowerSourceCrafted, amount: 150 },
      ],
    },
    position: { x: 150, y: 3200 },
  },
  {
    id: "27",
    type: "techTree",
    data: {
      name: "Thermobaric Warhead Factory",
      id: BlockType.ThermobaricWarheadFactoryResearch,
      resources: [{ id: BlockType.IridiumCrystalCrafted, amount: 200 }],
    },
    position: { x: 150, y: 3425 },
  },
  {
    id: "28",
    type: "techTree",
    data: {
      name: "Thermobaric Missile Factory",
      id: BlockType.ThermobaricMissileFactoryResearch,
      resources: [
        { id: BlockType.IridiumCrystalCrafted, amount: 200 },
        { id: BlockType.TungstenRodsCrafted, amount: 100 },
      ],
    },
    position: { x: 150, y: 3650 },
  },
  {
    id: "29",
    type: "techTree",
    data: {
      name: "Kimberlite",
      id: BlockType.KimberliteResearch,
      resources: [
        { id: BlockType.IridiumCrystalCrafted, amount: 100 },
        { id: BlockType.Tungsten, amount: 100 },
      ],
    },
    position: { x: 150, y: 3875 },
  },
  {
    id: "30",
    type: "techTree",
    data: {
      name: "Kimberlite Catalyst Factory",
      id: BlockType.KimberliteCatalystFactoryResearch,
      resources: [
        { id: BlockType.IridiumCrystalCrafted, amount: 300 },
        { id: BlockType.LaserPowerSourceCrafted, amount: 20 },
      ],
    },
    position: { x: 150, y: 4100 },
  },
];

export const technologyTreeEdges = [
  { id: "e1-2", source: "1", target: "2" },
  { id: "e1-3", source: "1", target: "3" },
  { id: "e1-4", source: "1", target: "4" },
  { id: "e1-5", source: "1", target: "5" },
  { id: "e2-6", source: "2", target: "6" },
  { id: "e3-6", source: "3", target: "6" },
  { id: "e4-6", source: "4", target: "6" },
  { id: "e5-6", source: "5", target: "6" },
  { id: "e6-7", source: "6", target: "7" },
  { id: "e7-8", source: "7", target: "8" },
  { id: "e8-9", source: "8", target: "9" },
  { id: "e9-10", source: "9", target: "10" },
  { id: "e9-11", source: "9", target: "11" },
  { id: "e10-12", source: "10", target: "12" },
  { id: "e10-13", source: "10", target: "13" },
  { id: "e13-14", source: "13", target: "14" },
  { id: "e14-15", source: "14", target: "15" },
  { id: "e15-16", source: "15", target: "16" },
  { id: "e16-17", source: "16", target: "17" },
  { id: "e16-18", source: "16", target: "18" },
  { id: "e18-19", source: "18", target: "19" },
  { id: "e19-20", source: "19", target: "20" },
  { id: "e20-21", source: "20", target: "21" },
  { id: "e20-22", source: "20", target: "22" },
  { id: "e22-23", source: "22", target: "23" },
  { id: "e17-24", source: "17", target: "24" },
  { id: "e24-25", source: "24", target: "25" },
  { id: "e25-26", source: "25", target: "26" },
  { id: "e26-27", source: "26", target: "27" },
  { id: "e27-28", source: "27", target: "28" },
  { id: "e28-29", source: "28", target: "29" },
  { id: "e29-30", source: "29", target: "30" },
];
