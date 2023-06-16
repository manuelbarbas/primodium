import { useGameStore } from "../store/GameStore";
import { useConfigStore } from "../store/ConfigStore";
import { Game } from "../util/types";
import * as game from "./game";
import * as util from "./util";
// import * as web3 from "./web3";

//sets the game context for the api
export const initialize = (game: Game) => {
  const setGame = useGameStore.getState().setGame;

  setGame(game);
};

export const getGame = () => {
  return useGameStore.getState().game;
};

export const getConfig = () => {
  return useConfigStore.getState();
};

export const api = {
  initialize,
  getGame,
  getConfig,
  game,
  util,
  // web3,
};

//expose api to window for debugging
// @ts-ignore
window.api = api;

export default api;
