import { Scene } from "engine/types";
import { namespaceWorld, Has, defineEnterSystem, Entity } from "@latticexyz/recs";
import { ObjectPosition, SetValue } from "../../common/object-components/common";
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
import { MUDEnums } from "contracts/config/enums";

export const renderAsteroid = (scene: Scene, mud: SetupResult) => {
  const { tileWidth, tileHeight } = scene.tilemap;
  const gameWorld = namespaceWorld(world, "game");
  const playerEntity = mud.network.playerEntity;

  const render = (entity: Entity, coord: Coord) => {
    scene.objectPool.removeGroup("asteroid_" + entity);
    const asteroidType =
      MUDEnums.ERock[
        components.RockType.get(entity, {
          value: 1,
        }).value
      ];

    if (asteroidType !== MUDEnums.ERock[1]) return;

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
    Has(components.RockType),
    // Not(components.Pirate),
  ];

  defineEnterSystem(gameWorld, query, ({ entity }) => {
    const coord = components.Position.get(entity);

    if (!coord) return;

    render(entity, coord);
    // initializeMotherlodes(entity, coord);
  });
};
