import { KeybindActions } from "@game/constants";
import { EntityID } from "@latticexyz/recs";
import { Scene } from "engine/types";
import { createCameraApi } from "src/game/api/camera";
import { createInputApi } from "src/game/api/input";
import { MainBase, Position } from "src/network/components/chainComponents";
import { world } from "src/network/world";

export const setupKeybinds = (scene: Scene, player: EntityID) => {
  const { pan } = createCameraApi(scene);
  const { addListener } = createInputApi(scene);

  const mainbaseKeybind = addListener(KeybindActions.Base, () => {
    const mainBase = MainBase.get(player)?.value;

    if (!mainBase) return;

    const mainBaseCoord = Position.get(mainBase);
    if (mainBaseCoord) pan(mainBaseCoord);
  });

  world.registerDisposer(() => {
    mainbaseKeybind.dispose();
  }, "game");
};
