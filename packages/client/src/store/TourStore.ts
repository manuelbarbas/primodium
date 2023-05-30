import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mountStoreDevtool } from "simple-zustand-devtools";

type TourState = {
  completedTutorial: boolean;
  currStep: number;
};

type TourActions = {
  setCompletedTutorial: (completed: boolean) => void;
  setCurrStep: (step: number) => void;
};

const defaults: TourState = {
  completedTutorial: false,
  currStep: 0,
};

export const useTourStore = create<TourState & TourActions>()(
  persist(
    (set) => ({
      ...defaults,
      setCompletedTutorial: (completed: boolean) =>
        set({ completedTutorial: completed }),
      setCurrStep: (step: number) => set({ currStep: step }),
    }),
    {
      name: "tour-storage",
      partialize: (state) => ({ completedTutorial: state.completedTutorial }),
    }
  )
);

//store dev tools
if (import.meta.env.VITE_DEV === "true") {
  mountStoreDevtool("TourStore", useTourStore);
}
