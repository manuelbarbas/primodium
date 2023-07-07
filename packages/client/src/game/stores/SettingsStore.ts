import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mountStoreDevtool } from "simple-zustand-devtools";
import Phaser from "phaser";

import { KeybindActions } from "@game/constants";

type Key =
  | keyof typeof Phaser.Input.Keyboard.KeyCodes
  | "POINTER_LEFT"
  | "POINTER_RIGHT";

type Keybinds = Partial<{
  [key in KeybindActions]: Set<Key>;
}>;

type SettingsState = {
  keybinds: Keybinds;
};

type SettingsActions = {};

const defaults: SettingsState = {
  keybinds: {
    [KeybindActions.Up]: new Set(["W", "UP"]),
    [KeybindActions.Down]: new Set(["S", "DOWN"]),
    [KeybindActions.Left]: new Set(["A", "LEFT"]),
    [KeybindActions.Right]: new Set(["D", "RIGHT"]),
    [KeybindActions.Center]: new Set(["C", "SPACE"]),
    [KeybindActions.Base]: new Set(["B"]),
    [KeybindActions.ZoomIn]: new Set(["X", "PLUS"]),
    [KeybindActions.ZoomOut]: new Set(["Z", "MINUS"]),
    [KeybindActions.Modifier]: new Set(["SHIFT"]),
  },
};

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (_) => ({
      ...defaults,
    }),
    {
      name: "settings-storage",
      // handle parsing of set objects since storing raw sets is not possible due to stringify behavior
      storage: {
        getItem: (key) => {
          const str = localStorage.getItem(key);
          const result: SettingsState["keybinds"] = {};
          const keybinds = JSON.parse(str!).state.keybinds as Partial<{
            [key in KeybindActions]: Key[];
          }>;

          for (const _action in keybinds) {
            let action = parseInt(_action) as KeybindActions;
            const array = keybinds[action];
            const set = new Set(array);
            result[action] = set;
          }

          return {
            state: {
              ...JSON.parse(str!).state,
              keybinds: result,
            },
          };
        },
        setItem: (key, value) => {
          const result: Partial<{
            [key in KeybindActions]: Key[];
          }> = {};
          const keybinds = value.state.keybinds as Keybinds;

          for (const _action in keybinds) {
            let action = parseInt(_action) as KeybindActions;
            const set = keybinds[action];

            if (!set) continue;

            const array = Array.from(set) as Key[];
            result[action] = array;
          }

          const str = JSON.stringify({
            state: {
              ...value.state,
              keybinds: result,
            },
          });

          localStorage.setItem(key, str);
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
      version: 0,
    }
  )
);

//store dev tools
if (import.meta.env.VITE_DEV === "true") {
  mountStoreDevtool("SettingsStore", useSettingsStore);
}
