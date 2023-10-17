import { KeybindActions } from "@game/constants";
import { Entity } from "@latticexyz/recs";
import { Scene } from "engine/types";
import { createCameraApi } from "src/game/api/camera";
import { createInputApi } from "src/game/api/input";
import { components } from "src/network/components";
import { SetupResult } from "src/network/types";
import { world } from "src/network/world";

export const setupKeybinds = (scene: Scene, mud: SetupResult) => {
  const { pan } = createCameraApi(scene);
  const { addListener } = createInputApi(scene);
  const playerEntity = mud.network.playerEntity;

  const mainbaseKeybind = addListener(KeybindActions.Base, () => {
    //TODO - fix converting to entity
    const mainBase = components.Home.get(playerEntity)?.mainBase as Entity | undefined;

    if (!mainBase) return;

    const mainBaseCoord = components.Position.get(mainBase);
    if (mainBaseCoord) pan(mainBaseCoord);
  });

  world.registerDisposer(() => {
    mainbaseKeybind.dispose();
  }, "game");
};
