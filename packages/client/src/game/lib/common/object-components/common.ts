import {
  Component,
  ComponentUpdate,
  Metadata,
  QueryFragment,
  Schema,
  defineComponentSystem,
  defineEnterSystem,
  defineExitSystem,
  defineUpdateSystem,
  namespaceWorld,
} from "@latticexyz/recs";
import { Coord, uuid } from "@latticexyz/utils";
import { GameObjectComponent, GameObjectTypes, Scene } from "engine/types";
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

export const Tween = <T extends keyof GameObjectTypes>(
  scene: Scene,
  config: Partial<Phaser.Types.Tweens.TweenBuilderConfig>
): GameObjectComponent<T> => {
  let tween: Phaser.Tweens.Tween;
  return {
    id: uuid(),
    once: (gameObject) => {
      tween = scene.phaserScene.add.tween({
        targets: gameObject,
        ...config,
      });
    },
    exit: () => {
      tween.stop();
      tween.destroy();
    },
  };
};

export const OnComponentSystem = <
  T extends keyof GameObjectTypes,
  S extends Schema
>(
  component: Component<S, Metadata, undefined>,
  callback: (
    gameObject: GameObjectInstances[T],
    update: ComponentUpdate<S>
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

export const OnEnterSystem = <T extends keyof GameObjectTypes>(
  query: QueryFragment[],
  callback: (
    gameObject: GameObjectInstances[T],
    update: ComponentUpdate
  ) => void,
  options?: { runOnInit?: boolean }
): GameObjectComponent<T> => {
  const id = uuid();
  const entityWorld = namespaceWorld(world, id);
  return {
    id,
    once: (gameObject) => {
      defineEnterSystem(
        world,
        query,
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

export const OnUpdateSystem = <T extends keyof GameObjectTypes>(
  query: QueryFragment[],
  callback: (
    gameObject: GameObjectInstances[T],
    update: ComponentUpdate
  ) => void,
  options?: { runOnInit?: boolean }
): GameObjectComponent<T> => {
  const id = uuid();
  const entityWorld = namespaceWorld(world, id);
  return {
    id,
    once: (gameObject) => {
      defineUpdateSystem(
        world,
        query,
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

export const OnExitSystem = <T extends keyof GameObjectTypes>(
  query: QueryFragment[],
  callback: (
    gameObject: GameObjectInstances[T],
    update: ComponentUpdate
  ) => void,
  options?: { runOnInit?: boolean }
): GameObjectComponent<T> => {
  const id = uuid();
  const entityWorld = namespaceWorld(world, id);
  return {
    id,
    once: (gameObject) => {
      defineExitSystem(
        world,
        query,
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
