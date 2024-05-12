import { PrimodiumScene } from "@/game/api/scene";
import { Mode } from "@/util/constants";
import { defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { components } from "src/network/components";
import { world } from "src/network/world";

export const mapOpenFx = (scene: PrimodiumScene) => {
  const systemsWorld = namespaceWorld(world, "systems");
  const bg = scene.audio.get("Background", "music");
  const bg2 = scene.audio.get("Background2", "music");

  defineComponentSystem(systemsWorld, components.SelectedMode, ({ value }) => {
    const mode = value[0]?.value;
    if (!bg || !bg2) return;

    if (mode === Mode.Asteroid) {
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
