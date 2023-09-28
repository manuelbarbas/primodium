import { EntityID } from "@latticexyz/recs";
import { BlockType } from "./constants";
import {
  HasResearched,
  Level,
  P_RequiredResearch,
} from "src/network/components/chainComponents";
import { hashAndTrimKeyEntity } from "./encode";
import { getRecipe } from "./resource";

export type ResearchTreeType = ResearchCategoryType[];

export type ResearchCategoryType = {
  category: string;
  data: ResearchItemType[];
};

export type ResearchItemType = {
  name: string;
  id: EntityID;
  description?: string;
  levels: ResearchItemLevelType[];
};

export type ResearchItemLevelType = {
  id: EntityID;
  subtitle?: string;
  description: string;
};

export function getBuildingResearchRequirement(
  buildingId: EntityID
): EntityID | null {
  const requiredResearch = P_RequiredResearch.get(buildingId)?.value;

  if (!requiredResearch) return null;
  return requiredResearch.toString() as EntityID;
}

export function getResearchInfo(research: ResearchItemType, player: EntityID) {
  const { name, levels } = research;

  const levelsResearched = levels.map(({ id }, index) => {
    if (research.id === ExpansionResearchTree.id) {
      const level = Level.get(player)?.value ?? 1;
      return level >= index + 1;
    }

    const entity = hashAndTrimKeyEntity(id, player);
    const isResearched = HasResearched.get(entity);
    return isResearched?.value ?? false;
  });

  const level =
    levelsResearched.filter(Boolean).length >= levels.length
      ? levels.length
      : levelsResearched.filter(Boolean).length;

  const isResearched = level === levels.length;

  const researchId = levels[isResearched ? level - 1 : level].id;

  const mainBaseLvlReq = Level.get(researchId)?.value ?? 1;

  const recipe = getRecipe(researchId);

  return {
    maxLevel: levels.length,
    level,
    name,
    id: researchId,
    mainBaseLvlReq,
    recipe,
  };
}

export const MiningResearchTree: ResearchItemType = {
  name: "Mining Vessel Capacity",
  id: BlockType.MiningResearch1,
  description:
    "Provides Mining Vessel Capacity, allowing you to build more Mining Vessels",

  levels: [
    {
      id: BlockType.MiningResearch1,
      subtitle: "Level 1",
      description:
        "Provides Mining Vessel Capacity, allowing you to build more Mining Vessels",
    },
    {
      id: BlockType.MiningResearch2,
      subtitle: "Level 2",
      description:
        "Provides Mining Vessel Capacity, allowing you to build more Mining Vessels",
    },
    {
      id: BlockType.MiningResearch3,
      subtitle: "Level 3",
      description:
        "Provides Mining Vessel Capacity, allowing you to build more Mining Vessels",
    },
    {
      id: BlockType.MiningResearch4,
      subtitle: "Level 4",
      description:
        "Provides Mining Vessel Capacity, allowing you to build more Mining Vessels",
    },
    {
      id: BlockType.MiningResearch5,
      subtitle: "Level 5",
      description:
        "Provides Mining Vessel Capacity, allowing you to build more Mining Vessels",
    },
  ],
};

export const AnvilDroneUpgradeTree: ResearchItemType = {
  name: "Anvil Drone",
  id: BlockType.AnvilDroneUpgrade1,
  description:
    "Upgrades the Attack and Defence attributes of Anvil Drone units.",

  levels: [
    {
      id: BlockType.AnvilDroneUpgrade1,
      subtitle: "Level 1",
      description:
        "Upgrades the Attack and Defence attributes of Anvil Drone units.",
    },
    {
      id: BlockType.AnvilDroneUpgrade2,
      subtitle: "Level 2",
      description:
        "Upgrades the Attack and Defence attributes of Anvil Drone units.",
    },
    {
      id: BlockType.AnvilDroneUpgrade3,
      subtitle: "Level 3",
      description:
        "Upgrades the Attack and Defence attributes of Anvil Drone units.",
    },
    {
      id: BlockType.AnvilDroneUpgrade4,
      subtitle: "Level 4",
      description:
        "Upgrades the Attack and Defence attributes of Anvil Drone units.",
    },
    {
      id: BlockType.AnvilDroneUpgrade5,
      subtitle: "Level 5",
      description:
        "Upgrades the Attack and Defence attributes of Anvil Drone units.",
    },
  ],
};

