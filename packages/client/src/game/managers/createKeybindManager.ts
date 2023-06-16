import { useConfigStore } from "../../store/ConfigStore";
import { Game } from "../../util/types";
import api from "../../api";

const createKeybindManager = (game: Game) => {
  const keybinds = useConfigStore.getState().keybinds;
  const {
    mainScene: { scene },
  } = game;

  const registerKeybinds = () => {
    //loop through keybinds and add event listeners
    Object.entries(keybinds).forEach(([action, value]) => {
      value.forEach((key) => {
        if (!Array.isArray(key)) {
          const keybind = scene.input.keyboard?.addKey(key, true, true);

          keybind?.on("down", () => {
            api.game.keybindAction[
              action as keyof typeof api.game.keybindAction
            ]();
          });
        }
      });
    });
  };

  const dispose = () => {
    //loop through keybinds and remove event listeners
    Object.entries(keybinds).forEach(([_, value]) => {
      value.forEach((key) => {
        if (!Array.isArray(key)) {
          const keybind = scene.input.keyboard?.removeKey(key);

          keybind?.removeAllListeners();
        }
      });
    });
  };

  return { registerKeybinds, dispose };
};

export default createKeybindManager;
