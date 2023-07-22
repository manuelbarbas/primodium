import { useEngineStore } from "../store/EngineStore";
import { Game } from "../types";
import { createGame as _createGame } from "../lib/core/createGame";

const initializeContext = (game: Game) => {
  const setGame = useEngineStore.getState().setGame;

  setGame(game);
};

const getGame = () => {
  return useEngineStore.getState().game;
};

const createGame = async (config: Phaser.Types.Core.GameConfig) => {
  return await _createGame(config);
};

export const api = {
  initializeContext,
  createGame,
  getGame,
};

//expose api to window for debugging
// @ts-ignore
if (import.meta.env.VITE_DEV === "true") window.engine = api;
