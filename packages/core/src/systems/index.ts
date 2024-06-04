import { SetupResult } from "@/lib/types";
import { setupBattleComponents } from "@/systems/setupBattleComponents";
import { setupBlockNumber } from "@/systems/setupBlockNumber";
import { setupBuildingReversePosition } from "@/systems/setupBuildingReversePosition";
import { setupBuildRock } from "@/systems/setupBuildRock";
import { setupDoubleCounter } from "@/systems/setupDoubleCounter";
import { setupHangar } from "@/systems/setupHangar";
import { setupHomeAsteroid } from "@/systems/setupHomeAsteroid";
import { setupLeaderboard } from "@/systems/setupLeaderboard";
import { setupObjectives } from "@/systems/setupObjectives";
import { setupSync } from "@/systems/setupSync";
import { setupTime } from "@/systems/setupTime";
import { setupTrainingQueues } from "@/systems/setupTrainingQueues";
import { setupWormholeResource } from "@/systems/setupWormholeResource";

export function runCoreSystems(setupResult: SetupResult) {
  setupResult.network.world.dispose("coreSystems");

  setupBattleComponents(setupResult);
  setupBlockNumber(setupResult);
  setupBuildingReversePosition(setupResult);
  setupBuildRock(setupResult);
  setupDoubleCounter(setupResult);
  setupHangar(setupResult);
  setupHomeAsteroid(setupResult);
  setupLeaderboard(setupResult);
  setupObjectives(setupResult);
  setupSync(setupResult);
  setupTime(setupResult);
  setupTrainingQueues(setupResult);
  setupWormholeResource(setupResult);
}
