import { Coord, uuid } from "@latticexyz/utils";
import { GameObjectComponent, GameObjectTypes } from "engine/types";

type GameObjectInstances = {
  [K in keyof GameObjectTypes]: InstanceType<GameObjectTypes[K]>;
};

function updateGameObject<T extends keyof GameObjectTypes>(
  gameObject: GameObjectInstances[T],
  properties: Partial<GameObjectInstances[T]>
): void {
  for (const key in properties) {
    if (key in gameObject) {
      gameObject[key as keyof GameObjectInstances[T]] =
        properties[key as keyof GameObjectInstances[T]]!;
    }
  }
}

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

export const OnClick = <T extends keyof GameObjectTypes>(
  callback: (gameObject: GameObjectInstances[T]) => void
): GameObjectComponent<T> => {
  return {
    id: "click",
    once: (gameObject) => {
      gameObject.setInteractive();
      gameObject.on("pointerdown", () => {
        callback(gameObject as GameObjectInstances[T]);
      });
    },
  };
};

export const SetValue = <T extends keyof GameObjectTypes>(
  properties: Partial<GameObjectInstances[T]>
): GameObjectComponent<T> => {
  return {
    id: uuid(),
    once: (gameObject) => {
      updateGameObject(gameObject as GameObjectInstances[T], properties);
    },
  };
};
