import { EntityID } from "@latticexyz/recs";
import { GameObjectComponent } from "../../../engine/types";
import {
  Assets,
  EntityIDtoAnimationKey,
  EntityIDtoSpriteKey,
  SpriteKeys,
} from "../../constants";

export const createBuilding = (
  x: number,
  y: number,
  tile: EntityID
): GameObjectComponent<"Sprite"> => {
  return {
    id: "building",
    once: (gameObject) => {
      gameObject.setPosition(x, y);

      //set sprite
      const sprite = EntityIDtoSpriteKey[tile];
      gameObject.setTexture(Assets.SpriteAtlas, sprite ?? SpriteKeys.Node);

      //set animation if it exists
      const anim = EntityIDtoAnimationKey[tile];
      if (anim) {
        gameObject.play(anim);
      }
    },
  };
};
