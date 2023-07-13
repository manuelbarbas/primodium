import { EntityID } from "@latticexyz/recs";
import { BlockType } from "src/util/constants";
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
      const atlas =
        tile == BlockType.MainBase ? Assets.BaseAtlas : Assets.SpriteAtlas;
      const sprite = EntityIDtoSpriteKey[tile];
      gameObject.setTexture(atlas, sprite ?? SpriteKeys.Node);
      gameObject.setDepth(DepthLayers.Building);

      //set animation if it exists
      const anim = EntityIDtoAnimationKey[tile];
      if (anim) {
        gameObject.play(anim);
      }
    },
  };
};
