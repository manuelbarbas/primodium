import { Entity, defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { Scene } from "engine/types";

import { createCameraApi } from "src/game/api/camera";
import { components } from "src/network/components";
import { world } from "src/network/world";
import { toHex32 } from "src/util/encode";

export const focusMainbase = (scene: Scene) => {
  const { pan } = createCameraApi(scene);
  const systemsWorld = namespaceWorld(world, "systems");

  const handleMove = () => {
    const mainbasePrototypeEntity = toHex32("MainBase") as Entity;

    const mainBaseCoord = components.Position.get(mainbasePrototypeEntity) ?? { x: 0, y: 0 };

    pan(mainBaseCoord, 0);
  };

  defineComponentSystem(systemsWorld, components.ActiveRock, handleMove);
};
