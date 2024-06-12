import { Core } from "@primodiumxyz/core";
import { Scene } from "@primodiumxyz/engine/types";

import { createAudioApi } from "@/api/audio";
import { createCameraApi } from "@/api/camera";
import { createFxApi } from "@/api/fx";
import { createHooksApi } from "@/api/hooks";
import { createInputApi } from "@/api/input";
import { createSpriteApi } from "@/api/sprite";
import { createObjectApi } from "@/api/objects";
import { createNotificationApi } from "@/api/notification";
import { createUtilApi } from "@/api/utils";

export type SceneApi = ReturnType<typeof createSceneApi>;
export type PrimodiumScene = SceneApi & { runSystems?: (core: Core) => void; isPrimary?: boolean };

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
