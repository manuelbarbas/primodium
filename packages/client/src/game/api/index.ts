import { Scenes } from "@game/constants";
import { namespaceWorld } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { Coord } from "@latticexyz/utils";
import engine from "engine";
import { Game } from "engine/types";
import { runSystems as runAsteroidSystems } from "src/game/lib/asteroid/systems";
import { runSystems as runStarmapSystems } from "src/game/lib/starmap/systems";
import { components } from "src/network/components";
import { setupAllianceLeaderboard } from "src/network/systems/setupAllianceLeaderboard";
import { setupBattleComponents } from "src/network/systems/setupBattleComponents";
import { setupBlockNumber } from "src/network/systems/setupBlockNumber";
import { setupDoubleCounter } from "src/network/systems/setupDoubleCounter";
import { setupHangar } from "src/network/systems/setupHangar";
import { setupLeaderboard } from "src/network/systems/setupLeaderboard";
import { setupMoveNotifications } from "src/network/systems/setupMoveNotifications";
import { setupInvitations } from "src/network/systems/setupPlayerInvites";
import { setupSync } from "src/network/systems/setupSync";
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
export type PrimodiumApi = ReturnType<Primodium["api"]>;

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
  // runSystems(mud);

  function destroy() {
    //for each instance, call game destroy
    const instances = engine.getGame();

    for (const [, instance] of instances.entries()) {
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

    if (starmapScene === undefined || asteroidScene === undefined) {
      console.log(_instance.sceneManager.scenes);
      throw new Error("No primodium scene found");
    }

    // reset stuff

    components.MapOpen.set({ value: false });
    setupAllianceLeaderboard(mud);
    setupBattleComponents();
    setupMoveNotifications();
    setupBlockNumber(mud.network.latestBlockNumber$);
    setupDoubleCounter(mud);
    setupHangar(mud);
    setupLeaderboard(mud);
    setupInvitations(mud);
    setupTime(mud);
    setupTrainingQueues();
    setupSync(mud);

    runAsteroidSystems(asteroidScene, mud);
    runStarmapSystems(starmapScene, mud);
  }

  function api(sceneKey = "MAIN", instance: string | Game = "MAIN") {
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
    const closeMap = async () => {
      if (!components.MapOpen.get()?.value) return;
      await sceneApi.transitionToScene(
        Scenes.Starmap,
        Scenes.Asteroid,
        0,
        (_, targetScene) => {
          targetScene.camera.phaserCamera.fadeOut(0, 0, 0, 0);
        },
        (_, targetScene) => {
          targetScene.phaserScene.add.tween({
            targets: targetScene.camera.phaserCamera,
            zoom: { from: 0.5, to: 1 },
            duration: 500,
            ease: "Cubic.easeInOut",
            onUpdate: () => {
              targetScene.camera.zoom$.next(targetScene.camera.phaserCamera.zoom);
              targetScene.camera.worldView$.next(targetScene.camera.phaserCamera.worldView);
            },
          });
          targetScene.camera.phaserCamera.fadeIn(500, 0, 0, 0);
        }
      );
      components.MapOpen.set({ value: false });
      components.SelectedRock.set({ value: components.ActiveRock.get()?.value ?? singletonEntity });
    };

    const openMap = async (position?: Coord) => {
      if (components.MapOpen.get()?.value) return;
      const activeRock = components.SelectedRock.get()?.value;
      const pos = position ?? components.Position.get(activeRock) ?? { x: 0, y: 0 };

      cameraApi.pan(pos, 0);

      await sceneApi.transitionToScene(
        Scenes.Asteroid,
        Scenes.Starmap,
        0,
        (_, targetScene) => {
          targetScene.camera.phaserCamera.fadeOut(0, 0, 0, 0);
        },
        (_, targetScene) => {
          targetScene.phaserScene.add.tween({
            targets: targetScene.camera.phaserCamera,
            zoom: { from: 2, to: 1 },
            duration: 500,
            ease: "Cubic.easeInOut",
            onUpdate: () => {
              targetScene.camera.zoom$.next(targetScene.camera.phaserCamera.zoom);
              targetScene.camera.worldView$.next(targetScene.camera.phaserCamera.worldView);
            },
          });
          targetScene.camera.phaserCamera.fadeIn(500, 0, 0, 0);
        }
      );
      components.MapOpen.set({ value: true });
      components.SelectedBuilding.remove();
    };
    return {
      camera: cameraApi,
      game: createGameApi(_instance),
      hooks: createHooksApi(scene),
      input: createInputApi(scene),
      scene: sceneApi,
      fx: createFxApi(scene),
      sprite: createSpriteApi(scene),
      audio: createAudioApi(scene),
      util: { openMap, closeMap },
    };
  }

  return { api, destroy, runSystems };
}
