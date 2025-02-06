import { Scene } from "@primodiumxyz/engine/types";
import { createAudioApi } from "@game/api/audio";
import { createCameraApi } from "@game/api/camera";
import { createFxApi } from "@game/api/fx";
import { createHooksApi } from "@game/api/hooks";
import { createInputApi } from "@game/api/input";
import { createNotificationApi } from "@game/api/notification";
import { createObjectApi } from "@game/api/objects";
import { createSpriteApi } from "@game/api/sprite";
import { createUtilApi } from "@game/api/utils";

export function createSceneApi(scene: Scene) {
  const cameraApi = createCameraApi(scene);

  const apiObject = {
    phaserScene: scene.phaserScene,
    audio: createAudioApi(scene),
    config: scene.config,
    camera: cameraApi,
    dispose: scene.dispose,
    fx: createFxApi(scene),
    hooks: createHooksApi(scene),
    input: createInputApi(scene),
    notify: createNotificationApi(scene),
    objects: createObjectApi(scene),
    sprite: createSpriteApi(scene),
    utils: createUtilApi(scene),
    tiled: scene.tiled,
  };

  apiObject.audio.initializeAudioVolume();

  return apiObject;
}
