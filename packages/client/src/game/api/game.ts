import { Game } from "engine/types";

export function createGameApi(game: Game) {
  function setResolution(width: number, height: number) {
    const { phaserGame, sceneManager } = game;

    phaserGame.scale.resize(width, height);

    sceneManager.scenes.forEach((scene) => {
      scene.phaserScene.cameras.main.setViewport(0, 0, width, height);

      // Re-adjust camera viewport
      // scene.phaserScene.cameras.main.setViewport(
      //   0,
      //   0,
      //   phaserGame.scale.width,
      //   phaserGame.scale.height
      // );

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

  // function captureFrameFromAtlas(atlasKey: string, frameName: string) {
  //   const { phaserGame, sceneManager } = game;

  //   let scene = sceneManager.scenes.get("ROOT")!.phaserScene;

  //   let frame = phaserGame.textures.get(atlasKey).get(frameName);

  //   let renderTexture = scene.add.renderTexture(
  //     0,
  //     0,
  //     frame.width,
  //     frame.height
  //   );

  //   let tempSprite = scene.add.sprite(0, 0, atlasKey, frameName);

  //   renderTexture.draw(tempSprite, 0, 0);
  //   tempSprite.destroy();

  //   let textureKey = "tempTextureKey";
  //   scene.textures.addImage(textureKey, renderTexture.snapshot());

  //   let canvas = scene.textures.get(textureKey).getSourceImage();
  //   console.log(canvas);
  // }

  function getConfig() {
    return game.phaserGame.config;
  }

  return {
    setResolution,
    setTarget,
    getConfig,
  };
}
