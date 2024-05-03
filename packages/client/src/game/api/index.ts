import { setupHomeAsteroid } from "@/network/systems/setupHomeAsteroid";
import { Mode } from "@/util/constants";
import { namespaceWorld } from "@latticexyz/recs";
import engine from "engine";
import { Game } from "engine/types";
import { runSystems as runAsteroidSystems } from "src/game/scenes/asteroid/systems";
import { runSystems as runRootSystems } from "src/game/scenes/root/systems";
import { runSystems as runStarmapSystems } from "src/game/scenes/starmap/systems";
import { components } from "src/network/components";
import { setupBattleComponents } from "src/network/systems/setupBattleComponents";
import { setupBlockNumber } from "src/network/systems/setupBlockNumber";
import { setupBuildRock } from "src/network/systems/setupBuildRock";
import { setupBuildingReversePosition } from "src/network/systems/setupBuildingReversePosition";
import { setupDoubleCounter } from "src/network/systems/setupDoubleCounter";
import { setupHangar } from "src/network/systems/setupHangar";
import { setupLeaderboard } from "src/network/systems/setupLeaderboard";
import { setupMoveNotifications } from "src/network/systems/setupMoveNotifications";
import { setupInvitations } from "src/network/systems/setupPlayerInvites";
import { setupSwapNotifications } from "src/network/systems/setupSwapNotifications";
import { setupSync } from "src/network/systems/setupSync";
import { setupTime } from "src/network/systems/setupTime";
import { setupTrainingQueues } from "src/network/systems/setupTrainingQueues";
import { MUD } from "src/network/types";
import { world } from "src/network/world";
import _init from "../init";
import { SceneKeys, Scenes } from "../lib/constants/common";
import { createAudioApi } from "./audio";
import { createCameraApi } from "./camera";
import { createFxApi } from "./fx";
import { createGameApi } from "./game";
import { createHooksApi } from "./hooks";
import { createInputApi } from "./input";
import { createObjectApi } from "./objects";
import { createSceneApi } from "./scene";
import { createSpriteApi } from "./sprite";

export type Primodium = Awaited<ReturnType<typeof initPrimodium>>;
export type PrimodiumApi = ReturnType<Primodium["api"]>;

const apiMap = new Map<string, PrimodiumApi>();

//pull out api so we can use in non react contexts
export function api(sceneKey: SceneKeys = "ASTEROID", instance: string | Game = "MAIN") {
  // if (!apiMap.has(sceneKey + instance)) return apiMap.get(sceneKey + instance);

  const _instance = typeof instance === "string" ? engine.getGame().get(instance) : instance;

  if (_instance === undefined) {
    throw new Error("No primodium instance found with key " + instance);
  }

  const scene = _instance.sceneManager.scenes.get(sceneKey);

  if (scene === undefined) {
    throw new Error("No primodium scene found with key " + sceneKey);
  }
  const sceneApi = createSceneApi(_instance);
  const cameraApi = createCameraApi(scene);

  const apiObject = {
    camera: cameraApi,
    game: createGameApi(_instance),
    hooks: createHooksApi(scene),
    input: createInputApi(scene),
    scene: sceneApi,
    fx: createFxApi(scene),
    sprite: createSpriteApi(scene),
    audio: createAudioApi(scene),
    objects: createObjectApi(scene),
  };

  apiMap.set(sceneKey + instance, apiObject);

  return apiObject;
}
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

  function destroy() {
    //for each instance, call game destroy
    const game = engine.getGame();

    for (const [, instance] of game.entries()) {
      //dispose phaser
      instance.dispose();
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
    const uiScene = _instance.sceneManager.scenes.get(Scenes.UI);
    const rootScene = _instance.sceneManager.scenes.get(Scenes.Root);

    if (starmapScene === undefined || asteroidScene === undefined || uiScene === undefined || rootScene === undefined) {
      console.log(_instance.sceneManager.scenes);
      throw new Error("No primodium scene found");
    }

    components.SelectedMode.set({ value: Mode.Asteroid });
    setupBuildRock();
    setupSwapNotifications(mud);
    setupBattleComponents();
    setupMoveNotifications();
    setupBlockNumber(mud.network.latestBlockNumber$);
    setupDoubleCounter(mud);
    setupHangar();
    setupLeaderboard(mud);
    setupInvitations(mud);
    setupTime(mud);
    setupTrainingQueues();
    setupHomeAsteroid(mud);
    setupBuildingReversePosition();
    setupSync(mud);

    runAsteroidSystems(asteroidScene, mud);
    runStarmapSystems(starmapScene, mud);
    runRootSystems(rootScene, _instance);
  }

  function enableGlobalInput() {
    const game = engine.getGame();
    for (const [, instance] of game.entries()) {
      instance.sceneManager.scenes.forEach((scene) => {
        scene.input.enableInput();
      });
    }
  }

  function disableGlobalInput() {
    const game = engine.getGame();
    for (const [, instance] of game.entries()) {
      instance.sceneManager.scenes.forEach((scene) => {
        if (scene.config.key === Scenes.UI) return;
        scene.input.disableInput();
      });
    }
  }

  return { api, destroy, runSystems, enableGlobalInput, disableGlobalInput };
}
