import { Assets, DepthLayers, SpriteKeys } from "@game/constants";
import {
  Entity,
  Has,
  HasValue,
  defineComponentSystem,
  defineEnterSystem,
  defineUpdateSystem,
  namespaceWorld,
} from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { Coord } from "@latticexyz/utils";
import { ERock } from "contracts/config/enums";
import { Scene } from "engine/types";
import { components } from "src/network/components";
import { world } from "src/network/world";
import { PIRATE_KEY } from "src/util/constants";
import { hashKeyEntity } from "src/util/encode";
import { ObjectPosition, OnClick, OnComponentSystem, SetValue } from "../../common/object-components/common";
import { Outline, Texture } from "../../common/object-components/sprite";

export const renderPirateAsteroid = (scene: Scene, player: Entity) => {
  const { tileWidth, tileHeight } = scene.tilemap;
  const gameWorld = namespaceWorld(world, "game");

  const render = (entity: Entity, coord: Coord) => {
    scene.objectPool.removeGroup("asteroid_" + entity);
    const asteroidType = components.RockType.get(entity)?.value;

    const ownedBy = components.OwnedBy.get(entity, {
      value: singletonEntity,
    }).value;

    console.log("ownedby:", ownedBy, hashKeyEntity(PIRATE_KEY, player));
    if (hashKeyEntity(PIRATE_KEY, player) !== ownedBy) return;
    console.log("string entity correct");

    if (asteroidType !== ERock.Asteroid) return;
    console.log("asteroid type correct");
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

    asteroidObjectGroup.add("Sprite").setComponents([
      ...sharedComponents,
      Texture(Assets.SpriteAtlas, SpriteKeys.PirateAsteroid1),
      OnClick(scene, () => {
        components.Send.setDestination(entity);
      }),
    ]);

    const outlineSprite = SpriteKeys[`Asteroid${ownedBy === player ? "Player" : "Enemy"}` as keyof typeof SpriteKeys];

    const asteroidOutline = asteroidObjectGroup.add("Sprite");

    asteroidOutline.setComponents([
      ...sharedComponents,
      OnComponentSystem(components.Send, () => {
        if (components.Send.get()?.destination === entity) {
          if (asteroidOutline.hasComponent(Outline().id)) return;
          asteroidOutline.setComponent(Outline({ thickness: 1.5, color: 0xffa500 }));
          return;
        }

        if (asteroidOutline.hasComponent(Outline().id)) {
          asteroidOutline.removeComponent(Outline().id);
        }
      }),
      Texture(Assets.SpriteAtlas, outlineSprite),
    ]);
  };

  const query = [
    Has(components.RockType),
    HasValue(components.RockType, {
      value: ERock.Asteroid,
    }),
    Has(components.Position),
    Has(components.PirateAsteroid),
    Has(components.OwnedBy),
  ];

  defineEnterSystem(gameWorld, query, ({ entity }) => {
    const coord = components.Position.get(entity);

    if (!coord) return;

    render(entity, coord);
  });

  defineUpdateSystem(gameWorld, query, ({ entity }) => {
    const coord = components.Position.get(entity);

    if (!coord) return;

    render(entity, coord);
  });

  //remove or add if pirate asteroid is defeated
  defineComponentSystem(world, components.PirateAsteroid, ({ entity }) => {
    console.log("rendering pirate asteroid");

    const coord = components.Position.get(entity);

    if (!coord) return;
    console.log("has position");

    render(entity, coord);
  });
};
