import { defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { PrimodiumScene } from "@/game/api/scene";

import { components } from "src/network/components";
import { world } from "src/network/world";
import { EntityType } from "src/util/constants";

export const focusMainbase = (scene: PrimodiumScene) => {
  const systemsWorld = namespaceWorld(world, "systems");

  const handleMove = () => {
    const mainBaseCoord = components.Position.get(EntityType.MainBase) ?? { x: 0, y: 0 };

    scene.camera.pan(mainBaseCoord, {
      duration: 0,
    });
  };

  defineComponentSystem(systemsWorld, components.ActiveRock, handleMove);
};
