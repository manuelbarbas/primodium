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

type SystemCallback<T extends keyof GameObjectTypes> = (
  gameObject: InstanceType<GameObjectTypes[T]>,
  update: ComponentUpdate<Schema>,
  systemId: string //manage callback lifecycle
) => void;

type ComponentSystemMap = Map<
  Component<Schema, Metadata, undefined>,
  Map<string, (update: ComponentUpdate<Schema>) => void>
>;

type QuerySystemMap = Map<
  QueryFragment[],
  Map<string, (update: ComponentUpdate<Schema>) => void>
>;

const gameWorld = namespaceWorld(world, "game");

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
  scene: Scene,
  callback: (
    gameObject?: GameObjectInstances[T],
    e?: Phaser.Input.Pointer
  ) => void,
  pixelPerfect = false
): GameObjectComponent<T> => {
  return {
    id: uuid(),
    once: (gameObject) => {
      if (pixelPerfect)
        gameObject.setInteractive(scene.input.phaserInput.makePixelPerfect());
      else gameObject.setInteractive();
      gameObject.on("pointerdown", (e: Phaser.Input.Pointer) => {
        if (e.downElement.nodeName !== "CANVAS") return;
        callback(gameObject as GameObjectInstances[T], e);
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

const componentMap: ComponentSystemMap = new Map();
export const OnComponentSystem = <
  T extends keyof GameObjectTypes,
  S extends Schema
>(
  component: Component<S, Metadata, undefined>,
  callback: SystemCallback<T>,
  options?: { runOnInit?: boolean }
): GameObjectComponent<T> => {
  const id = uuid();

  return {
    id,

    once: (gameObject) => {
      if (!componentMap.has(component)) {
        componentMap.set(component, new Map());

        defineComponentSystem(
          gameWorld,
          component,
          (update) => {
            const fnMap = componentMap.get(component);

            if (!fnMap) return;

            //run all functions for component
            for (const fn of fnMap.values()) {
              fn(update);
            }
          },
          options
        );
      }

      //subscribe to component updates
      componentMap
        .get(component)
        ?.set(id, (update) => callback(gameObject, update, id));
    },
    exit: () => {
      //unsub from component updates
      componentMap.get(component)?.delete(id);
    },
  };
};

const enterMap: QuerySystemMap = new Map();
export const OnEnterSystem = <T extends keyof GameObjectTypes>(
  query: QueryFragment[],
  callback: SystemCallback<T>,
  options?: { runOnInit?: boolean }
): GameObjectComponent<T> => {
  const id = uuid();

  return {
    id,
    once: (gameObject) => {
      if (!enterMap.has(query)) {
        enterMap.set(query, new Map());

        defineEnterSystem(
          gameWorld,
          query,
          (update) => {
            const fnMap = enterMap.get(query);

            if (!fnMap) return;

            //run all functions for component
            for (const fn of fnMap.values()) {
              fn(update);
            }
          },
          options
        );
      }
      //subscribe to component updates
      enterMap
        .get(query)
        ?.set(id, (update) => callback(gameObject, update, id));
    },
    exit: () => {
      //unsub from component updates
      enterMap.get(query)?.delete(id);
    },
  };
};

const updateMap: QuerySystemMap = new Map();
export const OnUpdateSystem = <T extends keyof GameObjectTypes>(
  query: QueryFragment[],
  callback: SystemCallback<T>,
  options?: { runOnInit?: boolean }
): GameObjectComponent<T> => {
  const id = uuid();

  return {
    id,
    once: (gameObject) => {
      if (!updateMap.has(query)) {
        updateMap.set(query, new Map());

        defineUpdateSystem(
          gameWorld,
          query,
          (update) => {
            const fnMap = updateMap.get(query);

            if (!fnMap) return;

            //run all functions for component
            for (const fn of fnMap.values()) {
              fn(update);
            }
          },
          options
        );
      }

      //subscribe to component updates
      updateMap
        .get(query)
        ?.set(id, (update) => callback(gameObject, update, id));
    },
    exit: () => {
      //unsub from component updates
      updateMap.get(query)?.delete(id);
    },
  };
};

const exitMap: QuerySystemMap = new Map();
export const OnExitSystem = <T extends keyof GameObjectTypes>(
  query: QueryFragment[],
  callback: SystemCallback<T>,
  options?: { runOnInit?: boolean }
): GameObjectComponent<T> => {
  const id = uuid();

  return {
    id,
    once: (gameObject) => {
      if (!exitMap.has(query)) {
        exitMap.set(query, new Map());

        defineExitSystem(
          gameWorld,
          query,
          (update) => {
            const fnMap = exitMap.get(query);

            if (!fnMap) return;

            //run all functions for component
            for (const fn of fnMap.values()) {
              fn(update);
            }
          },
          options
        );
      }

      //subscribe to component updates
      exitMap.get(query)?.set(id, (update) => callback(gameObject, update, id));
    },
    exit: () => {
      //unsub from component updates
      exitMap.get(query)?.delete(id);
    },
  };
};
