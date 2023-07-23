import { EntityID } from "@latticexyz/recs";
import { GameObjectComponent } from "../../../engine/types";
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
      //set sprite
      const sprite = EntityIDtoSpriteKey[buildingType];
      if (!sprite) return;

      gameObject.setPosition(x, y);
      // TODO getting issues here if level is passed in as 0.
      // Would be nice to set this to sprite[level] instead.
      if (!level) level = 1;

      gameObject.setTexture(
        Assets.SpriteAtlas,
        sprite ? sprite[level - 1] : SpriteKeys.Node
      );
      gameObject.setDepth(DepthLayers.Building);
      if (selected) {
        gameObject.setTint(0xffff00);
      }

      //set animation if it exists
      const anim = EntityIDtoAnimationKey[buildingType];
      const animIndex = clampedIndex(level - 1, anim?.length);
      if (anim && anim[animIndex]) {
        gameObject.play(anim[animIndex]!);
      }
    },
  };
};
