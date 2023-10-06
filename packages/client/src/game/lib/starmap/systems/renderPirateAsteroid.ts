import { Assets, DepthLayers, SpriteKeys } from "@game/constants";
import { SingletonID } from "@latticexyz/network";
import {
  EntityID,
  Has,
  HasValue,
  defineComponentSystem,
  defineEnterSystem,
  defineUpdateSystem,
  namespaceWorld,
} from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { Scene } from "engine/types";
import { AsteroidType, OwnedBy, P_SpawnPirateAsteroid, Pirate, Position } from "src/network/components/chainComponents";
import { Send } from "src/network/components/clientComponents";
import { world } from "src/network/world";
import { PIRATE_KEY } from "src/util/constants";
import { hashStringEntity } from "src/util/encode";
import { ESpaceRockType } from "src/util/web3/types";
import { ObjectPosition, OnClick, OnComponentSystem, SetValue } from "../../common/object-components/common";
import { Outline, Texture } from "../../common/object-components/sprite";

export const renderPirateAsteroid = (scene: Scene, player: EntityID) => {
  const { tileWidth, tileHeight } = scene.tilemap;
  const gameWorld = namespaceWorld(world, "game");

  const render = (entityId: EntityID, coord: Coord) => {
    scene.objectPool.removeGroup("asteroid_" + entityId);
    const asteroidType = AsteroidType.get(entityId)?.value;

    const ownedBy = OwnedBy.get(entityId, {
      value: SingletonID,
    }).value;

    if (hashStringEntity(PIRATE_KEY, player) !== ownedBy) return;

    if (asteroidType !== ESpaceRockType.Asteroid) return;
    const asteroidObjectGroup = scene.objectPool.getGroup("asteroid_" + entityId);

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
        Send.setDestination(entityId);
      }),
    ]);

    const outlineSprite = SpriteKeys[`Asteroid${ownedBy === player ? "Player" : "Enemy"}` as keyof typeof SpriteKeys];

    const asteroidOutline = asteroidObjectGroup.add("Sprite");

    asteroidOutline.setComponents([
      ...sharedComponents,
      OnComponentSystem(Send, () => {
        if (Send.get()?.destination === entityId) {
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
    Has(AsteroidType),
    HasValue(AsteroidType, {
      value: ESpaceRockType.Asteroid,
    }),
    Has(Position),
    Has(Pirate),
    Has(OwnedBy),
  ];

  defineEnterSystem(gameWorld, query, ({ entity }) => {
    const entityId = world.entities[entity];

    const coord = Position.get(entityId);

    if (!coord) return;

    render(entityId, coord);
  });

  defineUpdateSystem(gameWorld, query, ({ entity }) => {
    const entityId = world.entities[entity];

    const coord = Position.get(entityId);

    if (!coord) return;

    render(entityId, coord);
  });

  //remove or add if pirate asteroid is defeated
  defineComponentSystem(world, P_SpawnPirateAsteroid, ({ entity }) => {
    const entityId = world.entities[entity];
    if (!Pirate.has(entityId)) return;

    const coord = Position.get(entityId);

    if (!coord) return;

    render(entityId, coord);
  });
};
