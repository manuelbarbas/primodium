import { EntityID } from "@latticexyz/recs";
import { GameObjectComponent } from "../../../engine/types";
import {
  Assets,
  DepthLayers,
  EntityIDtoAnimationKey,
  EntityIDtoSpriteKey,
  SpriteKeys,
} from "../../constants";

export const createBuilding = (options: {
  id?: string;
  x: number;
  y: number;
  tile: EntityID;
}): GameObjectComponent<"Sprite"> => {
  const { id = "building", x, y, tile } = options;

  return {
    id,
    once: (gameObject) => {
      gameObject.setPosition(x, y);

      //set sprite
      const sprite = EntityIDtoSpriteKey[tile];
      gameObject.setTexture(Assets.SpriteAtlas, sprite ?? SpriteKeys.Node);
      gameObject.setDepth(DepthLayers.Building);

      //set animation if it exists
      const anim = EntityIDtoAnimationKey[tile];
      if (anim) {
        gameObject.play(anim);
      }
    },
  };
};