export const HammerDroneUpgradeTree: ResearchItemType = {
  name: "Hammer Drone",
  id: BlockType.HammerDroneUpgrade1,
  description:
    "Upgrades the Attack and Defence attributes of Hammer Drone units.",

  levels: [
    {
      id: BlockType.HammerDroneUpgrade1,
      subtitle: "Level 1",
      description:
        "Upgrades the Attack and Defence attributes of Hammer Drone units.",
    },
    {
      id: BlockType.HammerDroneUpgrade2,
      subtitle: "Level 2",
      description:
        "Upgrades the Attack and Defence attributes of Hammer Drone units.",
    },
    {
      id: BlockType.HammerDroneUpgrade3,
      subtitle: "Level 3",
      description:
        "Upgrades the Attack and Defence attributes of Hammer Drone units.",
    },
    {
      id: BlockType.HammerDroneUpgrade4,
      subtitle: "Level 4",
      description:
        "Upgrades the Attack and Defence attributes of Hammer Drone units.",
    },
    {
      id: BlockType.HammerDroneUpgrade5,
      subtitle: "Level 5",
      description:
        "Upgrades the Attack and Defence attributes of Hammer Drone units.",
    },
  ],
};

export const AegisDroneUpgradeTree: ResearchItemType = {
  name: "Aegis Drone",
  id: BlockType.AegisDroneUpgrade1,
  description:
    "Upgrades the Attack and Defence attributes of Aegis Drone units.",

  levels: [
    {
      id: BlockType.AegisDroneUpgrade1,
      subtitle: "Level 1",
      description:
        "Upgrades the Attack and Defence attributes of Aegis Drone units.",
    },
    {
      id: BlockType.AegisDroneUpgrade2,
      subtitle: "Level 2",
      description:
        "Upgrades the Attack and Defence attributes of Aegis Drone units.",
    },
    {
      id: BlockType.AegisDroneUpgrade3,
      subtitle: "Level 3",
      description:
        "Upgrades the Attack and Defence attributes of Aegis Drone units.",
    },
    {
      id: BlockType.AegisDroneUpgrade4,
      subtitle: "Level 4",
      description:
        "Upgrades the Attack and Defence attributes of Aegis Drone units.",
    },
    {
      id: BlockType.AegisDroneUpgrade5,
      subtitle: "Level 5",
      description:
        "Upgrades the Attack and Defence attributes of Aegis Drone units.",
    },
  ],
};

export const StingerDroneUpgradeTree: ResearchItemType = {
  name: "Stinger Drone",
  id: BlockType.StingerDroneUpgrade1,
  description:
    "Upgrades the Attack and Defence attributes of Stinger Drone units.",

  levels: [
    {
      id: BlockType.StingerDroneUpgrade1,
      subtitle: "Level 1",
      description:
        "Upgrades the Attack and Defence attributes of Stinger Drone units.",
    },
    {
      id: BlockType.StingerDroneUpgrade2,
      subtitle: "Level 2",
      description:
        "Upgrades the Attack and Defence attributes of Stinger Drone units.",
    },
    {
      id: BlockType.StingerDroneUpgrade3,
      subtitle: "Level 3",
      description:
        "Upgrades the Attack and Defence attributes of Stinger Drone units.",
    },
    {
      id: BlockType.StingerDroneUpgrade4,
      subtitle: "Level 4",
      description:
        "Upgrades the Attack and Defence attributes of Stinger Drone units.",
    },
    {
      id: BlockType.StingerDroneUpgrade5,
      subtitle: "Level 5",
      description:
        "Upgrades the Attack and Defence attributes of Stinger Drone units.",
    },
  ],
};

