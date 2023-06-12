import { create } from "zustand";
import { mountStoreDevtool } from "simple-zustand-devtools";

type DisplayMessageState = {
  title: string;
  message: string;
  showUI: boolean;
};

type DisplayMessageActions = {
  setTitle: (title: string) => void;
  setMessage: (message: string) => void;
  setShowUI: (show: boolean) => void;
};

const defaults: DisplayMessageState = {
  title: "",
  message: "",
  showUI: true,
};

export const useDisplayMessageStore = create<
  DisplayMessageState & DisplayMessageActions
>()((set) => ({
  ...defaults,
  setTitle: (title: string) => set({ title }),
  setMessage: (message: string) => set({ message }),
  setShowUI: (show: boolean) => set({ showUI: show }),
}));

// store dev tools
if (import.meta.env.VITE_DEV === "true") {
  mountStoreDevtool("DisplayMessageStore", useDisplayMessageStore);
}
