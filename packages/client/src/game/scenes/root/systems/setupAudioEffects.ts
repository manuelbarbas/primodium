import { defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { components } from "src/network/components";
import { world } from "src/network/world";
import { getRandomRange } from "src/util/common";
import { PrimodiumScene } from "@/game/api/scene";

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
