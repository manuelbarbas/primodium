import { create } from "zustand";
import { EntityID } from "@latticexyz/recs";
import { mountStoreDevtool } from "simple-zustand-devtools";
import { Coord } from "@latticexyz/utils";

type UpdateFunction = <T>(ctx?: T) => void;

type GameState = {
  selectedTile: Coord;
  hoveredTile: Coord;
  crtEffect: boolean;
  selectedPathTiles: { start: Coord | null; end: Coord | null };
  selectedAttackTiles: { start: Coord | null; end: Coord | null };
  selectedBlock: EntityID | null;
  lockedAttackTarget: boolean;
  navigateToTile: boolean;
  showSelectedPathTiles: boolean;
  showSelectedAttackTiles: boolean;
  transactionLoading: boolean;
  showUI: boolean;
  updateFunctions: UpdateFunction[];
};

type GameActions = {
  setSelectedTile: (tile: Coord) => void;
  setConveyorTileSelection: (start: Coord | null, end: Coord | null) => void;
  setNavigateToTile: (navigate: boolean) => void;
  setShowSelectedPathTiles: (show: boolean) => void;
  setShowSelectedAttackTiles: (show: boolean) => void;
  setSelectedBlock: (block: EntityID | null) => void;
  setHoveredTile: (tile: Coord) => void;
  setLockedAttackTarget: (locked: boolean) => void;
  setTransactionLoading: (loading: boolean) => void;
  setStartSelectedPathTile: (tile: Coord | null) => void;
  setEndSelectedPathTile: (tile: Coord | null) => void;
  setStartSelectedAttackTile: (tile: Coord | null) => void;
  setEndSelectedAttackTile: (tile: Coord | null) => void;
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
  selectedPathTiles: { start: null, end: null },
  selectedAttackTiles: { start: null, end: null },
  selectedBlock: null,
  lockedAttackTarget: false,
  navigateToTile: false,
  showSelectedPathTiles: false,
  showSelectedAttackTiles: false,
  transactionLoading: false,
  showUI: true,
  updateFunctions: [],
  crtEffect: false,
};

export const useGameStore = create<GameState & GameActions>()((set) => ({
  ...defaults,
  setSelectedTile: (tile: Coord) => set({ selectedTile: tile }),
  setConveyorTileSelection: (start: Coord | null, end: Coord | null) =>
    set({ selectedPathTiles: { start, end } }),
  setNavigateToTile: (navigate: boolean) => set({ navigateToTile: navigate }),
  setShowSelectedPathTiles: (show: boolean) =>
    set({ showSelectedPathTiles: show }),
  setShowSelectedAttackTiles: (show: boolean) =>
    set({ showSelectedPathTiles: show }),
  setSelectedBlock: (block: EntityID | null) => set({ selectedBlock: block }),
  setHoveredTile: (tile: Coord) => set({ hoveredTile: tile }),
  setLockedAttackTarget: (locked: boolean) =>
    set({ lockedAttackTarget: locked }),
  setTransactionLoading: (loading: boolean) =>
    set({ transactionLoading: loading }),
  setStartSelectedPathTile: (tile: Coord | null) =>
    set((state) => ({
      selectedPathTiles: { ...state.selectedPathTiles, start: tile },
    })),
  setEndSelectedPathTile: (tile: Coord | null) =>
    set((state) => ({
      selectedPathTiles: { ...state.selectedPathTiles, end: tile },
    })),
  setStartSelectedAttackTile: (tile: Coord | null) =>
    set((state) => ({
      selectedAttackTiles: { ...state.selectedAttackTiles, start: tile },
    })),
  setEndSelectedAttackTile: (tile: Coord | null) =>
    set((state) => ({
      selectedAttackTiles: { ...state.selectedAttackTiles, end: tile },
    })),
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
