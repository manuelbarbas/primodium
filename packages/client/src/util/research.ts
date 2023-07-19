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
      name: "Copper Mine 2",
      id: BlockType.CopperMine2Research,
      description:
        "allows you to upgrade Copper Mine building to level 2 increasing production",
      resources: [],
    },
  },
  {
    data: {
      name: "Copper Mine 3",
      id: BlockType.CopperMine3Research,
      description:
        "allows you to upgrade Copper Mine building to level 3 increasing production",
      resources: [],
    },
  },
  {
    data: {
      name: "Iron Mine 2",
      id: BlockType.IronMine2Research,
      description:
        "allows you to upgrade Iron Mine building to level 2 increasing production",
      resources: [],
    },
  },
  {
    data: {
      name: "Iron Mine 3",
      id: BlockType.IronMine3Research,
      description:
        "allows you to upgrade Iron Mine building to level 3 increasing production",
      resources: [],
    },
  },
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
      name: "Storage Unit 2",
      id: BlockType.StorageUnit2Research,
      description:
        "allows you to upgrade Storage Unit building to level 2 increasing production",
      resources: [],
    },
  },
  {
    data: {
      name: "Storage Unit 3",
      id: BlockType.StorageUnit3Research,
      description:
        "allows you to upgrade Storage Unit building to level 2 increasing production",
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
  {
    data: {
      name: "IronPlate Factory 2",
      id: BlockType.IronPlateFactory2Research,
      description:
        "allows you to upgrade IronPlate Factory building to level 2 increasing production",
      resources: [],
    },
  },
  {
    data: {
      name: "IronPlate Factory 3",
      id: BlockType.IronPlateFactory3Research,
      description:
        "allows you to upgrade IronPlate Factory building to level 3 increasing production",
      resources: [],
    },
  },
  {
    data: {
      name: "IronPlate Factory 4",
      id: BlockType.IronPlateFactory4Research,
      description:
        "allows you to upgrade IronPlate Factory building to level 4 increasing production",
      resources: [],
    },
  },
  {
    data: {
      name: "Lithium Mine",
      id: BlockType.LithiumMineResearch,
      description:
        "allows you to build Lithium Mine building to level 2 increasing production",
      resources: [],
    },
  },
  {
    data: {
      name: "Lithium Mine 2",
      id: BlockType.LithiumMine2Research,
      description:
        "allows you to upgrade Lithium Mine building to level 2 increasing production",
      resources: [],
    },
  },
  {
    data: {
      name: "Lithium Mine 3",
      id: BlockType.LithiumMine3Research,
      description:
        "allows you to upgrade Lithium Mine building to level 2 increasing production",
      resources: [],
    },
  },
  {
    data: {
      name: "Alloy Factory",
      id: BlockType.AlloyFactoryResearch,
      description:
        "allows you to build Alloy Factory building which produces Iron Plates from Iron Ore. Requires 1 connected Iron Mine to function",
      resources: [],
    },
  },
  {
    data: {
      name: "Alloy Factory 2",
      id: BlockType.AlloyFactory2Research,
      description:
        "allows you to upgrade Alloy Factory building to level 2 increasing production",
      resources: [],
    },
  },
  {
    data: {
      name: "Alloy Factory 3",
      id: BlockType.AlloyFactory3Research,
      description:
        "allows you to upgrade Alloy Factory building to level 3 increasing production",
      resources: [],
    },
  },
  {
    data: {
      name: "LithiumCopperOxide Factory",
      id: BlockType.LithiumCopperOxideFactoryResearch,
      description:
        "allows you to build LithiumCopperOxide Factory building which produces Iron Plates from Iron Ore. Requires 1 connected Iron Mine to function",
      resources: [],
    },
  },
  {
    data: {
      name: "LithiumCopperOxide Factory 2",
      id: BlockType.LithiumCopperOxideFactory2Research,
      description:
        "allows you to upgrade LithiumCopperOxide Factory building to level 2 increasing production",
      resources: [],
    },
  },
  {
    data: {
      name: "LithiumCopperOxide Factory 3",
      id: BlockType.LithiumCopperOxideFactory3Research,
      description:
        "allows you to upgrade LithiumCopperOxide Factory building to level 3 increasing production",
      resources: [],
    },
  },
  {
    data: {
      name: "SpaceFuel Factory",
      id: BlockType.SpaceFuelFactoryResearch,
      description:
        "allows you to build SpaceFuel Factory building which produces Iron Plates from Iron Ore. Requires 1 connected Iron Mine to function",
      resources: [],
    },
  },
  {
    data: {
      name: "SpaceFuel Factory 2",
      id: BlockType.SpaceFuelFactory2Research,
      description:
        "allows you to upgrade SpaceFuel Factory building to level 2 increasing production",
      resources: [],
    },
  },
  {
    data: {
      name: "SpaceFuel Factory 3",
      id: BlockType.SpaceFuelFactory3Research,
      description:
        "allows you to upgrade SpaceFuel Factory building to level 3 increasing production",
      resources: [],
    },
  },
  {
    data: {
      name: "Solar Panel",
      id: BlockType.SolarPanelResearch,
      description:
        "allows you to build Solar Panel building which increases your Iron and Copper storage by 1000 each",
      resources: [],
    },
  },
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
  {
    data: {
      name: "Housing Unit",
      id: BlockType.HousingUnitResearch,
      description:
        "allows you to build Housing Unit building which increases your Iron and Copper storage by 1000 each",
      resources: [],
    },
  },
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
