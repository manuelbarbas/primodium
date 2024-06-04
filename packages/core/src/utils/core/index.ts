import { createAllianceUtils } from "@/utils/core/alliance";
import { Components } from "@/types";
import { createBuildingUtils } from "@/utils/core/building";
import { createAsteroidUtils } from "@/utils/core/asteroid";
import { createColonyShipUtils } from "@/utils/core/colonyShip";
import { createColorUtils } from "@/utils/core/entityToColor";
import { createBoundsUtils } from "@/utils/core/bounds";
import { createRecipeUtils } from "@/utils/core/recipe";
import { createResourceUtils } from "@/utils/core/resource";
import { createSendUtils } from "@/utils/core/send";
import { createShardNameUtils } from "@/utils/core/shardName";
import { createSwapUtils } from "@/utils/core/swap";
import { createTileUtils } from "@/utils/core/tile";
import { createUnitUtils } from "@/utils/core/unit";
import { createUpgradeUtils } from "@/utils/core/upgrade";
import { createObjectiveUtils } from "@/utils/core/objectives";
import { createLeaderboardUtils } from "@/utils/core/createLeaderboardUtils";

export const createUtils = (components: Components) => {
  return {
    ...createAllianceUtils(components),
    ...createAsteroidUtils(components),
    ...createBoundsUtils(components),
    ...createBuildingUtils(components),
    ...createColonyShipUtils(components),
    ...createColorUtils(components),
    ...createLeaderboardUtils(components),
    ...createObjectiveUtils(components),
    ...createRecipeUtils(components),
    ...createResourceUtils(components),
    ...createRecipeUtils(components),
    ...createSendUtils(components),
    ...createShardNameUtils(components),
    ...createSwapUtils(components),
    ...createTileUtils(components),
    ...createUnitUtils(components),
    ...createUpgradeUtils(components),
  };
};
