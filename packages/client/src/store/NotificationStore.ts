import { create } from "zustand";
import { mountStoreDevtool } from "simple-zustand-devtools";

type NotificationState = {
  title: string;
  message: string;
  showUI: boolean;
};

type NotificationActions = {
  setNotification: (title: string, message: string) => void;
  setShowUI: (show: boolean) => void;
};

const defaults: NotificationState = {
  title: "",
  message: "",
  showUI: false,
};

export const useNotificationStore = create<
  NotificationState & NotificationActions
>()((set) => ({
  ...defaults,
  setNotification: (title: string, message: string) =>
    set({ title, message, showUI: true }),
  setShowUI: (show: boolean) => set({ showUI: show }),
}));

// store dev tools
if (import.meta.env.VITE_DEV === "true") {
  mountStoreDevtool("NotificationStore", useNotificationStore);
}
