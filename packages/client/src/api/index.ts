import { useGameStore } from "../store/GameStore";
import { useConfigStore } from "../store/ConfigStore";
import { Game } from "../util/types";
import * as game from "./game";
import * as util from "./util";
import * as hooks from "./hooks";
import _createGame from "../game/createGame";
import { World } from "@latticexyz/recs";

/**
 * Initializes the game context with the provided game object. Internal function that is not intended to be called directly.
 * @param {Game} game The game object to set as the current game.
 */
export const initializeContext = (game: Game) => {
  const setGame = useGameStore.getState().setGame;

  setGame(game);
};

/**
 * Returns the current game object.
 * @returns {Game} The current game object.
 */
export const getGame = () => {
  return useGameStore.getState().game;
};

/**
 * Returns the current configuration object.
 * @returns {Object} The current configuration object.
 */
export const getConfig = () => {
  return useConfigStore.getState();
};

/**
 * Creates a new game with the provided world object.
 * @param {World} world The MUD world object to use for the new game.
 */
export const createGame = async (world: World) => {
  await _createGame(world);
};

/**
 * An object containing all of the functions and objects exposed by this module.
 * @namespace
 */
export const api = {
  initializeContext,
  createGame,
  getGame,
  getConfig,
  /**
   * An object containing game-related functions.
   * @namespace
   */
  game,
  /**
   * An object containing utility functions for working with the game.
   * @namespace
   */
  util,
  /**
   * An object containing hook functions for use in React components.
   * @namespace
   */
  hooks,
};

//expose api to window for debugging
// @ts-ignore
window.primodium = api;

export default api;
