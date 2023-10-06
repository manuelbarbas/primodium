import { Assets, DepthLayers, EntityIDtoSpriteKey, SpriteKeys } from "@game/constants";
import { SingletonID } from "@latticexyz/network";
import { EntityID, Has, HasValue, Not, defineEnterSystem, namespaceWorld } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { Scene } from "engine/types";
import { AsteroidType, Level, MainBase, OwnedBy, Pirate, Position } from "src/network/components/chainComponents";
import { Send } from "src/network/components/clientComponents";
import { world } from "src/network/world";
import { clampedIndex } from "src/util/common";
import { BlockType } from "src/util/constants";
import { ESpaceRockType } from "src/util/web3/types";
import { ObjectPosition, OnClick, OnComponentSystem, SetValue } from "../../common/object-components/common";
import { Outline, Texture } from "../../common/object-components/sprite";
import { initializeMotherlodes } from "../utils/initializeMotherlodes";

export const renderAsteroid = (scene: Scene, player: EntityID) => {
  const { tileWidth, tileHeight } = scene.tilemap;
  const gameWorld = namespaceWorld(world, "game");

  const render = (entityId: EntityID, coord: Coord) => {
    scene.objectPool.removeGroup("asteroid_" + entityId);
    const asteroidType = AsteroidType.get(entityId)?.value;

    const ownedBy = OwnedBy.get(entityId, {
      value: SingletonID,
    }).value;

    const mainBaseEntity = MainBase.get(ownedBy, {
      value: "-1" as EntityID,
    }).value;

    const mainBaseLevel = Level.get(mainBaseEntity, {
      value: 1,
    }).value;

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

    const asteroidObject = asteroidObjectGroup.add("Sprite");

    asteroidObject.setComponents([
      ...sharedComponents,
      Texture(
        Assets.SpriteAtlas,
        EntityIDtoSpriteKey[BlockType.Asteroid][
          clampedIndex(mainBaseLevel - 1, EntityIDtoSpriteKey[BlockType.Asteroid].length)
        ]
      ),
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
    Not(Pirate),
  ];

  defineEnterSystem(gameWorld, query, ({ entity }) => {
    const entityId = world.entities[entity];

    const coord = Position.get(entityId);

    if (!coord) return;

    render(entityId, coord);
    initializeMotherlodes(entityId, coord);
  });
};
