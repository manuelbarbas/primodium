import { KeybindActionKeys } from "@game/lib/constants/keybinds";
import { Coord } from "engine/types";
import { Key } from "engine/types";
import { mountStoreDevtool } from "simple-zustand-devtools";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const VERSION = 9;

type Keybinds = Partial<{
  [key in KeybindActionKeys]: Set<Key>;
}>;

type Panes = Record<
  string,
  | {
      pinned: boolean;
      coord: Coord;
      locked: boolean;
      visible: boolean;
    }
  | undefined
>;

type Volume = {
  master: number;
  music: number;
  sfx: number;
  ui: number;
};

type Channel = "music" | "sfx" | "ui" | "master";

type PersistentState = {
  newPlayer: boolean;
  keybinds: Keybinds;
  volume: Volume;
  uiScale: number;
  consoleHistory: { input: string; output: string }[];
  noExternalAccount: boolean;
  panes: Panes;
  fontStyle: string;
  hideHotkeys: boolean;
  showIntro: boolean;
  showObjectives: boolean;
};

type PersistentActions = {
  replaceKey: (keybindAction: KeybindActionKeys, oldKey: Key, newKey: Key) => void;
  addKey: (keybindAction: KeybindActionKeys, key: Key) => void;
  removeKey: (keybindAction: KeybindActionKeys, key: Key) => void;
  setKeybind: (keybindAction: KeybindActionKeys, keys: Set<Key>) => void;
  setNewPlayer: (val: boolean) => void;
  setVolume: (volume: number, channel: Channel) => void;
  setFontStyle: (style: string) => void;
  setUiScale: (scale: number) => void;
  setConsoleHistory: (history: { input: string; output: string }[]) => void;
  setPane: (id: string, coord: Coord, pinned: boolean, locked: boolean, visible: boolean) => void;
  removePane: (id: string) => void;
  resetPanes: () => void;
  setNoExternalAccount: (value: boolean) => void; // Add this action
  removeNoExternalAccount: () => void; // Add this action
  setHideHotkeys: (val: boolean) => void;
  setShowIntro: (val: boolean) => void;
  setShowObjectives: (val: boolean) => void;
};

const defaults: PersistentState = {
  fontStyle: "font-pixel",
  newPlayer: true,
  uiScale: 1,
  consoleHistory: [],
  noExternalAccount: false,
  panes: {},
  volume: {
    master: 1,
    music: 0.25,
    sfx: 0.5,
    ui: 0.25,
  },
  keybinds: {
    RightClick: new Set(["POINTER_RIGHT"]),
    LeftClick: new Set(["POINTER_LEFT"]),
    Up: new Set(["W", "UP"]),
    Down: new Set(["S", "DOWN"]),
    Left: new Set(["A", "LEFT"]),
    Right: new Set(["D", "RIGHT"]),
    Base: new Set(["SPACE"]),
    Cycle: new Set(["TAB"]),
    ZoomIn: new Set(["X", "PLUS"]),
    ZoomOut: new Set(["Z", "MINUS"]),
    Modifier: new Set(["SHIFT"]),
    Hotbar0: new Set(["ONE"]),
    Hotbar1: new Set(["TWO"]),
    Hotbar2: new Set(["THREE"]),
    Hotbar3: new Set(["FOUR"]),
    Hotbar4: new Set(["FIVE"]),
    Hotbar5: new Set(["SIX"]),
    Hotbar6: new Set(["SEVEN"]),
    Hotbar7: new Set(["EIGHT"]),
    Hotbar8: new Set(["NINE"]),
    Hotbar9: new Set(["ZERO"]),
    NextHotbar: new Set(["E"]),
    PrevHotbar: new Set(["Q"]),
    Esc: new Set(["ESC"]),
    Map: new Set(["M"]),
    Console: new Set(["BACKTICK"]),
    Account: new Set(["R"]),
    Blueprints: new Set(["T"]),
    Objectives: new Set(["Y"]),
    Resources: new Set(["U"]),
    Units: new Set(["I"]),
    Aura: new Set(["O"]),
    Fleets: new Set(["P"]),
    Chat: new Set(["OPEN_BRACKET"]),
    HideAll: new Set(["H"]),
  },
  hideHotkeys: false,
  showIntro: true,
  showObjectives: true,
};

export const usePersistentStore = create<PersistentState & PersistentActions>()(
  persist(
    (set, get) => ({
      ...defaults,
      setNewPlayer: (val: boolean) => {
        set({ newPlayer: val });
      },
      replaceKey: (keybindAction, oldKey, newKey) => {
        const set = get().keybinds[keybindAction];

        if (!set) return;

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

        set.delete(key);
      },
      setFontStyle: (style) => {
        set({ fontStyle: style });
      },
      setKeybind: (keybindAction, keys) => set({ keybinds: { [keybindAction]: keys } }),
      setVolume: (volume, channel) => {
        set({ volume: { ...get().volume, [channel]: volume } });
      },
      setUiScale: (scale) => {
        set({ uiScale: scale });
      },
      setConsoleHistory: (history) => {
        set({ consoleHistory: history });
      },
      setPane: (id, coord, pinned, locked, visible) => {
        set({
          panes: {
            ...get().panes,
            [id]: {
              coord,
              pinned,
              locked,
              visible,
            },
          },
        });
      },
      removePane: (id) => {
        const panes = { ...get().panes };
        delete panes[id];
        set({ panes });
      },
      resetPanes: () => {
        set({ panes: {} });
      },
      setNoExternalAccount: (value: boolean) => set({ noExternalAccount: value }),
      removeNoExternalAccount: () => set({ noExternalAccount: false }),
      setHideHotkeys: (val: boolean) => set({ hideHotkeys: val }),
      setShowIntro: (val: boolean) => set({ showIntro: val }),
      setShowObjectives: (val: boolean) => set({ showObjectives: val }),
    }),
    {
      name: "persistent-storage",
      // handle parsing of set objects since storing raw sets is not possible due to stringify behavior
      storage: {
        getItem: (key) => {
          const str = localStorage.getItem(key);
          const result: PersistentState["keybinds"] = {};
          const parsed = JSON.parse(str!);
          const version: number = parsed.version;
          const keybinds = parsed.state.keybinds as Partial<{
            [key in KeybindActionKeys]: Key[];
          }>;

          for (const _action in keybinds) {
            const action = _action as KeybindActionKeys;
            const array = keybinds[action];
            const set = new Set(array);
            result[action] = set;
          }

          return {
            version,
            state: {
              ...JSON.parse(str!).state,
              keybinds: result,
            },
          };
        },
        setItem: (key, value) => {
          const result: Partial<{
            [key in KeybindActionKeys]: Key[];
          }> = {};
          const keybinds = value.state.keybinds as Keybinds;
          const version = value.version;

          for (const _action in keybinds) {
            const action = _action as KeybindActionKeys;
            const set = keybinds[action];

            if (!set) continue;

            const array = Array.from(set) as Key[];
            result[action] = array;
          }

          const str = JSON.stringify({
            version,
            state: {
              ...value.state,
              keybinds: result,
            },
          });

          localStorage.setItem(key, str);
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
      version: VERSION,
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      migrate: (persistedStore: any, version) => {
        if (version === VERSION) return persistedStore;

        return { ...persistedStore!, ...defaults } as PersistentState & PersistentActions;
      },
    }
  )
);

//store dev tools
if (import.meta.env.VITE_DEV === "true") {
  mountStoreDevtool("SettingsStore", usePersistentStore);
}
