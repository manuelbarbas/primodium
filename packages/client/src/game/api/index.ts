import { Scenes } from "@game/constants";
import { namespaceWorld } from "@latticexyz/recs";
import engine from "engine";
import { Game } from "engine/types";
import { runSystems as runAsteroidSystems } from "src/game/lib/asteroid/systems";
import { runSystems as runStarmapSystems } from "src/game/lib/starmap/systems";
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

  await _init(mud);

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

  function rerunSystems(mud: MUD, instance: string | Game = "MAIN") {
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

  return { api, destroy, rerunSystems };
}
