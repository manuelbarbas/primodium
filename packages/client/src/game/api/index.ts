import { Scenes } from "@game/constants";
import { namespaceWorld } from "@latticexyz/recs";
import engine from "engine";
import { Game } from "engine/types";
import { runSystems as runAsteroidSystems } from "src/game/lib/asteroid/systems";
import { runSystems as runStarmapSystems } from "src/game/lib/starmap/systems";
import { components } from "src/network/components";
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
import { world } from "src/network/world";
import _init from "../init";
import { createAudioApi } from "./audio";
import { createCameraApi } from "./camera";
import { createFxApi } from "./fx";
import { createGameApi } from "./game";
import { createHooksApi } from "./hooks";
import { createInputApi } from "./input";
import { createSceneApi } from "./scene";
import { createSpriteApi } from "./sprite";

export type Primodium = Awaited<ReturnType<typeof initPrimodium>>;

export async function initPrimodium(mud: MUD, version = "v1") {
  const asciiArt = `

  ██████╗ ██████╗ ██╗███╗   ███╗ ██████╗ ██████╗ ██╗██╗   ██╗███╗   ███╗
  ██╔══██╗██╔══██╗██║████╗ ████║██╔═══██╗██╔══██╗██║██║   ██║████╗ ████║
  ██████╔╝██████╔╝██║██╔████╔██║██║   ██║██║  ██║██║██║   ██║██╔████╔██║
  ██╔═══╝ ██╔══██╗██║██║╚██╔╝██║██║   ██║██║  ██║██║██║   ██║██║╚██╔╝██║
  ██║     ██║  ██║██║██║ ╚═╝ ██║╚██████╔╝██████╔╝██║╚██████╔╝██║ ╚═╝ ██║
  ╚═╝     ╚═╝  ╚═╝╚═╝╚═╝     ╚═╝ ╚═════╝ ╚═════╝ ╚═╝ ╚═════╝ ╚═╝     ╚═╝

                                                                          `;

  console.log("%c" + asciiArt, "color: white; background-color: brown;");

  console.log(`%cPrimodium ${version}`, "color: white; background-color: black;", "https://twitter.com/primodiumgame");

  namespaceWorld(world, "game");

  await _init();
  runSystems(mud);

  function destroy() {
    //for each instance, call game destroy
    const instances = engine.getGame();

    for (const [, instance] of instances.entries()) {
      //dispose phaser
      instance.phaserGame.destroy(true);
    }

    //dispose game logic
    world.dispose("game");
    world.dispose("systems");
  }

  function runSystems(mud: MUD, instance: string | Game = "MAIN") {
    console.info("[Primodium] Running systems");
    world.dispose("systems");

    const _instance = typeof instance === "string" ? engine.getGame().get(instance) : instance;
    if (_instance === undefined) {
      throw new Error("No primodium instance found with key " + instance);
    }
    const starmapScene = _instance.sceneManager.scenes.get(Scenes.Starmap);
    const asteroidScene = _instance.sceneManager.scenes.get(Scenes.Asteroid);

    if (starmapScene === undefined || asteroidScene === undefined) {
      console.log(_instance.sceneManager.scenes);
      throw new Error("No primodium scene found");
    }

    // reset stuff

    components.MapOpen.set({ value: false });
    setupAllianceLeaderboard(mud);
    setupArrival();
    setupBattleNotifications(mud);
    setupBlockNumber(mud.network.latestBlockNumber$);
    setupDoubleCounter(mud);
    setupHangar(mud);
    setupLeaderboard(mud);
    setupInvitations(mud);
    setupSend(mud);
    setupTime(mud);
    setupTrainingQueues(mud);

    runAsteroidSystems(asteroidScene, mud);
    runStarmapSystems(starmapScene);
  }

  function api(sceneKey = "MAIN", instance: string | Game = "MAIN") {
    const _instance = typeof instance === "string" ? engine.getGame().get(instance) : instance;

    if (_instance === undefined) {
      throw new Error("No primodium instance found with key " + instance);
    }

    const scene = _instance.sceneManager.scenes.get(sceneKey);

    if (scene === undefined) {
      console.log(_instance.sceneManager.scenes);
      throw new Error("No primodium scene found with key " + sceneKey);
    }

    return {
      camera: createCameraApi(scene),
      game: createGameApi(_instance),
      hooks: createHooksApi(scene),
      input: createInputApi(scene),
      scene: createSceneApi(_instance),
      fx: createFxApi(scene),
      sprite: createSpriteApi(scene),
      audio: createAudioApi(scene),
    };
  }

  return { api, destroy, runSystems };
}
