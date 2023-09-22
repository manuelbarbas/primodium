import { Scene } from "engine/types";
import {
  namespaceWorld,
  Has,
  defineEnterSystem,
  defineComponentSystem,
  HasValue,
  EntityID,
} from "@latticexyz/recs";
import {
  ObjectPosition,
  OnClick,
  SetValue,
} from "../../common/object-components/common";
import { Texture } from "../../common/object-components/sprite";
import {
  AsteroidType,
  Level,
  MainBase,
  OwnedBy,
  Position,
  ReversePosition,
} from "src/network/components/chainComponents";
import { world } from "src/network/world";
import { Send } from "src/network/components/clientComponents";
import { initializeMotherlodes } from "../utils/initializeMotherlodes";
import { ESpaceRockType } from "src/util/web3/types";
import { Coord } from "@latticexyz/utils";
import { encodeAndTrimCoord } from "src/util/encode";
import { ActiveButton } from "src/util/types";
import {
  Assets,
  DepthLayers,
  EntityIDtoSpriteKey,
  SpriteKeys,
} from "@game/constants";
import { BlockType } from "src/util/constants";
import { clampedIndex } from "src/util/common";
import { SingletonID } from "@latticexyz/network";

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
      Texture(
        Assets.SpriteAtlas,
        EntityIDtoSpriteKey[BlockType.Asteroid][
          clampedIndex(
            mainBaseLevel - 1,
            EntityIDtoSpriteKey[BlockType.Asteroid].length
          )
        ]
      ),
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
  ];

  defineEnterSystem(gameWorld, query, ({ entity }) => {
    const entityId = world.entities[entity];

    const coord = Position.get(entityId);

    if (!coord) return;

    render(entityId, coord);
    initializeMotherlodes(entityId, coord);
  });

  defineComponentSystem(gameWorld, Send, ({ value: values }) => {
    values.map((value) => {
      [
        { x: value?.originX, y: value?.originY },
        { x: value?.destinationX, y: value?.destinationY },
      ].map((rawCoord) => {
        if (!rawCoord || !rawCoord.x || !rawCoord.y) return;
        const coord = { x: rawCoord.x, y: rawCoord.y };
        const entity = ReversePosition.get(encodeAndTrimCoord(coord))?.value;
        if (!entity) return;
        render(entity, coord);
      });
    });
  });
};
