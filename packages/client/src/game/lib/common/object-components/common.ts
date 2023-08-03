import { Coord } from "@latticexyz/utils";
import { GameObjectComponent, GameObjectTypes } from "engine/types";

export const ObjectPosition = <T extends keyof GameObjectTypes>(
  coord: Coord,
  depth?: number
): GameObjectComponent<T> => {
  return {
    id: "position",
    once: (gameObject) => {
      gameObject.x = coord.x;
      gameObject.y = coord.y;

      if (depth) gameObject.setDepth(depth);
    },
  };
};
