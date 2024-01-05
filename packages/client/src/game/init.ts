import engine from "engine";
import { setupAllianceLeaderboard } from "src/network/systems/setupAllianceLeaderboard";
import { setupArrival } from "src/network/systems/setupArrival";
import { setupBattleNotifications } from "src/network/systems/setupBattleNotifications";
import { setupBlockNumber } from "src/network/systems/setupBlockNumber";
import { setupDoubleCounter } from "src/network/systems/setupDoubleCounter";
import { setupHangar } from "src/network/systems/setupHangar";
import { setupLeaderboard } from "src/network/systems/setupLeaderboard";
import { setupInvitations } from "src/network/systems/setupPlayerInvites";
import { setupSend } from "src/network/systems/setupSend";
import { setupTime } from "src/network/systems/setupTime";
import { setupTrainingQueues } from "src/network/systems/setupTrainingQueues";
import { MUD } from "src/network/types";
import gameConfig from "./config/game";
import { Scenes } from "./constants";
import { initAsteroidScene } from "./lib/asteroid/init";
import { setupAudioEffects } from "./lib/common/setup/setupAudioEffects";
import { initStarmapScene } from "./lib/starmap/init";

async function init(mud: MUD) {
  const game = await engine.createGame(gameConfig);

  await initAsteroidScene(game, mud);
  await initStarmapScene(game);

  setupBlockNumber(mud.network.latestBlockNumber$);
  setupLeaderboard(mud);
  setupAllianceLeaderboard(mud);
  setupTrainingQueues(mud);
  setupHangar(mud);
  setupSend(mud);
  setupArrival();
  setupInvitations(mud);
  setupBattleNotifications(mud);
  setupTime(mud);
  setupDoubleCounter(mud);

  setupAudioEffects(game.sceneManager.scenes.get(Scenes.Asteroid)!);
}

export default init;
