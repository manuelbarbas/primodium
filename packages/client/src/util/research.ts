import { Entity } from "@latticexyz/recs";
import { EntityType } from "./constants";

export type ResearchTreeType = ResearchCategoryType[];

export type ResearchCategoryType = {
  category: string;
  data: ResearchItemType[];
};

export type ResearchItemType = {
  name: string;
  id: Entity;
  description?: string;
  levels: ResearchItemLevelType[];
};

export type ResearchItemLevelType = {
  id: Entity;
  subtitle?: string;
  description: string;
};

export const MiningResearchTree: ResearchItemType = {
  name: "Mining Vessel Capacity",
  id: EntityType.MiningResearch1,
  description: "Provides Mining Vessel Capacity, allowing you to build more Mining Vessels",

  levels: [
    {
      id: EntityType.MiningResearch1,
      subtitle: "Level 1",
      description: "Provides Mining Vessel Capacity, allowing you to build more Mining Vessels",
    },
    {
      id: EntityType.MiningResearch2,
      subtitle: "Level 2",
      description: "Provides Mining Vessel Capacity, allowing you to build more Mining Vessels",
    },
    {
      id: EntityType.MiningResearch3,
      subtitle: "Level 3",
      description: "Provides Mining Vessel Capacity, allowing you to build more Mining Vessels",
    },
    {
      id: EntityType.MiningResearch4,
      subtitle: "Level 4",
      description: "Provides Mining Vessel Capacity, allowing you to build more Mining Vessels",
    },
    {
      id: EntityType.MiningResearch5,
      subtitle: "Level 5",
      description: "Provides Mining Vessel Capacity, allowing you to build more Mining Vessels",
    },
  ],
};

export const AnvilDroneUpgradeTree: ResearchItemType = {
  name: "Anvil",
  id: EntityType.AnvilDroneUpgrade1,
  description: "Upgrades the Attack and Defence attributes of Anvil Drone units.",

  levels: [
    {
      id: EntityType.AnvilDroneUpgrade1,
      subtitle: "Level 1",
      description: "Upgrades the Attack and Defence attributes of Anvil Drone units.",
    },
    {
      id: EntityType.AnvilDroneUpgrade2,
      subtitle: "Level 2",
      description: "Upgrades the Attack and Defence attributes of Anvil Drone units.",
    },
    {
      id: EntityType.AnvilDroneUpgrade3,
      subtitle: "Level 3",
      description: "Upgrades the Attack and Defence attributes of Anvil Drone units.",
    },
    {
      id: EntityType.AnvilDroneUpgrade4,
      subtitle: "Level 4",
      description: "Upgrades the Attack and Defence attributes of Anvil Drone units.",
    },
    {
      id: EntityType.AnvilDroneUpgrade5,
      subtitle: "Level 5",
      description: "Upgrades the Attack and Defence attributes of Anvil Drone units.",
    },
  ],
};

export const HammerDroneUpgradeTree: ResearchItemType = {
  name: "Hammer",
  id: EntityType.HammerDroneUpgrade1,
  description: "Upgrades the Attack and Defence attributes of Hammer Drone units.",

  levels: [
    {
      id: EntityType.HammerDroneUpgrade1,
      subtitle: "Level 1",
      description: "Upgrades the Attack and Defence attributes of Hammer Drone units.",
    },
    {
      id: EntityType.HammerDroneUpgrade2,
      subtitle: "Level 2",
      description: "Upgrades the Attack and Defence attributes of Hammer Drone units.",
    },
    {
      id: EntityType.HammerDroneUpgrade3,
      subtitle: "Level 3",
      description: "Upgrades the Attack and Defence attributes of Hammer Drone units.",
    },
    {
      id: EntityType.HammerDroneUpgrade4,
      subtitle: "Level 4",
      description: "Upgrades the Attack and Defence attributes of Hammer Drone units.",
    },
    {
      id: EntityType.HammerDroneUpgrade5,
      subtitle: "Level 5",
      description: "Upgrades the Attack and Defence attributes of Hammer Drone units.",
    },
  ],
};

