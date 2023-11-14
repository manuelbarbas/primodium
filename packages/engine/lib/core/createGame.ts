import { initializeContext } from "../../api";
import { createSceneManager } from "./createSceneManager";
import { deferred } from "@latticexyz/utils";
import { GameConfig } from "../../types";
import createPhaserScene from "../util/createPhaserScene";
import { getSceneLoadPromise } from "../util/getSceneLoadPromise";

export const createGame = async (config: GameConfig) => {
  //Initialize Phaser Game
  const phaserGame = new Phaser.Game(config);

  // Wait for phaser to boot
  const [resolve, , promise] = deferred();
  phaserGame.events.on("ready", resolve);
  await promise;

  // Create scene for loading assets
  const phaserScene = createPhaserScene({
    key: "ROOT",
    preload: async (scene: Phaser.Scene) => {
      scene.load.pack(config.key, config.assetPackUrl, config.key);

      //add support for audio atlas
      const files = (await (await fetch(config.assetPackUrl)).json())[config.key].files;
      const audioAtlases = Object.values(files).filter((x: any) => x.type === "audioAtlas") as {
        key: string;
        jsonURL: string;
        audioURL: string;
      }[];

      if (audioAtlases.length) {
        for (const audioAtlas of audioAtlases) scene.load.audioSprite(audioAtlas.key, audioAtlas.jsonURL);
      }
    },
  });

  const loadScene = new phaserScene();

  phaserGame.scene.add("ROOT", loadScene, true);
  loadScene.input.enabled = false;

  await getSceneLoadPromise(loadScene);

  /* -------------------------- Create Scene Manager -------------------------- */

  const sceneManager = createSceneManager(phaserGame);

  /* -------------------------------------------------------------------------- */
  const context = {
    phaserGame,
    sceneManager,
    dispose: () => {
      console.log(config.key + ": Disposing");
      phaserGame.destroy(true);
      sceneManager.dispose();
    },
  };

  initializeContext(config.key, context);

  console.log(config.key + ": Created Instance");

  return context;
};
