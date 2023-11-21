import { namespaceWorld } from "@latticexyz/recs";
import engine from "engine";
import { Game } from "engine/types";
import { GameReady } from "src/network/components/clientComponents";
import _init from "../init";
import { createCameraApi } from "./camera";
import { createGameApi } from "./game";
import { createHooksApi } from "./hooks";
import { createInputApi } from "./input";
import { createSceneApi } from "./scene";
import { createFxApi } from "./fx";
import { world } from "src/network/world";
import { createSpriteApi } from "./sprite";
import { SetupResult } from "src/network/types";
import { createAudioApi } from "./audio";

async function init(mud: SetupResult, version = "v1") {
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

  GameReady.set({ value: true });
}

function destroy() {
  //for each instance, call game destroy
  const instances = engine.getGame();

  for (const [_, instance] of instances.entries()) {
    //dispose phaser
    instance.phaserGame.destroy(true);
  }

  //dispose game logic
  world.dispose("game");
}

function api(sceneKey = "MAIN", instance: string | Game = "MAIN") {
  const _instance = typeof instance === "string" ? engine.getGame().get(instance) : instance;

  if (_instance === undefined) {
    throw Error("No instance found with key " + instance);
  }

  const scene = _instance.sceneManager.scenes.get(sceneKey);

  if (scene === undefined) {
    throw Error("No scene found with key " + sceneKey);
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

export const primodium = { api, init, destroy };
