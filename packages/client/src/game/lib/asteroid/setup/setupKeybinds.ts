import { KeybindActions } from "@game/constants";
import { Entity } from "@latticexyz/recs";
import { Scene } from "engine/types";
import { createCameraApi } from "src/game/api/camera";
import { createInputApi } from "src/game/api/input";
import { components } from "src/network/components";
import { world } from "src/network/world";

export const setupKeybinds = (scene: Scene) => {
  const { pan } = createCameraApi(scene);
  const { addListener } = createInputApi(scene);

  const mainbaseKeybind = addListener(KeybindActions.Base, () => {
    //TODO - fix converting to entity
    const playerEntity = components.Account.get()?.value;
    const mainBase = components.Home.get(playerEntity)?.mainBase as Entity | undefined;

    if (!mainBase) return;

    const mainBaseCoord = components.Position.get(mainBase);
    if (mainBaseCoord) pan(mainBaseCoord);
  });

  world.registerDisposer(() => {
    mainbaseKeybind.dispose();
  }, "game");
};
