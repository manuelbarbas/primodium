import { EntityID } from "@latticexyz/recs";
import { BlockType } from "./constants";
import { RequiredResearchComponent } from "src/network/components/chainComponents";

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
  const requiredResearch = RequiredResearchComponent.get(buildingId)?.value;

  if (!requiredResearch) return null;
  return requiredResearch.toString() as EntityID;
}

// Research resource data should be read from getRecipe() in ../util/resource.ts

export const ResearchTree: ResearchTreeType = [
  {
    category: "Basic Research",
    data: [
      {
        name: "Iron Mine",
        id: BlockType.IronMine2Research,
        description:
          "Unlocks iron mine — allows you to start producing iron ore.",
        levels: [
          {
            id: BlockType.IronMine2Research,
            subtitle: "Level 2",
            description: "Unlocks iron mine level 2, mines ores faster.",
          },
          {
            id: BlockType.IronMine3Research,
            subtitle: "Level 3",
            description: "Unlocks iron mine level 3, mines ores faster.",
          },
        ],
      },
      {
        name: "Copper Mine",
        id: BlockType.CopperMineResearch,
        description:
          "Unlocks copper mine — allows you to start producing copper ore.",
        levels: [
          {
            id: BlockType.CopperMineResearch,
            subtitle: "Level 1",
            description:
              "Unlocks copper mine — allows you to start producing copper ore.",
          },
          {
            id: BlockType.CopperMine2Research,
            subtitle: "Level 2",
            description: "Unlocks copper mine level 2, mines ores faster.",
          },
          {
            id: BlockType.CopperMine3Research,
            subtitle: "Level 3",
            description: "Unlocks copper mine level 3, mines ores faster.",
          },
        ],
      },
      {
        name: "Lithium Mine",
        id: BlockType.LithiumMineResearch,
        description:
          "Unlocks lithium mine — allows you to start producing lithium ore.",
        levels: [
          {
            id: BlockType.LithiumMineResearch,
            subtitle: "Level 1",
            description:
              "Unlocks lithium mine — allows you to start producing lithium ore.",
          },
          {
            id: BlockType.LithiumMine2Research,
            subtitle: "Level 2",
            description: "Unlocks lithium mine level 2, mines ores faster.",
          },
        ],
      },
      {
        name: "Storage Unit",
        id: BlockType.StorageUnitResearch,
        description:
          "Expands your storage limit. Does not need a connection to the main base.",
        levels: [
          {
            id: BlockType.StorageUnitResearch,
            subtitle: "Level 1",
            description:
              "Expands your storage limit. Does not need a connection to the main base.",
          },
          {
            id: BlockType.StorageUnit2Research,
            subtitle: "Level 2",
            description:
              "Expands your storage limit even more. Allows storage expansion for more advanced material.",
          },
          {
            id: BlockType.StorageUnit3Research,
            subtitle: "Level 3",
            description:
              "Expands your storage limit even more. Allows storage expansion for more advanced material.",
          },
        ],
      },
      {
        name: "Iron Plate Factory",
        id: BlockType.IronPlateFactoryResearch,
        description:
          "Produces iron plates automatically after being connected to an iron mine source.",
        levels: [
          {
            id: BlockType.IronPlateFactoryResearch,
            subtitle: "Level 1",
            description:
              "Produces iron plates automatically after being connected to an iron mine source.",
          },
          {
            id: BlockType.IronPlateFactory2Research,
            subtitle: "Level 2",
            description:
              "Produces iron plates faster. Requires a level 2 iron mine connected to it to function.",
          },
        ],
      },
    ],
  },
  {
    category: "Advanced Research",
    data: [
      {
        name: "Alloy Factory",
        id: BlockType.AlloyFactoryResearch,
        description:
          "Produces alloy automatically after being connected to an iron mine and a copper mine source. Requires electricity generated from solar panels to function.",
        levels: [
          {
            id: BlockType.AlloyFactoryResearch,
            subtitle: "Level 1",
            description:
              "Produces alloy automatically after being connected to an iron mine and a copper mine source. Requires electricity generated from solar panels to function.",
          },
        ],
      },
      {
        name: "Photovoltaic Cell Factory",
        id: BlockType.PhotovoltaicCellResearch,
        description:
          "Produces photovoltaic cells automatically after being connected to a lithium mine and a copper mine source.",
        levels: [
          {
            id: BlockType.PhotovoltaicCellResearch,
            subtitle: "Level 1",
            description:
              "Produces photovoltaic cells automatically after being connected to a lithium mine and a copper mine source.",
          },
        ],
      },

      {
        name: "Solar Panel",
        id: BlockType.SolarPanelResearch,
        description:
          "Unlocks solar panels. Solar panels create electricity, which is used in advanced buildings.",
        levels: [
          {
            id: BlockType.SolarPanelResearch,
            subtitle: "Level 1",
            description:
              "Unlocks solar panels. Solar panels create electricity, which is used in advanced buildings.",
          },
        ],
      },
    ],
  },
];
