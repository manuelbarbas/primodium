import { createNotificationApi } from "@/game/api/notification";
import { Scene } from "engine/types";
import { createAudioApi } from "./audio";
import { createCameraApi } from "./camera";
import { createFxApi } from "./fx";
import { createHooksApi } from "./hooks";
import { createInputApi } from "./input";
import { createSpriteApi } from "./sprite";
import { createObjectApi } from "@/game/api/objects";
import { MUD } from "@/network/types";

export type _SceneApi = ReturnType<typeof createSceneApi>;
export type SceneApi = _SceneApi & { runSystems?: (mud: MUD) => void };

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
    tiled: scene.tiled,
  };

  apiObject.audio.initializeAudioVolume();

  return apiObject;
}
