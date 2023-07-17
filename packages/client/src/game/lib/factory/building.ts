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

function findBlockByValue(value: string): string | undefined {
  for (const key in BlockType) {
    if (BlockType.hasOwnProperty(key)) {
      if (BlockType[key] === value) {
        return key;
      }
    }
  }
  return undefined;
}

export const createBuilding = ({
  renderId = "building",
  x,
  y,
  buildingType,
  selected = false,
}: {
  renderId?: string;
  x: number;
  y: number;
  buildingType: EntityID;
  selected?: boolean;
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
      if (selected) {
        gameObject.setTint(0xffff00);
      }

      //set animation if it exists
      const anim = EntityIDtoAnimationKey[buildingType];
      if (anim) {
        gameObject.play(anim);
      }
    },
  };
};
