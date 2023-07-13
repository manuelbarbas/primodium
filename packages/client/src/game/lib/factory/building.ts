import { EntityID, EntityIndex } from "@latticexyz/recs";
import { BlockType } from "src/util/constants";
import { GameObjectComponent } from "../../../engine/types";
import {
  Assets,
  DepthLayers,
  EntityIDtoAnimationKey,
  EntityIDtoSpriteKey,
  SpriteKeys,
} from "../../constants";

export const createBuilding = ({
  renderId = "building",
  x,
  y,
  buildingType,
}: {
  entityIndex: EntityIndex;
  renderId?: string;
  x: number;
  y: number;
  buildingType: EntityID;
}): GameObjectComponent<"Sprite"> => {
  return {
    id: renderId,
    once: (gameObject) => {
      gameObject.setPosition(x, y);

      //set sprite
      const atlas =
        buildingType == BlockType.MainBase
          ? Assets.BaseAtlas
          : Assets.SpriteAtlas;
      const sprite = EntityIDtoSpriteKey[buildingType];
      gameObject.setTexture(atlas, sprite ?? SpriteKeys.Node);
      gameObject.setDepth(DepthLayers.Building);

      //set animation if it exists
      const anim = EntityIDtoAnimationKey[buildingType];
      if (anim) {
        gameObject.play(anim);
      }
    },
  };
};
