import { createCameraApi } from "@/game/api/camera";
import { GameApi } from "@/game/api/game";
import { ModeToSceneKey } from "@/game/lib/mappings";
import { Mode } from "@/util/constants";
import { defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { components } from "src/network/components";
import { world } from "src/network/world";

export const modeSystem = (game: GameApi) => {
  const systemsWorld = namespaceWorld(world, "systems");

  defineComponentSystem(systemsWorld, components.SelectedMode, ({ value }) => {
    const mode = value[0]?.value;
    const prevMode = value[1]?.value;

    if (!mode) return;

    const activeRock = components.ActiveRock.get()?.value;
    const sceneKey = ModeToSceneKey[mode];
    const pos = sceneKey === "ASTEROID" ? { x: 18, y: 13 } : components.Position.get(activeRock) ?? { x: 0, y: 0 };

    const targetScene = game.getScene(sceneKey);

    if (targetScene) {
      const cameraApi = createCameraApi(targetScene);

      cameraApi.pan(pos, {
        duration: 0,
      });
    }

    game.transitionToScene(
      ModeToSceneKey[prevMode ?? Mode.Asteroid],
      sceneKey,
      0,
      (_, targetScene) => {
        targetScene.camera.phaserCamera.fadeOut(0, 0, 0, 0);
      },
      (_, targetScene) => {
        targetScene.phaserScene.add.tween({
          targets: targetScene.camera.phaserCamera,
          zoom: { from: targetScene.config.camera.defaultZoom / 2, to: targetScene.config.camera.defaultZoom },
          duration: 500,
          ease: "Cubic.easeInOut",
          onUpdate: () => {
            targetScene.camera.zoom$.next(targetScene.camera.phaserCamera.zoom);
            targetScene.camera.worldView$.next(targetScene.camera.phaserCamera.worldView);
          },
        });
        targetScene.camera.phaserCamera.fadeIn(500, 0, 0, 0);
      }
    );
    components.SelectedBuilding.remove();
    components.HoverEntity.remove();

    // set selected rock to last build rock if transitioning from build mode, fallback to active rock or singleton
    if (prevMode === Mode.Asteroid) {
      components.SelectedRock.set({
        value: components.BuildRock.get()?.value ?? components.ActiveRock.get()?.value ?? singletonEntity,
      });
    }
  });
};
