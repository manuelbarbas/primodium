import { KeybindActions, Scenes } from "@game/constants";
import { engine } from "@engine/api";
import { useSettingsStore } from "../stores/SettingsStore";
import { hasCommonElement } from "../../util/common";

export const isPressed = (
  keybindAction: KeybindActions,
  targetScene: Scenes = Scenes.Main
) => {
  const keybinds = useSettingsStore.getState().keybinds;
  const { input } = engine.getGame()?.sceneManager.scenes.get(targetScene)!;

  const isPressed = hasCommonElement(
    keybinds[keybindAction]!,
    new Set(input.pressedKeys)
  );

  return isPressed;
};
