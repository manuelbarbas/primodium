import { EntityID, World, getComponentValue } from "@latticexyz/recs";
import { NetworkComponents } from "@latticexyz/std-client";

import { defineComponents } from "../network/components";
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

export const ResearchDefaultUnlocked = new Set<EntityID>([
  // debug
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
  return requiredResearch.value.toString() as EntityID;
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
          // {
          //   id: BlockType.LithiumMine3Research,
          //   subtitle: "Level 3",
          //   description:
          //     "Allows you to upgrade Copper Mine building to level 3",
          // },
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
          // {
          //   id: BlockType.IronPlateFactory3Research,
          //   subtitle: "Level 3",
          //   description:
          //     "Allows you to upgrade Copper Mine building to level 3",
          // },
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
          // {
          //   id: BlockType.AlloyFactory2Research,
          //   subtitle: "Level 2",
          //   description: "Allows you to upgrade Alloy Factory building.",
          // },
          // {
          //   id: BlockType.AlloyFactory3Research,
          //   subtitle: "Level 3",
          //   description: "Allows you to upgrade Alloy Factory building.",
          // },
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
          // {
          //   id: BlockType.LithiumCopperOxideFactory2Research,
          //   subtitle: "Level 2",
          //   description: "Allows you to upgrade LithiumCopperOxide Factory.",
          // },
          // {
          //   id: BlockType.LithiumCopperOxideFactory3Research,
          //   subtitle: "Level 3",
          //   description: "Allows you to upgrade LithiumCopperOxide Factory.",
          // },
        ],
      },
      // {
      //   name: "SpaceFuel Factory",
      //   id: BlockType.SpaceFuelFactoryResearch,
      //   description: "Allows you to build SpaceFuel Factory building.",
      //   levels: [
      //     {
      //       id: BlockType.SpaceFuelFactoryResearch,
      //       subtitle: "Level 1",
      //       description: "Allows you to build SpaceFuel Factory building.",
      //     },
      //     {
      //       id: BlockType.SpaceFuelFactory2Research,
      //       subtitle: "Level 2",
      //       description: "Allows you to upgrade SpaceFuel Factory building.",
      //     },
      //     {
      //       id: BlockType.SpaceFuelFactory3Research,
      //       subtitle: "Level 3",
      //       description: "Allows you to upgrade SpaceFuel Factory building.",
      //     },
      //   ],
      // },
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
          // {
          //   id: BlockType.SolarPanel2Research,
          //   subtitle: "Level 2",
          //   description: "Allows you to upgrade Solar Panel building.",
          // },
          // {
          //   id: BlockType.SolarPanel3Research,
          //   subtitle: "Level 3",
          //   description: "Allows you to upgrade Solar Panel building.",
          // },
        ],
      },
      // {
      //   name: "Housing Unit",
      //   id: BlockType.HousingUnitResearch,
      //   description: "Allows you to build Housing Unit building.",
      //   levels: [
      //     {
      //       id: BlockType.HousingUnitResearch,
      //       subtitle: "Level 1",
      //       description: "Allows you to build Housing Unit building.",
      //     },
      //     {
      //       id: BlockType.HousingUnit2Research,
      //       subtitle: "Level 2",
      //       description: "Allows you to upgrade Housing Unit building.",
      //     },
      //     {
      //       id: BlockType.HousingUnit3Research,
      //       subtitle: "Level 3",
      //       description: "Allows you to upgrade Housing Unit building.",
      //     },
      //   ],
      // },
    ],
  },
  // {
  //   data: {
  //     name: "Copper Mine 2",
  //     id: BlockType.CopperMine2Research,
  //     description:
  //       "allows you to upgrade Copper Mine building to level 2 increasing production",
  //     resources: [],
  //   },
  // },
  // {
  //   data: {
  //     name: "Copper Mine 3",
  //     id: BlockType.CopperMine3Research,
  //     description:
  //       "allows you to upgrade Copper Mine building to level 3 increasing production",
  //     resources: [],
  //   },
  // },
  // {
  //   data: {
  //     name: "Iron Mine 2",
  //     id: BlockType.IronMine2Research,
  //     description:
  //       "allows you to upgrade Iron Mine building to level 2 increasing production",
  //     resources: [],
  //   },
  // },
  // {
  //   data: {
  //     name: "Iron Mine 3",
  //     id: BlockType.IronMine3Research,
  //     description:
  //       "allows you to upgrade Iron Mine building to level 3 increasing production",
  //     resources: [],
  //   },
  // },
  // {
  //   data: {
  //     name: "Storage Unit",
  //     id: BlockType.StorageUnitResearch,
  //     description:
  //       "allows you to build Storage Unit building which increases your Iron and Copper storage by 1000 each",
  //     resources: [],
  //   },
  // },
  // {
  //   data: {
  //     name: "Storage Unit 2",
  //     id: BlockType.StorageUnit2Research,
  //     description:
  //       "allows you to upgrade Storage Unit building to level 2 increasing production",
  //     resources: [],
  //   },
  // },
  // {
  //   data: {
  //     name: "Storage Unit 3",
  //     id: BlockType.StorageUnit3Research,
  //     description:
  //       "allows you to upgrade Storage Unit building to level 2 increasing production",
  //     resources: [],
  //   },
  // },
  // {
  //   data: {
  //     name: "IronPlate Factory",
  //     id: BlockType.IronPlateFactoryResearch,
  //     description:
  //       "allows you to build IronPlate Factory building which produces Iron Plates from Iron Ore. Requires 1 connected Iron Mine to function",
  //     resources: [],
  //   },
  // },
  // {
  //   data: {
  //     name: "IronPlate Factory 2",
  //     id: BlockType.IronPlateFactory2Research,
  //     description:
  //       "allows you to upgrade IronPlate Factory building to level 2 increasing production",
  //     resources: [],
  //   },
  // },
  // {
  //   data: {
  //     name: "IronPlate Factory 3",
  //     id: BlockType.IronPlateFactory3Research,
  //     description:
  //       "allows you to upgrade IronPlate Factory building to level 3 increasing production",
  //     resources: [],
  //   },
  // },
  // {
  //   data: {
  //     name: "IronPlate Factory 4",
  //     id: BlockType.IronPlateFactory4Research,
  //     description:
  //       "allows you to upgrade IronPlate Factory building to level 4 increasing production",
  //     resources: [],
  //   },
  // },
  // {
  //   data: {
  //     name: "Lithium Mine",
  //     id: BlockType.LithiumMineResearch,
  //     description:
  //       "allows you to build Lithium Mine building to level 2 increasing production",
  //     resources: [],
  //   },
  // },
  // {
  //   data: {
  //     name: "Lithium Mine 2",
  //     id: BlockType.LithiumMine2Research,
  //     description:
  //       "allows you to upgrade Lithium Mine building to level 2 increasing production",
  //     resources: [],
  //   },
  // },
  // {
  //   data: {
  //     name: "Lithium Mine 3",
  //     id: BlockType.LithiumMine3Research,
  //     description:
  //       "allows you to upgrade Lithium Mine building to level 2 increasing production",
  //     resources: [],
  //   },
  // },
  // {
  //   data: {
  //     name: "Alloy Factory",
  //     id: BlockType.AlloyFactoryResearch,
  //     description:
  //       "allows you to build Alloy Factory building which produces Iron Plates from Iron Ore. Requires 1 connected Iron Mine to function",
  //     resources: [],
  //   },
  // },
  // {
  //   data: {
  //     name: "Alloy Factory 2",
  //     id: BlockType.AlloyFactory2Research,
  //     description:
  //       "allows you to upgrade Alloy Factory building to level 2 increasing production",
  //     resources: [],
  //   },
  // },
  // {
  //   data: {
  //     name: "Alloy Factory 3",
  //     id: BlockType.AlloyFactory3Research,
  //     description:
  //       "allows you to upgrade Alloy Factory building to level 3 increasing production",
  //     resources: [],
  //   },
  // },
  // {
  //   data: {
  //     name: "LithiumCopperOxide Factory",
  //     id: BlockType.LithiumCopperOxideFactoryResearch,
  //     description:
  //       "allows you to build LithiumCopperOxide Factory building which produces Iron Plates from Iron Ore. Requires 1 connected Iron Mine to function",
  //     resources: [],
  //   },
  // },
  // {
  //   data: {
  //     name: "LithiumCopperOxide Factory 2",
  //     id: BlockType.LithiumCopperOxideFactory2Research,
  //     description:
  //       "allows you to upgrade LithiumCopperOxide Factory building to level 2 increasing production",
  //     resources: [],
  //   },
  // },
  // {
  //   data: {
  //     name: "LithiumCopperOxide Factory 3",
  //     id: BlockType.LithiumCopperOxideFactory3Research,
  //     description:
  //       "allows you to upgrade LithiumCopperOxide Factory building to level 3 increasing production",
  //     resources: [],
  //   },
  // },
  // {
  //   data: {
  //     name: "SpaceFuel Factory",
  //     id: BlockType.SpaceFuelFactoryResearch,
  //     description:
  //       "allows you to build SpaceFuel Factory building which produces Iron Plates from Iron Ore. Requires 1 connected Iron Mine to function",
  //     resources: [],
  //   },
  // },
  // {
  //   data: {
  //     name: "SpaceFuel Factory 2",
  //     id: BlockType.SpaceFuelFactory2Research,
  //     description:
  //       "allows you to upgrade SpaceFuel Factory building to level 2 increasing production",
  //     resources: [],
  //   },
  // },
  // {
  //   data: {
  //     name: "SpaceFuel Factory 3",
  //     id: BlockType.SpaceFuelFactory3Research,
  //     description:
  //       "allows you to upgrade SpaceFuel Factory building to level 3 increasing production",
  //     resources: [],
  //   },
  // },
  // {
  //   data: {
  //     name: "Solar Panel",
  //     id: BlockType.SolarPanelResearch,
  //     description:
  //       "allows you to build Solar Panel building which increases your Iron and Copper storage by 1000 each",
  //     resources: [],
  //   },
  // },
  // {
  //   data: {
  //     name: "Solar Panel 2",
  //     id: BlockType.SolarPanel2Research,
  //     description:
  //       "allows you to upgrade Solar Panel building to level 2 increasing production",
  //     resources: [],
  //   },
  // },
  // {
  //   data: {
  //     name: "Solar Panel 3",
  //     id: BlockType.SolarPanel2Research,
  //     description:
  //       "allows you to upgrade Solar Panel building to level 2 increasing production",
  //     resources: [],
  //   },
  // },
  // {
  //   data: {
  //     name: "Housing Unit",
  //     id: BlockType.HousingUnitResearch,
  //     description:
  //       "allows you to build Housing Unit building which increases your Iron and Copper storage by 1000 each",
  //     resources: [],
  //   },
  // },
  // {
  //   data: {
  //     name: "Housing Unit 2",
  //     id: BlockType.HousingUnit2Research,
  //     description:
  //       "allows you to upgrade Housing Unit building to level 2 increasing production",
  //     resources: [],
  //   },
  // },
  // {
  //   data: {
  //     name: "Housing Unit 3",
  //     id: BlockType.HousingUnit2Research,
  //     description:
  //       "allows you to upgrade Housing Unit building to level 2 increasing production",
  //     resources: [],
  //   },
  // },
];
