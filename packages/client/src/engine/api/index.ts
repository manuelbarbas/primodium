import { useEngineStore } from "../store/EngineStore";
import { Game } from "../types";
// import * as util from "./util";
// import * as camera from "./camera";
import { createGame as _createGame } from "../lib/core/createGame";
// import { createScene as _createScene } from "../lib/core/createScene";

/**
 * Initializes the game context with the provided game object. Internal function that is not intended to be called directly.
 * @param {Game} game The game object to set as the current game.
 */
const initializeContext = (game: Game) => {
  const setGame = useEngineStore.getState().setGame;

  setGame(game);
};

/**
 * Returns the current game object.
 * @returns {Game} The current game object.
 */
const getEngineStore = () => {
  return useEngineStore.getState().game;
};

/**
 * Creates a new phaser game.
 */
const createGame = async (config: Phaser.Types.Core.GameConfig) => {
  return await _createGame(config);
};

// const createScene = async (config: SceneConfig, autoStart: boolean = false) => {
//   return await _createScene(config, autoStart);
// };

/**
 * An object containing all of the functions and objects exposed by this module.
 * @namespace
 */
export const api = {
  initializeContext,
  createGame,
  getEngineStore,
  // createScene,
  /**
   * An object containing game-related functions.
   * @namespace
   */
  /**
   * An object containing utility functions for working with the game.
   * @namespace
   */
  // util,
  /**
   * An object containing functions for use on camera.
   * @namespace
   */
  // camera,
};

//expose api to window for debugging
// @ts-ignore
if (import.meta.env.VITE_DEV === "true") window.engine = api;
