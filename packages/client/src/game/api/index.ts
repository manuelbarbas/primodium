import { Network } from "../../network/layer";
import _init from "../init";
import { createCameraApi } from "./camera";
import { createGameApi } from "./game";
import { createHooksApi } from "./hooks";
import { createInputApi } from "./input";
import { GameReady } from "src/network/components/clientComponents";
import { EntityID } from "@latticexyz/recs";
import engine from "engine";
import { Game } from "engine/types";

async function init(
  player: EntityID,
  network: Network,
  version: string = "v1"
) {
  const asciiArt = `
                                                                          
                                                                          
  ██████╗ ██████╗ ██╗███╗   ███╗ ██████╗ ██████╗ ██╗██╗   ██╗███╗   ███╗  
  ██╔══██╗██╔══██╗██║████╗ ████║██╔═══██╗██╔══██╗██║██║   ██║████╗ ████║  
  ██████╔╝██████╔╝██║██╔████╔██║██║   ██║██║  ██║██║██║   ██║██╔████╔██║  
  ██╔═══╝ ██╔══██╗██║██║╚██╔╝██║██║   ██║██║  ██║██║██║   ██║██║╚██╔╝██║  
  ██║     ██║  ██║██║██║ ╚═╝ ██║╚██████╔╝██████╔╝██║╚██████╔╝██║ ╚═╝ ██║  
  ╚═╝     ╚═╝  ╚═╝╚═╝╚═╝     ╚═╝ ╚═════╝ ╚═════╝ ╚═╝ ╚═════╝ ╚═╝     ╚═╝  
                                                                          
                                                                          `;

  console.log("%c" + asciiArt, "color: white; background-color: brown;");

  console.log(
    `%cPrimodium ${version}`,
    "color: white; background-color: black;",
    "https://twitter.com/primodiumgame"
  );

  await _init(player, network);

  //expose api to window for debugging
  if (import.meta.env.VITE_DEV === "true") {
    // @ts-ignore
    window.network = network;
  }

  GameReady.set({ value: true });
}

function api(instance: string | Game, sceneKey: string = "MAIN") {
  const _instance =
    typeof instance === "string" ? engine.getGame(instance) : instance;

  if (_instance === undefined) {
    console.warn("No instance found with key " + instance);
    return;
  }

  const scene = _instance.sceneManager.scenes.get(sceneKey);

  if (scene === undefined) {
    console.warn("No scene found with key " + sceneKey);
    return;
  }

  return {
    camera: createCameraApi(scene),
    game: createGameApi(_instance),
    hooks: createHooksApi(scene),
    input: createInputApi(scene),
  };
}

export const primodium = { api, init };
