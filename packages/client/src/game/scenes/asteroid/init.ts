// ASTEROID MAP ENTRY POINT
import { createSceneApi, PrimodiumScene } from "@/game/api/scene";
import { asteroidSceneConfig } from "../../lib/config/asteroidScene";
import { setupBasicCameraMovement } from "../common/setup/setupBasicCameraMovement";
import { setupKeybinds } from "./setup/setupKeybinds";
import { setupMouseInputs } from "./setup/setupMouseInputs";
import { MUD } from "@/network/types";
import { runSystems as runAsteroidSystems } from "src/game/scenes/asteroid/systems";
import { GlobalApi } from "@/game/api/global";
// import { Assets, Sprites } from "@primodiumxyz/assets";
// import { ContainerLite } from "engine/objects";

export const initAsteroidScene = async (game: GlobalApi): Promise<PrimodiumScene> => {
  const scene = await game.createScene(asteroidSceneConfig, true);

  const sceneApi = createSceneApi(scene);

  setupMouseInputs(sceneApi);
  setupBasicCameraMovement(sceneApi);
  setupKeybinds(sceneApi);

  scene.phaserScene.lights.enable();
  scene.phaserScene.lights.setAmbientColor(0x808080);

  const mainLight = scene.phaserScene.lights.addLight(
    18 * scene.tiled.tileWidth + scene.tiled.tileWidth / 2,
    -11 * scene.tiled.tileHeight + scene.tiled.tileHeight / 2,
    1700,
    0xe0ffff,
    2
  );

  scene.phaserScene.add.tween({
    targets: mainLight,
    duration: 4000,
    ease: "Sine.easeInOut",
    diameter: 2000,
    intensity: 1,
    repeat: -1,
    yoyo: true,
  });

  // const sprite = new Phaser.GameObjects.Sprite(scene.phaserScene, 0, 0, Assets.SpriteAtlas, Sprites.AlloyFactory1)
  //   .setDepth(1000)
  //   .setOrigin(0.5, 0.5);
  // const container = new GlobalDepthContainer(scene.phaserScene, 0, 0)
  //   .pinLocal(sprite, {
  //     // syncDisplayList: true,
  //     syncPosition: true,
  //     syncRotation: true,
  //     syncScale: true,
  //   })
  //   .setOrigin(0.5, 0.5);

  // scene.phaserScene.add.existing(sprite);
  // scene.phaserScene.add.existing(container);

  // const sprite1 = new Phaser.GameObjects.Sprite(scene.phaserScene, 50, 0, Assets.SpriteAtlas, Sprites.Asteroid1)
  //   .setDepth(500)
  //   .setOrigin(0.5, 0.5);
  // const sprite2 = new Phaser.GameObjects.Sprite(scene.phaserScene, -50, 0, Assets.SpriteAtlas, Sprites.Asteroid1)
  //   .setDepth(1001)
  //   .setOrigin(0.5, 0.5);
  // const container1 = new ContainerLite(scene.phaserScene, 0, 0)
  //   .addLocalMultiple([sprite1, sprite2])
  //   .setOrigin(0.5, 0.5);
  // // .setDepth(100000);

  // scene.phaserScene.add.existing(sprite1);
  // scene.phaserScene.add.existing(sprite2);
  // scene.phaserScene.add.existing(container1);
  // container1.addChildrenToScene();
  // container1.setRotation(1);

  scene.camera.phaserCamera.fadeIn(1000);
  const runSystems = (mud: MUD) => runAsteroidSystems(sceneApi, mud);

  return { ...sceneApi, runSystems };
};