export const AegisDroneUpgradeTree: ResearchItemType = {
  name: "Aegis",
  id: EntityType.AegisDroneUpgrade1,
  description: "Upgrades the Attack and Defence attributes of Aegis Drone units.",

  levels: [
    {
      id: EntityType.AegisDroneUpgrade1,
      subtitle: "Level 1",
      description: "Upgrades the Attack and Defence attributes of Aegis Drone units.",
    },
    {
      id: EntityType.AegisDroneUpgrade2,
      subtitle: "Level 2",
      description: "Upgrades the Attack and Defence attributes of Aegis Drone units.",
    },
    {
      id: EntityType.AegisDroneUpgrade3,
      subtitle: "Level 3",
      description: "Upgrades the Attack and Defence attributes of Aegis Drone units.",
    },
    {
      id: EntityType.AegisDroneUpgrade4,
      subtitle: "Level 4",
      description: "Upgrades the Attack and Defence attributes of Aegis Drone units.",
    },
    {
      id: EntityType.AegisDroneUpgrade5,
      subtitle: "Level 5",
      description: "Upgrades the Attack and Defence attributes of Aegis Drone units.",
    },
  ],
};

export const StingerDroneUpgradeTree: ResearchItemType = {
  name: "Stinger",
  id: EntityType.StingerDroneUpgrade1,
  description: "Upgrades the Attack and Defence attributes of Stinger Drone units.",

  levels: [
    {
      id: EntityType.StingerDroneUpgrade1,
      subtitle: "Level 1",
      description: "Upgrades the Attack and Defence attributes of Stinger Drone units.",
    },
    {
      id: EntityType.StingerDroneUpgrade2,
      subtitle: "Level 2",
      description: "Upgrades the Attack and Defence attributes of Stinger Drone units.",
    },
    {
      id: EntityType.StingerDroneUpgrade3,
      subtitle: "Level 3",
      description: "Upgrades the Attack and Defence attributes of Stinger Drone units.",
    },
    {
      id: EntityType.StingerDroneUpgrade4,
      subtitle: "Level 4",
      description: "Upgrades the Attack and Defence attributes of Stinger Drone units.",
    },
    {
      id: EntityType.StingerDroneUpgrade5,
      subtitle: "Level 5",
      description: "Upgrades the Attack and Defence attributes of Stinger Drone units.",
    },
  ],
};

export const MiningVesselUpgradeTree: ResearchItemType = {
  name: "Mining Vessel",
  id: EntityType.MiningVesselUpgrade1,
  description: "Increases the Mining Vessel's Mining Power by 1. ",

  levels: [
    {
      id: EntityType.MiningVesselUpgrade1,
      subtitle: "Level 1",
      description: "Increases the Mining Vessel's Mining Power by 1. ",
    },
    {
      id: EntityType.MiningVesselUpgrade2,
      subtitle: "Level 2",
      description: "Increases the Mining Vessel's Mining Power by 1. ",
    },
    {
      id: EntityType.MiningVesselUpgrade3,
      subtitle: "Level 3",
      description: "Increases the Mining Vessel's Mining Power by 1. ",
    },
    {
      id: EntityType.MiningVesselUpgrade4,
      subtitle: "Level 4",
      description: "Increases the Mining Vessel's Mining Power by 1. ",
    },
    {
      id: EntityType.MiningVesselUpgrade5,
      subtitle: "Level 5",
      description: "Increases the Mining Vessel's Mining Power by 1. ",
    },
  ],
};

