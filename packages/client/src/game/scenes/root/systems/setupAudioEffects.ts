import { defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { Scene } from "engine/types";
import { createAudioApi } from "src/game/api/audio";
import { components } from "src/network/components";
import { world } from "src/network/world";
import { getRandomRange } from "src/util/common";

export const setupAudioEffects = (scene: Scene) => {
  const audio = createAudioApi(scene);
  const systemsWorld = namespaceWorld(world, "systems");

  defineComponentSystem(systemsWorld, components.HoverEntity, ({ value }) => {
    if (!value[0]) return;

    audio.play("DataPoint2", "ui", {
      volume: 0.1,
      detune: getRandomRange(-200, 200),
    });
  });
};
