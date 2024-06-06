import { createNotificationApi } from "@/game/api/notification";
import { Scene } from "@primodiumxyz/engine/types";
import { createAudioApi } from "./audio";
import { createCameraApi } from "./camera";
import { createFxApi } from "./fx";
import { createHooksApi } from "./hooks";
import { createInputApi } from "./input";
import { createSpriteApi } from "./sprite";
import { createObjectApi } from "@/game/api/objects";
import { MUD } from "@/network/types";
import { createUtilApi } from "@/game/api/utils";

export type SceneApi = ReturnType<typeof createSceneApi>;
export type PrimodiumScene = SceneApi & { runSystems?: (mud: MUD) => void; isPrimary?: boolean };

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
