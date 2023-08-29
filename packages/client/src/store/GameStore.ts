import { create } from "zustand";
import { EntityID } from "@latticexyz/recs";
import { mountStoreDevtool } from "simple-zustand-devtools";
import { Coord } from "@latticexyz/utils";

type UpdateFunction = <T>(ctx?: T) => void;

type GameState = {
  selectedTile: Coord;
  hoveredTile: Coord;
  crtEffect: boolean;
  selectedBlock: EntityID | null;
  navigateToTile: boolean;
  transactionLoading: boolean;
  showUI: boolean;
  updateFunctions: UpdateFunction[];
};

type GameActions = {
  setSelectedTile: (tile: Coord) => void;
  setNavigateToTile: (navigate: boolean) => void;
  setSelectedBlock: (block: EntityID | null) => void;
  setHoveredTile: (tile: Coord) => void;
  setTransactionLoading: (loading: boolean) => void;
  setGameStateToDefault: () => void;
  setShowUI: (show: boolean) => void;
  addUpdateFunction: (updateFunction: UpdateFunction) => void;
  removeUpdateFunction: (updateFunction: UpdateFunction) => void;
  toggleShowUI: () => void;
  setCrtEffect: (crtEffect: boolean) => void;
};

const defaults: GameState = {
  selectedTile: { x: 0, y: 0 },
  hoveredTile: { x: 0, y: 0 },
  selectedBlock: null,
  navigateToTile: false,
  transactionLoading: false,
  showUI: true,
  updateFunctions: [],
  crtEffect: false,
};

export const useGameStore = create<GameState & GameActions>()((set) => ({
  ...defaults,
  setSelectedTile: (tile: Coord) => set({ selectedTile: tile }),
  setNavigateToTile: (navigate: boolean) => set({ navigateToTile: navigate }),
  setSelectedBlock: (block: EntityID | null) => set({ selectedBlock: block }),
  setHoveredTile: (tile: Coord) => set({ hoveredTile: tile }),
  setTransactionLoading: (loading: boolean) =>
    set({ transactionLoading: loading }),
  setGameStateToDefault: () => set({ ...defaults }),
  setShowUI: (show: boolean) => set({ showUI: show }),
  addUpdateFunction: (updateFunction: UpdateFunction) =>
    set((state) => ({
      updateFunctions: [...state.updateFunctions, updateFunction],
    })),
  removeUpdateFunction: (updateFunction: UpdateFunction) =>
    set((state) => ({
      updateFunctions: state.updateFunctions.filter(
        (fn) => fn !== updateFunction
      ),
    })),
  toggleShowUI: () => set((state) => ({ showUI: !state.showUI })),
  setCrtEffect: (crtEffect: boolean) => set({ crtEffect }),
}));

// store dev tools
if (import.meta.env.VITE_DEV === "true") {
  mountStoreDevtool("GameStore", useGameStore);
}
