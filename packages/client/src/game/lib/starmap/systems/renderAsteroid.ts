import { Scene } from "engine/types";
import { namespaceWorld, defineEnterSystem, Entity, HasValue, Has } from "@latticexyz/recs";
import { ObjectPosition, OnComponentSystem, SetValue } from "../../common/object-components/common";
import { Texture } from "../../common/object-components/sprite";
import { singletonIndex, world } from "src/network/world";
// import { Send } from "src/network/components/clientComponents";
// import { initializeMotherlodes } from "../utils/initializeMotherlodes";

import { Coord } from "@latticexyz/utils";
import { Assets, DepthLayers, EntitytoSpriteKey, SpriteKeys } from "@game/constants";
import { EntityType } from "src/util/constants";
import { clampedIndex } from "src/util/common";
import { SetupResult } from "src/network/types";
import { components } from "src/network/components";
import { ERock } from "contracts/config/enums";
import { initializeMotherlodes } from "../utils/initializeMotherlodes";
import { getNow } from "src/util/time";

export const renderAsteroid = (scene: Scene, mud: SetupResult) => {
  const { tileWidth, tileHeight } = scene.tilemap;
  const gameWorld = namespaceWorld(world, "game");
  const playerEntity = mud.network.playerEntity;

  const render = (entity: Entity, coord: Coord) => {
    scene.objectPool.removeGroup("asteroid_" + entity);

    //TODO - fix conversion to Entity
    const ownedBy = components.OwnedBy.get(entity, {
      value: singletonIndex,
    }).value as Entity;

    const mainBaseEntity = components.Home.get(ownedBy, {
      mainBase: "-1" as Entity,
      asteroid: "-1" as Entity,
    }).mainBase as Entity;

    const mainBaseLevel = components.Level.get(mainBaseEntity, {
      value: 1n,
    }).value;

    const asteroidObjectGroup = scene.objectPool.getGroup("asteroid_" + entity);

    const sharedComponents = [
      ObjectPosition(
        {
          x: coord.x * tileWidth,
          y: -coord.y * tileHeight,
        },
        DepthLayers.Marker
      ),
      SetValue({
        originX: 0.5,
        originY: 0.5,
      }),
    ];

    const asteroidObject = asteroidObjectGroup.add("Sprite");

    asteroidObject.setComponents([
      ...sharedComponents,
      //fade out asteroids that are in grace period
      OnComponentSystem(components.BlockNumber, (gameObject) => {
        const graceTime = components.GracePeriod.get(playerEntity)?.value ?? 0n;
        const time = getNow();

        //don't fade out asteroids that are owned by the player
        if (components.OwnedBy.get(entity)?.value === playerEntity) return;

        if (time >= graceTime) {
          gameObject.alpha = 1;
        } else {
          gameObject.alpha = 0.25;
        }
      }),
      Texture(
        Assets.SpriteAtlas,
        EntitytoSpriteKey[EntityType.Asteroid][
          clampedIndex(Number(mainBaseLevel) - 1, EntitytoSpriteKey[EntityType.Asteroid].length)
        ]
      ),
      // OnClick(scene, () => {
      //   Send.setDestination(entityId);
      // }),
    ]);

    const outlineSprite =
      SpriteKeys[`Asteroid${ownedBy === playerEntity ? "Player" : "Enemy"}` as keyof typeof SpriteKeys];

    const asteroidOutline = asteroidObjectGroup.add("Sprite");

    asteroidOutline.setComponents([
      ...sharedComponents,
      // OnComponentSystem(Send, () => {
      //   if (Send.get()?.destination === entity) {
      //     if (asteroidOutline.hasComponent(Outline().id)) return;
      //     asteroidOutline.setComponent(Outline({ thickness: 1.5, color: 0xffa500 }));
      //     return;
      //   }

      //   if (asteroidOutline.hasComponent(Outline().id)) {
      //     asteroidOutline.removeComponent(Outline().id);
      //   }
      // }),
      Texture(Assets.SpriteAtlas, outlineSprite),
    ]);
  };

  const query = [
    HasValue(components.RockType, { value: ERock.Asteroid }),
    Has(components.Position),
    // Not(components.Pirate),
  ];

  defineEnterSystem(gameWorld, query, ({ entity }) => {
    const coord = components.Position.get(entity);

    if (!coord) return;

    render(entity, coord);
    initializeMotherlodes(entity, coord);
  });
};
