import { Game } from "engine/types";

export function createGameApi(game: Game) {
  function setResolution(width: number, height: number) {
    const { phaserGame, sceneManager } = game;

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
  }

  function setTarget(id: string) {
    const div = game.phaserGame.canvas;

    const target = document.getElementById(id);

    if (target === null) {
      console.warn("No target found with id " + id);
      return;
    }

    target.appendChild(div);

    setResolution(
      target.offsetWidth * window.devicePixelRatio,
      target.offsetHeight * window.devicePixelRatio
    );
  }

  function getConfig() {
    return game.phaserGame.config;
  }

  return {
    setResolution,
    setTarget,
    getConfig,
  };
}
