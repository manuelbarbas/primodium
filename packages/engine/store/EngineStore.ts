import { mountStoreDevtool } from "simple-zustand-devtools";
import { create } from "zustand";

import { Game } from "../types";

type EngineState = {
  instances: Map<string, Game>;
};

type EngineActions = {
  setGame: (key: string, game: Game) => void;
};

const defaults: EngineState = {
  instances: new Map(),
};

export const useEngineStore = create<EngineState & EngineActions>()((set) => ({
  ...defaults,
  setGame: (key: string, game: Game) =>
    set((state) => {
      const instances = new Map<string, Game>(state.instances);
      instances.set(key, game);
      return { instances };
    }),
}));

// store dev tools
// @ts-expect-error import.meta.env is not defined in the browser
if (import.meta.env.VITE_DEV === "true") {
  mountStoreDevtool("EngineStore", useEngineStore);
}
