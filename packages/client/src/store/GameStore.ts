import { create } from "zustand";
import { DisplayTile } from "../util/constants";
import { EntityID } from "@latticexyz/recs";
import { mountStoreDevtool } from "simple-zustand-devtools";

type GameState = {
  selectedTile: DisplayTile;
  hoveredTile: DisplayTile | null;
  pathTileSelection: { start: DisplayTile | null; end: DisplayTile | null };
  selectedBlock: EntityID | null;
  navigateToTile: boolean;
  showSelectedPathTiles: boolean;
};

type GameActions = {
  setSelectedTile: (tile: DisplayTile) => void;
  setConveyerTileSelection: (
    start: DisplayTile | null,
    end: DisplayTile | null
  ) => void;
  setNavigateToTile: (navigate: boolean) => void;
  toggleShowSelectedPathTiles: () => void;
  setSelectedBlock: (block: EntityID | null) => void;
  setHoveredTile: (tile: DisplayTile | null) => void;
};

const defaults: GameState = {
  selectedTile: { x: 0, y: 0 },
  hoveredTile: { x: 0, y: 0 },
  pathTileSelection: { start: null, end: null },
  selectedBlock: null,
  navigateToTile: false,
  showSelectedPathTiles: false,
};

export const useGameStore = create<GameState & GameActions>()((set) => ({
  ...defaults,
  setSelectedTile: (tile: DisplayTile) => set({ selectedTile: tile }),
  setConveyerTileSelection: (
    start: DisplayTile | null,
    end: DisplayTile | null
  ) => set({ pathTileSelection: { start, end } }),
  setNavigateToTile: (navigate: boolean) => set({ navigateToTile: navigate }),
  toggleShowSelectedPathTiles: () =>
    set((state) => ({ showSelectedPathTiles: !state.showSelectedPathTiles })),
  setSelectedBlock: (block: EntityID | null) => set({ selectedBlock: block }),
  setHoveredTile: (tile: DisplayTile | null) => set({ hoveredTile: tile }),
}));

//store dev tools
if (import.meta.env.VITE_DEV === "true") {
  mountStoreDevtool("GameStore", useGameStore);
}
