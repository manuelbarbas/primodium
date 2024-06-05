import { defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { components } from "@primodiumxyz/core/network/components";
import { world } from "@primodiumxyz/core/network/world";
import { EntityType } from "@primodiumxyz/core/util/constants";

import { PrimodiumScene } from "@/api/scene";

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
