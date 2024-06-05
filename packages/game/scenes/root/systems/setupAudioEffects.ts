import { defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { components } from "@primodiumxyz/core/network/components";
import { world } from "@primodiumxyz/core/network/world";
import { getRandomRange } from "@primodiumxyz/core/util/common";

import { PrimodiumScene } from "@/api/scene";

export const setupAudioEffects = (scene: PrimodiumScene) => {
  const systemsWorld = namespaceWorld(world, "systems");

  defineComponentSystem(systemsWorld, components.HoverEntity, ({ value }) => {
    if (!value[0]) return;

    scene.audio.play("DataPoint2", "ui", {
      volume: 0.1,
      detune: getRandomRange(-200, 200),
    });
  });
};
