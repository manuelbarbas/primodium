import {
  Component,
  ComponentUpdate,
  Metadata,
  Schema,
  defineComponentSystem,
  namespaceWorld,
} from "@latticexyz/recs";
import { Coord, uuid } from "@latticexyz/utils";
import { GameObjectComponent, GameObjectTypes } from "engine/types";
import { world } from "src/network/world";

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

export const OnClick = <T extends keyof GameObjectTypes>(
  callback: (gameObject?: GameObjectInstances[T]) => void
): GameObjectComponent<T> => {
  return {
    id: uuid(),
    once: (gameObject) => {
      gameObject.setInteractive();
      gameObject.on("pointerdown", () => {
        callback(gameObject as GameObjectInstances[T]);
      });
    },
  };
};

export const OnHover = <T extends keyof GameObjectTypes>(
  callback: (gameObject?: GameObjectInstances[T]) => void
): GameObjectComponent<T> => {
  return {
    id: uuid(),
    once: (gameObject) => {
      gameObject.setInteractive();
      gameObject.on("pointerover", () => {
        callback(gameObject as GameObjectInstances[T]);
      });
    },
  };
};

export const OnComponentUpdate = <T extends keyof GameObjectTypes>(
  component: Component<Schema, Metadata, undefined>,
  callback: (
    gameObject: GameObjectInstances[T],
    update: ComponentUpdate<Schema>
  ) => void,
  options?: { runOnInit?: boolean }
): GameObjectComponent<T> => {
  const id = uuid();
  const entityWorld = namespaceWorld(world, id);
  return {
    id,
    once: (gameObject) => {
      defineComponentSystem(
        entityWorld,
        component,
        (update) => {
          callback(gameObject as GameObjectInstances[T], update);
        },
        options
      );
    },
    exit: () => {
      entityWorld.dispose();
    },
  };
};
