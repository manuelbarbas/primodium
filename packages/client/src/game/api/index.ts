import { createNotificationApi } from "@/game/api/notification";
import { setupHomeAsteroid } from "@/network/systems/setupHomeAsteroid";
import { Mode } from "@/util/constants";
import { namespaceWorld } from "@latticexyz/recs";
import engine from "engine";
import { Scene } from "engine/types";
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
import { Scenes } from "../lib/constants/common";
import { createAudioApi } from "./audio";
import { createCameraApi } from "./camera";
import { createFxApi } from "./fx";
import { createHooksApi } from "./hooks";
import { createInputApi } from "./input";
import { createObjectApi } from "./objects";
import { createSpriteApi } from "./sprite";

export type Primodium = Awaited<ReturnType<typeof initPrimodium>>;
export type SceneApi = ReturnType<typeof api>;

//pull out api so we can use in non react contexts
export function api(scene: Scene) {
  const cameraApi = createCameraApi(scene);

  const apiObject = {
    ...scene,
    camera: cameraApi,
    hooks: createHooksApi(scene),
    input: createInputApi(scene),
    fx: createFxApi(scene),
    notify: createNotificationApi(scene),
    sprite: createSpriteApi(scene),
    audio: createAudioApi(scene),
    objects: createObjectApi(scene),
  };

  apiObject.audio.initializeAudioVolume();

  return apiObject;
}

export async function initPrimodium(version = "v1") {
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

  const api = await _init();

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

  function runSystems(mud: MUD) {
    console.info("[Primodium] Running systems");
    world.dispose("systems");

    components.SelectedMode.set({ value: Mode.Asteroid });
    setupBuildRock();
    setupSwapNotifications(mud);
    setupBattleComponents();
    setupMoveNotifications();
    setupBlockNumber(mud.network.latestBlockNumber$);
    setupDoubleCounter(mud);
    setupHangar();
    setupLeaderboard();
    setupInvitations(mud);
    setupTime(mud);
    setupTrainingQueues();
    setupHomeAsteroid(mud);
    setupBuildingReversePosition();
    setupSync(mud);

    api.ASTEROID.runSystems?.(mud);
    api.STARMAP.runSystems?.(mud);
    api.ROOT.runSystems?.(mud);
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
