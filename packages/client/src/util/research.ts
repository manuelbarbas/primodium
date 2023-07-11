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
];
