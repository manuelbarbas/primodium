import { EntityID } from "@latticexyz/recs";
import { GameObjectComponent } from "engine/types";
import { AsteroidMap } from "../../../constants";
import { safeIndex } from "src/util/array";
import { createFxApi } from "src/game/api/fx";

const { outline } = createFxApi();

const {
  Assets,
  SpriteKeys,
  DepthLayers,
  EntityIDtoAnimationKey,
  EntityIDtoSpriteKey,
} = AsteroidMap;

export const createBuilding = ({
  renderId = "building",
  x,
  y,
  buildingType,
  selected = false,
  level = 1,
}: {
  renderId?: string;
  x: number;
  y: number;
  buildingType: EntityID;
  level?: number;
  selected?: boolean;
}): GameObjectComponent<"Sprite"> => {
  return {
    id: renderId,
    once: (gameObject) => {
      //set sprite
      gameObject.setPosition(x, y);

      //set sprite
      const sprites = EntityIDtoSpriteKey[buildingType];

      const spriteKey = sprites
        ? safeIndex(level - 1, sprites)
        : SpriteKeys.Node;

      gameObject.setTexture(Assets.SpriteAtlas, spriteKey);

      gameObject.setDepth(DepthLayers.Building);
      if (selected) {
        //check if gameObject is instance of sprite. Not sure why gameobject is an empty proxy sometimes
        if (!(gameObject instanceof Phaser.GameObjects.Sprite)) return;

        outline(gameObject);
      }

      // set animation if it exists
      const animations = EntityIDtoAnimationKey[buildingType];

      const anim =
        animations && animations.length >= level
          ? animations[level - 1]
          : undefined;

      if (anim) gameObject.play(anim);
    },
  };
};
