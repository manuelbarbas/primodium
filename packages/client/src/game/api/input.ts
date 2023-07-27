import { throttle } from "lodash";

import { KeybindActions, Scenes } from "@game/constants";
import engine from "engine";
import { useSettingsStore } from "../stores/SettingsStore";
import { Key } from "engine/types";

export const isDown = (
  keybindAction: KeybindActions,
  targetScene: Scenes = Scenes.Main
) => {
  const keybinds = useSettingsStore.getState().keybinds;
  const { input } = engine.getGame()?.sceneManager.scenes.get(targetScene)!;

  if (!keybinds[keybindAction]) return false;

  if (KeybindActions.LeftClick === keybindAction) {
    if (input.phaserInput.activePointer.downElement?.nodeName !== "CANVAS")
      return false;
    return input.phaserInput.activePointer.leftButtonDown();
  }

  if (KeybindActions.RightClick === keybindAction) {
    if (input.phaserInput.activePointer.downElement?.nodeName !== "CANVAS")
      return false;
    return input.phaserInput.activePointer.rightButtonDown();
  }

  for (const key of keybinds[keybindAction]!) {
    if (input.phaserKeys.get(key as Key)?.isDown) {
      return true;
    }
  }

  return false;
};

export const isUp = (
  keybindAction: KeybindActions,
  targetScene: Scenes = Scenes.Main
) => {
  const keybinds = useSettingsStore.getState().keybinds;
  const { input } = engine.getGame()?.sceneManager.scenes.get(targetScene)!;

  for (const key of keybinds[keybindAction]!) {
    if (input.phaserKeys.get(key as Key)?.isUp) {
      return true;
    }
  }

  return false;
};

export const addListener = (
  KeybindActions: KeybindActions,
  callback: () => void,
  emitOnRepeat = false,
  wait = 0,
  targetScene: Scenes = Scenes.Main
) => {
  const keybinds = useSettingsStore.getState().keybinds;
  const { input } = engine.getGame()?.sceneManager.scenes.get(targetScene)!;

  const fn = throttle(callback, wait);

  for (const key of keybinds[KeybindActions]!) {
    input.phaserKeys
      .get(key as Key)
      ?.on("down", fn)
      .setEmitOnRepeat(emitOnRepeat);
  }

  return {
    dispose: () => {
      for (const key of keybinds[KeybindActions]!) {
        input.phaserKeys.get(key as Key)?.removeListener("down", fn);
      }
    },
  };
};

// useful for when you want to update a keybind via the settings menu, etc. and have existing listeners move to new key.
export const transferListeners = (
  oldKey: Key,
  newKey: Key,
  targetScene: Scenes = Scenes.Main
) => {
  const { input } = engine.getGame()?.sceneManager.scenes.get(targetScene)!;

  const oldPhaserKey = input.phaserKeys.get(oldKey);
  const newPhaserKey = input.phaserKeys.get(newKey);

  if (!oldPhaserKey || !newPhaserKey) return;

  const events = oldPhaserKey.listeners("down");
  if (!events.length) return;

  const emitOnRepeat = oldPhaserKey.emitOnRepeat;

  oldPhaserKey.removeAllListeners();

  newPhaserKey.removeAllListeners().setEmitOnRepeat(emitOnRepeat);

  for (const event of events) {
    newPhaserKey.on("down", event);
  }
};

export const removeListeners = (
  key: Key,
  targetScene: Scenes = Scenes.Main
) => {
  const { input } = engine.getGame()?.sceneManager.scenes.get(targetScene)!;

  const phaserKey = input.phaserKeys.get(key);

  if (!phaserKey) return;

  phaserKey.removeAllListeners();
};
