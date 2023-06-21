import { create } from "zustand";
import { mountStoreDevtool } from "simple-zustand-devtools";
import { Game } from "../../util/types";

type EngineState = {
  game: Game | null;
};

type EngineActions = {
  setGame: (game: Game) => void;
};

const defaults: EngineState = {
  game: null,
};

export const useEngineStore = create<EngineState & EngineActions>()((set) => ({
  ...defaults,
  setGame: (game: Game) => set({ game: game }),
}));

// store dev tools
if (import.meta.env.VITE_DEV === "true") {
  mountStoreDevtool("EngineStore", useEngineStore);
}
