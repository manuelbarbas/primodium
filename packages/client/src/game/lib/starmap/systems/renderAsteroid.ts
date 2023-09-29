import { Scene } from "engine/types";
import {
  namespaceWorld,
  Has,
  defineEnterSystem,
  HasValue,
  EntityID,
  Not,
} from "@latticexyz/recs";
import {
  ObjectPosition,
  OnClick,
  OnComponentSystem,
  SetValue,
} from "../../common/object-components/common";
import { Outline, Texture } from "../../common/object-components/sprite";
import {
  AsteroidType,
  Level,
  MainBase,
  OwnedBy,
  Pirate,
  Position,
} from "src/network/components/chainComponents";
import { world } from "src/network/world";
import { Send } from "src/network/components/clientComponents";
import { initializeMotherlodes } from "../utils/initializeMotherlodes";
import { ESpaceRockType } from "src/util/web3/types";
import { Coord } from "@latticexyz/utils";
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

    const asteroidObject = asteroidObjectGroup.add("Sprite");

    asteroidObject.setComponents([
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

    const asteroidOutline = asteroidObjectGroup.add("Sprite");

    asteroidOutline.setComponents([
      ...sharedComponents,
      OnComponentSystem(Send, () => {
        if (asteroidOutline.hasComponent(Outline().id)) {
          asteroidOutline.removeComponent(Outline().id);
        } else {
          if (Send.getDestination()?.entity !== entityId) return;
          asteroidOutline.setComponent(
            Outline({ thickness: 2, color: 0xffa500 })
          );
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
