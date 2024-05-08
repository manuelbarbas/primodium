import { createNotificationApi } from "@/game/api/notification";
import { Scene } from "engine/types";
import { createAudioApi } from "./audio";
import { createCameraApi } from "./camera";
import { createFxApi } from "./fx";
import { createHooksApi } from "./hooks";
import { createInputApi } from "./input";
import { createObjectApi } from "./objects";
import { createSpriteApi } from "./sprite";

export type SceneApi = ReturnType<typeof createSceneApi>;

//pull out api so we can use in non react contexts
export function createSceneApi(scene: Scene) {
  const cameraApi = createCameraApi(scene);

  const apiObject = {
    config: scene.config,
    camera: cameraApi,
    notify: createNotificationApi(scene),
    hooks: createHooksApi(scene),
    input: createInputApi(scene),
    fx: createFxApi(scene),
    sprite: createSpriteApi(scene),
    audio: createAudioApi(scene),
    objects: createObjectApi(scene),
  };

  apiObject.audio.initializeAudioVolume();

  return apiObject;
}
