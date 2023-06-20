import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mountStoreDevtool } from "simple-zustand-devtools";
import Phaser from "phaser";

type ConfigState = {
  fps: Phaser.Types.Core.FPSConfig;
  tilemap: {
    tileWidth: number;
    tileHeight: number;
    gridSize: number;
    chunkSize: number;
    buffer: number;
  };
  assetKeys: {
    tilesets: {
      terrain: string;
      resource: string;
    };
  };
  camera: {
    minZoom: number;
    maxZoom: number;
    zoomStep: number;
    pinchSpeed: number;
    scrollSpeed: number;
  };
  keybinds: {
    [key: string]: Set<number[] | number>;
  };
};

type ConfigActions = {
  setMinFps: (min: number) => void;
  setTargetFps: (target: number) => void;
  setLimitFps: (limit: number) => void;
  setMinZoom: (min: number) => void;
  setMaxZoom: (max: number) => void;
  setPinchSpeed: (speed: number) => void;
  setScrollSpeed: (speed: number) => void;
};

const defaults: ConfigState = {
  fps: {
    target: 60,
    min: 30,
    limit: 60,
  },
  tilemap: {
    tileWidth: 16,
    tileHeight: 16,
    gridSize: 500,
    chunkSize: 16,
    buffer: 1000,
  },
  assetKeys: {
    tilesets: {
      terrain: "terrain-tileset",
      resource: "resource-tileset",
    },
  },
  camera: {
    minZoom: 2,
    maxZoom: 8,
    zoomStep: 1,
    pinchSpeed: 1,
    scrollSpeed: 0.5,
  },
  keybinds: {
    centerCamera: new Set([
      Phaser.Input.Keyboard.KeyCodes.C,
      Phaser.Input.Keyboard.KeyCodes.SPACE,
    ]),
    zoomIn: new Set([Phaser.Input.Keyboard.KeyCodes.PLUS]),
    zoomOut: new Set([Phaser.Input.Keyboard.KeyCodes.MINUS]),
    cameraMoveUp: new Set([
      Phaser.Input.Keyboard.KeyCodes.UP,
      Phaser.Input.Keyboard.KeyCodes.W,
    ]),
    cameraMoveDown: new Set([
      Phaser.Input.Keyboard.KeyCodes.DOWN,
      Phaser.Input.Keyboard.KeyCodes.S,
    ]),
    cameraMoveLeft: new Set([
      Phaser.Input.Keyboard.KeyCodes.LEFT,
      Phaser.Input.Keyboard.KeyCodes.A,
    ]),
    cameraMoveRight: new Set([
      Phaser.Input.Keyboard.KeyCodes.RIGHT,
      Phaser.Input.Keyboard.KeyCodes.D,
    ]),
  },
};

export const useConfigStore = create<ConfigState & ConfigActions>()(
  persist(
    (set) => ({
      ...defaults,
      setMinFps: (min: number) =>
        set((state) => ({
          fps: {
            ...state.fps,
            min,
          },
        })),
      setTargetFps: (target: number) =>
        set((state) => ({
          fps: {
            ...state.fps,
            target,
          },
        })),
      setLimitFps: (limit: number) =>
        set((state) => ({
          fps: {
            ...state.fps,
            limit,
          },
        })),
      setMinZoom: (min: number) =>
        set((state) => ({
          camera: {
            ...state.camera,
            min,
          },
        })),
      setMaxZoom: (max: number) =>
        set((state) => ({
          camera: {
            ...state.camera,
            max,
          },
        })),
      setPinchSpeed: (speed: number) =>
        set((state) => ({
          camera: {
            ...state.camera,
            pinchSpeed: speed,
          },
        })),
      setScrollSpeed: (speed: number) =>
        set((state) => ({
          camera: {
            ...state.camera,
            scrollSpeed: speed,
          },
        })),
    }),
    {
      name: "config-storage",
      storage: {
        getItem: (key) => {
          const str = localStorage.getItem(key);
          const result: { [key: string]: Set<number[] | number> } = {};
          const keybinds = JSON.parse(str!).state.keybinds;

          for (const action in keybinds) {
            const set = new Set(keybinds[action]) as Set<number[] | number>;
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
          const result: { [key: string]: number[] | number[][] } = {};
          const keybinds = value.state.keybinds;

          for (const action in keybinds) {
            const set = keybinds[action];
            const array = Array.from(set) as number[] | number[][];
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
  mountStoreDevtool("ConfigStore", useConfigStore);
}
