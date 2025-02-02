import { Tables } from "@/lib/types";
import { createAllianceUtils } from "@/utils/core/alliance";
import { createAsteroidUtils } from "@/utils/core/asteroid";
import { createBoundsUtils } from "@/utils/core/bounds";
import { createBuildingUtils } from "@/utils/core/building";
import { createColonyShipUtils } from "@/utils/core/colonyShip";
import { createDefenseUtils } from "@/utils/core/defense";
import { createDroidRegenUtils } from "@/utils/core/droidRegen";
import { createColorUtils } from "@/utils/core/entityToColor";
import { createLeaderboardUtils } from "@/utils/core/leaderboard";
import { createRecipeUtils } from "@/utils/core/recipe";
import { createResourceUtils } from "@/utils/core/resource";
import { createSendUtils } from "@/utils/core/send";
import { createShardNameUtils } from "@/utils/core/shardName";
import { createSwapUtils } from "@/utils/core/swap";
import { createTileUtils } from "@/utils/core/tile";
import { createTrainingQueueUtils } from "@/utils/core/trainingQueue";
import { createUnitUtils } from "@/utils/core/unit";
import { createUpgradeUtils } from "@/utils/core/upgrade";

export const createUtils = (tables: Tables) => {
  return {
    ...createAllianceUtils(tables),
    ...createAsteroidUtils(tables),
    ...createBoundsUtils(tables),
    ...createBuildingUtils(tables),
    ...createColonyShipUtils(tables),
    ...createColorUtils(tables),
    ...createDefenseUtils(tables),
    ...createDroidRegenUtils(tables),
    ...createLeaderboardUtils(tables),
    ...createRecipeUtils(tables),
    ...createResourceUtils(tables),
    ...createRecipeUtils(tables),
    ...createSendUtils(tables),
    ...createShardNameUtils(tables),
    ...createSwapUtils(tables),
    ...createTileUtils(tables),
    ...createTrainingQueueUtils(tables),
    ...createUnitUtils(tables),
    ...createUpgradeUtils(tables),
  };
};
