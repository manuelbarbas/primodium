import { defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { components } from "src/network/components";
import { world } from "src/network/world";
import { getRandomRange } from "src/util/common";
import { SceneApi } from "@/game/api/scene";

export const setupAudioEffects = (scene: SceneApi) => {
  const systemsWorld = namespaceWorld(world, "systems");

  defineComponentSystem(systemsWorld, components.HoverEntity, ({ value }) => {
    if (!value[0]) return;

    scene.audio.play("DataPoint2", "ui", {
      volume: 0.1,
      detune: getRandomRange(-200, 200),
    });
  });
};