export const MiningVesselUpgradeTree: ResearchItemType = {
  name: "Mining Vessel",
  id: BlockType.MiningVesselUpgrade1,
  description: "Increases the Mining Vessel's Mining Power by 1. ",

  levels: [
    {
      id: BlockType.MiningVesselUpgrade1,
      subtitle: "Level 1",
      description: "Increases the Mining Vessel's Mining Power by 1. ",
    },
    {
      id: BlockType.MiningVesselUpgrade2,
      subtitle: "Level 2",
      description: "Increases the Mining Vessel's Mining Power by 1. ",
    },
    {
      id: BlockType.MiningVesselUpgrade3,
      subtitle: "Level 3",
      description: "Increases the Mining Vessel's Mining Power by 1. ",
    },
    {
      id: BlockType.MiningVesselUpgrade4,
      subtitle: "Level 4",
      description: "Increases the Mining Vessel's Mining Power by 1. ",
    },
    {
      id: BlockType.MiningVesselUpgrade5,
      subtitle: "Level 5",
      description: "Increases the Mining Vessel's Mining Power by 1. ",
    },
  ],
};

export const MinutemanMarineUpgradeTree: ResearchItemType = {
  name: "Minuteman Marine Upgrade",
  id: BlockType.MinutemanMarineUpgrade1,

  description: "Increases the Minuteman Marine's stats. ",

  levels: [
    {
      id: BlockType.MinutemanMarineUpgrade1,
      subtitle: "Level 1",
      description:
        "Upgrades the Attack and Defence attributes of Minuteman Marines.",
    },
    {
      id: BlockType.MinutemanMarineUpgrade2,
      subtitle: "Level 2",
      description:
        "Upgrades the Attack and Defence attributes of Minuteman Marines.",
    },
    {
      id: BlockType.MinutemanMarineUpgrade3,
      subtitle: "Level 3",
      description:
        "Upgrades the Attack and Defence attributes of Minuteman Marines.",
    },
    {
      id: BlockType.MinutemanMarineUpgrade4,
      subtitle: "Level 4",
      description:
        "Upgrades the Attack and Defence attributes of Minuteman Marines.",
    },
    {
      id: BlockType.MinutemanMarineUpgrade5,
      subtitle: "Level 5",
      description:
        "Upgrades the Attack and Defence attributes of Minuteman Marines.",
    },
  ],
};

export const TridentMarineUpgradeTree: ResearchItemType = {
  name: "Trident Marine Upgrade",
  id: BlockType.TridentMarineUpgrade1,
  description: "Increases the Trident Marine's stats. ",

  levels: [
    {
      id: BlockType.TridentMarineUpgrade1,
      subtitle: "Level 1",
      description:
        "Upgrades the Attack and Defence attributes of Trident Marines.",
    },
    {
      id: BlockType.TridentMarineUpgrade2,
      subtitle: "Level 2",
      description:
        "Upgrades the Attack and Defence attributes of Trident Marines.",
    },
    {
      id: BlockType.TridentMarineUpgrade3,
      subtitle: "Level 3",
      description:
        "Upgrades the Attack and Defence attributes of Trident Marines.",
    },
    {
      id: BlockType.TridentMarineUpgrade4,
      subtitle: "Level 4",
      description:
        "Upgrades the Attack and Defence attributes of Trident Marines.",
    },
    {
      id: BlockType.TridentMarineUpgrade5,
      subtitle: "Level 5",
      description:
        "Upgrades the Attack and Defence attributes of Trident Marines.",
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
  id: BlockType.ExpansionResearch1,
  description:
    "Unlocks expansion research — allows you to start expanding your base.",

  levels: [
    {
      id: BlockType.ExpansionResearch1,
      subtitle: "Level 1",
      description:
        "Unlocks expansion research — allows you to start expanding your base.",
    },
    {
      id: BlockType.ExpansionResearch2,
      subtitle: "Level 2",
      description:
        "Unlocks expansion research — allows you to start expanding your base.",
    },
    {
      id: BlockType.ExpansionResearch3,
      subtitle: "Level 3",
      description:
        "Unlocks expansion research — allows you to start expanding your base.",
    },
    {
      id: BlockType.ExpansionResearch4,
      subtitle: "Level 4",
      description:
        "Unlocks expansion research — allows you to start expanding your base.",
    },
    {
      id: BlockType.ExpansionResearch5,
      subtitle: "Level 5",
      description:
        "Unlocks expansion research — allows you to start expanding your base.",
    },
    {
      id: BlockType.ExpansionResearch6,
      subtitle: "Level 6",
      description:
        "Unlocks expansion research — allows you to start expanding your base.",
    },
    {
      id: BlockType.ExpansionResearch7,
      subtitle: "Level 7",
      description:
        "Unlocks expansion research — allows you to start expanding your base.",
    },
  ],
};
