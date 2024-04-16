import { defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { Scene } from "engine/types";
import { createAudioApi } from "src/game/api/audio";
import { AudioKeys } from "src/game/lib/constants/assets/audio";
import { components } from "src/network/components";
import { world } from "src/network/world";

export const mapOpenFx = (scene: Scene) => {
  const systemsWorld = namespaceWorld(world, "systems");
  const audio = createAudioApi(scene);
  const bg = audio.get(AudioKeys.Background, "music");
  const bg2 = audio.get(AudioKeys.Background2, "music");

  defineComponentSystem(systemsWorld, components.MapOpen, ({ value }) => {
    if (!bg || !bg2) return;

    if (value[0]?.value) {
      scene.phaserScene.add.tween({
        targets: bg,
        volume: 0,
        duration: 3000,
      });

      scene.phaserScene.add.tween({
        targets: bg2,
        volume: 1,
        duration: 3000,
      });
    } else {
      scene.phaserScene.add.tween({
        targets: bg,
        volume: 1,
        duration: 3000,
      });

      scene.phaserScene.add.tween({
        targets: bg2,
        volume: 0,
        duration: 3000,
      });
    }
  });
};