export const MinutemanMarineUpgradeTree: ResearchItemType = {
  name: "Minuteman",
  id: EntityType.MinutemanMarineUpgrade1,
  description: "Increases the Minuteman Marine's stats. ",
  levels: [
    {
      id: EntityType.MinutemanMarineUpgrade1,
      subtitle: "Level 1",
      description: "Upgrades the Attack and Defence attributes of Minuteman Marines.",
    },
    {
      id: EntityType.MinutemanMarineUpgrade2,
      subtitle: "Level 2",
      description: "Upgrades the Attack and Defence attributes of Minuteman Marines.",
    },
    {
      id: EntityType.MinutemanMarineUpgrade3,
      subtitle: "Level 3",
      description: "Upgrades the Attack and Defence attributes of Minuteman Marines.",
    },
    {
      id: EntityType.MinutemanMarineUpgrade4,
      subtitle: "Level 4",
      description: "Upgrades the Attack and Defence attributes of Minuteman Marines.",
    },
    {
      id: EntityType.MinutemanMarineUpgrade5,
      subtitle: "Level 5",
      description: "Upgrades the Attack and Defence attributes of Minuteman Marines.",
    },
  ],
};

export const TridentMarineUpgradeTree: ResearchItemType = {
  name: "Trident",
  id: EntityType.TridentMarineUpgrade1,
  description: "Increases the Trident Marine's stats. ",
  levels: [
    {
      id: EntityType.TridentMarineUpgrade1,
      subtitle: "Level 1",
      description: "Upgrades the Attack and Defence attributes of Trident Marines.",
    },
    {
      id: EntityType.TridentMarineUpgrade2,
      subtitle: "Level 2",
      description: "Upgrades the Attack and Defence attributes of Trident Marines.",
    },
    {
      id: EntityType.TridentMarineUpgrade3,
      subtitle: "Level 3",
      description: "Upgrades the Attack and Defence attributes of Trident Marines.",
    },
    {
      id: EntityType.TridentMarineUpgrade4,
      subtitle: "Level 4",
      description: "Upgrades the Attack and Defence attributes of Trident Marines.",
    },
    {
      id: EntityType.TridentMarineUpgrade5,
      subtitle: "Level 5",
      description: "Upgrades the Attack and Defence attributes of Trident Marines.",
    },
  ],
};

// Research resource data should be read from getRecipe() in ../util/resource.ts

export const ResearchTree: ResearchTreeType = [
  {
    category: "Advanced Research",
    data: [MiningResearchTree],
  },
  {
    category: "Unit Upgrade Research",
    data: [
      MinutemanMarineUpgradeTree,
      TridentMarineUpgradeTree,
      AnvilDroneUpgradeTree,
      HammerDroneUpgradeTree,
      AegisDroneUpgradeTree,
      StingerDroneUpgradeTree,
      MiningVesselUpgradeTree,
    ],
  },
];

// duplicate above but for ExpansionResearch, up to level 7
export const ExpansionResearchTree: ResearchItemType = {
  name: "Expand Range",
  id: EntityType.ExpansionResearch1,
  description: "Unlocks expansion research — allows you to start expanding your base.",

  levels: [
    {
      id: EntityType.ExpansionResearch1,
      subtitle: "Level 1",
      description: "Unlocks expansion research — allows you to start expanding your base.",
    },
    {
      id: EntityType.ExpansionResearch2,
      subtitle: "Level 2",
      description: "Unlocks expansion research — allows you to start expanding your base.",
    },
    {
      id: EntityType.ExpansionResearch3,
      subtitle: "Level 3",
      description: "Unlocks expansion research — allows you to start expanding your base.",
    },
    {
      id: EntityType.ExpansionResearch4,
      subtitle: "Level 4",
      description: "Unlocks expansion research — allows you to start expanding your base.",
    },
    {
      id: EntityType.ExpansionResearch5,
      subtitle: "Level 5",
      description: "Unlocks expansion research — allows you to start expanding your base.",
    },
    {
      id: EntityType.ExpansionResearch6,
      subtitle: "Level 6",
      description: "Unlocks expansion research — allows you to start expanding your base.",
    },
    {
      id: EntityType.ExpansionResearch7,
      subtitle: "Level 7",
      description: "Unlocks expansion research — allows you to start expanding your base.",
    },
  ],
};
