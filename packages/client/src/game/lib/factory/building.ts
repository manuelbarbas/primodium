import { EntityID } from "@latticexyz/recs";
import { GameObjectComponent } from "engine/types";
import {
  Assets,
  DepthLayers,
  EntityIDtoAnimationKey,
  EntityIDtoSpriteKey,
  SpriteKeys,
} from "../../constants";
import { clampedIndex } from "src/util/common";

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
      gameObject.setPosition(x, y);

      //set sprite
      const sprites = EntityIDtoSpriteKey[buildingType];

      const spriteKey = sprites
        ? sprites[clampedIndex(level - 1, sprites.length)]
        : SpriteKeys.Node;

      gameObject.setTexture(Assets.SpriteAtlas, spriteKey);

      gameObject.setDepth(DepthLayers.Building);
      if (selected) {
        gameObject.setTint(0xffff00);
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
