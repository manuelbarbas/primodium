import { create } from "zustand";
import { persist } from "zustand/middleware";
import { merge } from "lodash";
import { mountStoreDevtool } from "simple-zustand-devtools";
import Phaser from "phaser";
import { transferListeners, removeListeners } from "../api/input";

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

type SettingsActions = {
  replaceKey: (keybindAction: KeybindActions, oldKey: Key, newKey: Key) => void;
  addKey: (keybindAction: KeybindActions, key: Key) => void;
  removeKey: (keybindAction: KeybindActions, key: Key) => void;
  setKeybind: (keybindAction: KeybindActions, keys: Set<Key>) => void;
};

const defaults: SettingsState = {
  keybinds: {
    [KeybindActions.RightClick]: new Set(["POINTER_RIGHT"]),
    [KeybindActions.LeftClick]: new Set(["POINTER_LEFT"]),
    [KeybindActions.Up]: new Set(["W", "UP"]),
    [KeybindActions.Down]: new Set(["S", "DOWN"]),
    [KeybindActions.Left]: new Set(["A", "LEFT"]),
    [KeybindActions.Right]: new Set(["D", "RIGHT"]),
    [KeybindActions.Center]: new Set(["C"]),
    [KeybindActions.Base]: new Set(["SPACE", "B"]),
    [KeybindActions.ZoomIn]: new Set(["X", "PLUS"]),
    [KeybindActions.ZoomOut]: new Set(["Z", "MINUS"]),
    [KeybindActions.Modifier]: new Set(["SHIFT"]),
    [KeybindActions.ToggleUI]: new Set(["H"]),
    [KeybindActions.Hotbar0]: new Set(["ONE"]),
    [KeybindActions.Hotbar1]: new Set(["TWO"]),
    [KeybindActions.Hotbar2]: new Set(["THREE"]),
    [KeybindActions.Hotbar3]: new Set(["FOUR"]),
    [KeybindActions.Hotbar4]: new Set(["FIVE"]),
    [KeybindActions.Hotbar5]: new Set(["SIX"]),
    [KeybindActions.Hotbar6]: new Set(["SEVEN"]),
    [KeybindActions.Hotbar7]: new Set(["EIGHT"]),
    [KeybindActions.Hotbar8]: new Set(["NINE"]),
    [KeybindActions.Hotbar9]: new Set(["ZERO"]),
    [KeybindActions.NextHotbar]: new Set(["E"]),
    [KeybindActions.PrevHotbar]: new Set(["Q"]),
    [KeybindActions.Inventory]: new Set(["I", "TAB"]),
    [KeybindActions.Research]: new Set(["R"]),
  },
};

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set, get) => ({
      ...defaults,
      replaceKey: (keybindAction, oldKey, newKey) => {
        const set = get().keybinds[keybindAction];

        if (!set) return;

        transferListeners(oldKey, newKey);

        if (set.delete(oldKey)) set.add(newKey);
      },
      addKey: (keybindAction, key) => {
        const set = get().keybinds[keybindAction];

        if (!set) return;

        set.add(key);
      },
      removeKey: (keybindAction, key) => {
        const set = get().keybinds[keybindAction];

        if (!set) return;

        if (set.delete(key)) removeListeners(key);
      },
      setKeybind: (keybindAction, keys) =>
        set({ keybinds: { [keybindAction]: keys } }),
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
      migrate: (persistedState) => {
        const newState = merge(defaults, persistedState);
        return newState as SettingsState & SettingsActions;
      },
    }
  )
);

//store dev tools
if (import.meta.env.VITE_DEV === "true") {
  mountStoreDevtool("SettingsStore", useSettingsStore);
}
