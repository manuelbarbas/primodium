import { createCameraApi } from "@/game/api/camera";
import { createSceneApi } from "@/game/api/scene";
import { ModeToSceneKey } from "@/game/lib/mappings";
import { Mode } from "@/util/constants";
import { defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { Game } from "engine/types";
import { components } from "src/network/components";
import { world } from "src/network/world";

export const modeSystem = (game: Game) => {
  const systemsWorld = namespaceWorld(world, "systems");
  const sceneApi = createSceneApi(game);

  defineComponentSystem(systemsWorld, components.SelectedMode, ({ value }) => {
    const mode = value[0]?.value;
    const prevMode = value[1]?.value;

    if (!mode) return;

    // set selected rock to last build rock if transitioning from build mode, fallback to active rock or singleton
    if (prevMode === Mode.Asteroid) {
      components.SelectedRock.set({
        value: components.BuildRock.get()?.value ?? components.ActiveRock.get()?.value ?? singletonEntity,
      });
    }

    const selectedRock = components.SelectedRock.get()?.value;
    const sceneKey = ModeToSceneKey[mode];

    let position = { x: 0, y: 0 };
    switch (mode) {
      case Mode.Asteroid:
        position = { x: 19.5, y: 13 };
        break;
      case Mode.Starmap:
        position = components.Position.get(selectedRock) ?? { x: 0, y: 0 };
        break;
      case Mode.CommandCenter:
        position = { x: 0, y: 0 };
        break;
    }

    const targetScene = sceneApi.getScene(sceneKey);

    if (targetScene) {
      const cameraApi = createCameraApi(targetScene);

      cameraApi.pan(position, {
        duration: 0,
      });
    }

    sceneApi.transitionToScene(
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
  });
};
