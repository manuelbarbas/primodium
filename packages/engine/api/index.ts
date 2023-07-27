import { useEngineStore } from "../store/EngineStore";
import { Game, GameConfig } from "../types";
import { createGame as _createGame } from "../lib/core/createGame";

export const initializeContext = (game: Game) => {
  const setGame = useEngineStore.getState().setGame;

  setGame(game);
};

export const getGame = () => {
  return useEngineStore.getState().game;
};

export const createGame = async (config: GameConfig) => {
  return await _createGame(config);
};

const api = {
  initializeContext,
  createGame,
  getGame,
};

//expose api to window for debugging
// @ts-ignore
if (import.meta.env.VITE_DEV === "true") window.engine = api;
