import { Scene } from "engine/types";
import {
  namespaceWorld,
  Has,
  defineEnterSystem,
  HasValue,
  EntityID,
  defineComponentSystem,
} from "@latticexyz/recs";
import {
  ObjectPosition,
  OnClick,
  SetValue,
} from "../../common/object-components/common";
import { Texture } from "../../common/object-components/sprite";
import {
  AsteroidType,
  DefeatedSpawnedPirateAsteroid,
  OwnedBy,
  Pirate,
  Position,
} from "src/network/components/chainComponents";
import { world } from "src/network/world";
import { Send } from "src/network/components/clientComponents";
import { ESpaceRockType } from "src/util/web3/types";
import { Coord } from "@latticexyz/utils";
import { ActiveButton } from "src/util/types";
import { Assets, DepthLayers, SpriteKeys } from "@game/constants";
import { SingletonID } from "@latticexyz/network";

export const renderPirateAsteroid = (scene: Scene, player: EntityID) => {
  const { tileWidth, tileHeight } = scene.tilemap;
  const gameWorld = namespaceWorld(world, "game");

  const render = (entityId: EntityID, coord: Coord) => {
    scene.objectPool.removeGroup("asteroid_" + entityId);
    const asteroidType = AsteroidType.get(entityId)?.value;

    const ownedBy = OwnedBy.get(entityId, {
      value: SingletonID,
    }).value;

    if (asteroidType !== ESpaceRockType.Asteroid) return;
    const asteroidObjectGroup = scene.objectPool.getGroup(
      "asteroid_" + entityId
    );

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
      OnClick(() => {
        const activeButton = Send.get()?.activeButton ?? ActiveButton.NONE;
        if (activeButton === ActiveButton.ORIGIN) {
          Send.setOrigin(coord);
        } else if (
          activeButton === ActiveButton.DESTINATION ||
          activeButton === ActiveButton.NONE
        ) {
          Send.setDestination(coord);
        }
        Send.update({ activeButton: ActiveButton.NONE });
      }),
    ]);

    const outlineSprite =
      SpriteKeys[
        `Asteroid${
          ownedBy === player ? "Player" : "Enemy"
        }` as keyof typeof SpriteKeys
      ];

    asteroidObjectGroup
      .add("Sprite")
      .setComponents([
        ...sharedComponents,
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
  ];

  defineEnterSystem(gameWorld, query, ({ entity }) => {
    const entityId = world.entities[entity];

    const coord = Position.get(entityId);

    if (!coord) return;

    render(entityId, coord);
  });

  //remove or add if pirate asteroid is defeated
  defineComponentSystem(world, DefeatedSpawnedPirateAsteroid, ({ entity }) => {
    const entityId = world.entities[entity];
    const defeated = DefeatedSpawnedPirateAsteroid.get(entityId, {
      value: false,
    });

    if (defeated) {
      scene.objectPool.removeGroup("asteroid_" + entityId);
      return;
    }

    const coord = Position.get(entityId);

    if (!coord) return;

    render(entityId, coord);
  });
};
