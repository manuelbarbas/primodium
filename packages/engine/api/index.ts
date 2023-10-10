import { useEngineStore } from "../store/EngineStore";
import { Game, GameConfig } from "../types";
import { createGame as _createGame } from "../lib/core/createGame";

export const initializeContext = (key: string, game: Game) => {
  const setGame = useEngineStore.getState().setGame;

  setGame(key, game);
};

export const getGame = () => {
  return useEngineStore.getState().instances;
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
