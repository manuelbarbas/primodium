import { engine } from "@engine/api";

export const setResolution = (width: number, height: number) => {
  const { phaserGame, sceneManager } = engine.getGame()!;

  phaserGame.scale.resize(width, height);

  sceneManager.scenes.forEach((scene) => {
    scene.phaserScene.cameras.main.setViewport(0, 0, width, height);

    // Re-adjust camera viewport
    scene.phaserScene.cameras.main.setViewport(
      0,
      0,
      phaserGame.scale.width,
      phaserGame.scale.height
    );

    // Re-center the camera
    scene.phaserScene.cameras.main.setScroll(
      -phaserGame.scale.width / 2,
      -phaserGame.scale.height / 2
    );
  });
};
