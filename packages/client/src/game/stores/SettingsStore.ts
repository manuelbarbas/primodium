import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mountStoreDevtool } from "simple-zustand-devtools";
import Phaser from "phaser";

import { KeybindActions } from "@game/constants";

type Keybinds = Partial<{
  [key in KeybindActions]: Set<number>;
}>;

type SettingsState = {
  keybinds: Keybinds;
};

type SettingsActions = {};

const defaults: SettingsState = {
  keybinds: {
    [KeybindActions.Up]: new Set([
      Phaser.Input.Keyboard.KeyCodes.W,
      Phaser.Input.Keyboard.KeyCodes.UP,
    ]),
    [KeybindActions.Down]: new Set([
      Phaser.Input.Keyboard.KeyCodes.S,
      Phaser.Input.Keyboard.KeyCodes.DOWN,
    ]),
    [KeybindActions.Left]: new Set([
      Phaser.Input.Keyboard.KeyCodes.A,
      Phaser.Input.Keyboard.KeyCodes.LEFT,
    ]),
    [KeybindActions.Right]: new Set([
      Phaser.Input.Keyboard.KeyCodes.D,
      Phaser.Input.Keyboard.KeyCodes.RIGHT,
    ]),
    [KeybindActions.Base]: new Set([Phaser.Input.Keyboard.KeyCodes.B]),
    [KeybindActions.Center]: new Set([Phaser.Input.Keyboard.KeyCodes.C]),
    [KeybindActions.ZoomIn]: new Set([
      Phaser.Input.Keyboard.KeyCodes.PLUS,
      Phaser.Input.Keyboard.KeyCodes.X,
    ]),
    [KeybindActions.ZoomOut]: new Set([
      Phaser.Input.Keyboard.KeyCodes.MINUS,
      Phaser.Input.Keyboard.KeyCodes.Z,
    ]),
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
            [key in KeybindActions]: number[];
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
            [key in KeybindActions]: number[];
          }> = {};
          const keybinds = value.state.keybinds as Keybinds;

          for (const _action in keybinds) {
            let action = parseInt(_action) as KeybindActions;
            const set = keybinds[action];

            if (!set) continue;

            const array = Array.from(set) as number[];
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
