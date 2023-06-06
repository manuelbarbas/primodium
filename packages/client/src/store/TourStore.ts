import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mountStoreDevtool } from "simple-zustand-devtools";
import { Coord } from "@latticexyz/utils";
import { TourStep } from "../util/types";

type TourState = {
  completedTutorial: boolean;
  currentStep: TourStep | null;
  checkpoint: TourStep | null;
  prevCheckpoint: TourStep | null;
  spawn: Coord | null;
};

type TourActions = {
  setCompletedTutorial: (completed: boolean) => void;
  setSpawn: (spawn: Coord) => void;
  setCheckpoint: (checkpoint: TourStep | null) => void;
  setCurrentStep: (step: TourStep | null) => void;
};

const defaults: TourState = {
  completedTutorial: false,
  checkpoint: null,
  currentStep: null,
  prevCheckpoint: null,
  spawn: {
    x: Math.floor(Math.random() * 2000),
    y: Math.floor(Math.random() * 2000),
  },
};

export const useTourStore = create<TourState & TourActions>()(
  persist(
    (set, get) => ({
      ...defaults,
      setCompletedTutorial: (completed: boolean) =>
        set({ completedTutorial: completed }),
      setSpawn: (spawn: Coord) =>
        set({
          spawn,
        }),
      setCheckpoint: (checkpoint: TourStep | null) =>
        set({ prevCheckpoint: get().checkpoint, checkpoint }),
      setCurrentStep: (currentStep: TourStep | null) => set({ currentStep }),
    }),
    {
      name: "tour-storage",
      partialize: (state) => ({
        completedTutorial: state.completedTutorial,
        checkpoint: state.checkpoint,
        spawn: state.spawn,
      }),
    }
  )
);

//store dev tools
if (import.meta.env.VITE_DEV === "true") {
  mountStoreDevtool("TourStore", useTourStore);
}
