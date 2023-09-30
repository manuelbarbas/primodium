import { Scene } from "engine/types";
import {
  namespaceWorld,
  Has,
  defineEnterSystem,
  HasValue,
  EntityID,
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
  Motherlode,
  OwnedBy,
  Position,
} from "src/network/components/chainComponents";
import { world } from "src/network/world";
import { MotherlodeSizeNames, MotherlodeTypeNames } from "src/util/constants";
import { ESpaceRockType } from "src/util/web3/types";
import { Send } from "src/network/components/clientComponents";
import { Coord } from "@latticexyz/utils";
import { Assets, DepthLayers, SpriteKeys } from "@game/constants";

export const renderMotherlode = (scene: Scene, player: EntityID) => {
  const { tileWidth, tileHeight } = scene.tilemap;
  const gameWorld = namespaceWorld(world, "game");

  const render = (entityId: EntityID, coord: Coord) => {
    scene.objectPool.removeGroup("motherlode_" + entityId);

    const asteroidType = AsteroidType.get(entityId)?.value;
    if (asteroidType !== ESpaceRockType.Motherlode) return;

    const motherlodeObjectGroup = scene.objectPool.getGroup(
      "motherlode_" + entityId
    );
    const motherlodeData = Motherlode.get(entityId);
    if (!motherlodeData) throw new Error("motherlode data not found");

    const sprite =
      SpriteKeys[
        `Motherlode${MotherlodeTypeNames[motherlodeData.motherlodeType]}${
          MotherlodeSizeNames[motherlodeData.size]
        }` as keyof typeof SpriteKeys
      ];

    const sharedComponents = [
      ObjectPosition(
        {
          x: coord.x * tileWidth,
          y: -coord.y * tileHeight,
        },
        DepthLayers.Building
      ),
      // outline,
      SetValue({
        originX: 0.5,
        originY: 0.5,
      }),
    ];

    motherlodeObjectGroup.add("Sprite").setComponents([
      ...sharedComponents,
      Texture(Assets.SpriteAtlas, sprite),
      OnClick(() => {
        Send.setDestination(entityId);
      }),
    ]);

    const ownedBy = OwnedBy.get(entityId)?.value;

    const outlineSprite =
      SpriteKeys[
        `Motherlode${
          ownedBy ? (ownedBy === player ? "Player" : "Enemy") : "Neutral"
        }${MotherlodeSizeNames[motherlodeData.size]}` as keyof typeof SpriteKeys
      ];
    const motherlodeOutline = motherlodeObjectGroup.add("Sprite");
    motherlodeOutline.setComponents([
      ...sharedComponents,
      Texture(Assets.SpriteAtlas, outlineSprite),
      OnComponentSystem(Send, () => {
        if (Send.get()?.destination === entityId) {
          if (motherlodeOutline.hasComponent(Outline().id)) return;
          motherlodeOutline.setComponent(
            Outline({ thickness: 1.5, color: 0xffa500 })
          );
          return;
        }

        if (motherlodeOutline.hasComponent(Outline().id)) {
          motherlodeOutline.removeComponent(Outline().id);
        }
      }),
      OnComponentSystem(OwnedBy, (_, { entity }) => {
        if (world.entities[entity] !== entityId) return;
        const ownedBy = OwnedBy.get(entityId)?.value;

        const outlineSprite =
          SpriteKeys[
            `Motherlode${
              ownedBy ? (ownedBy === player ? "Player" : "Enemy") : "Neutral"
            }${
              MotherlodeSizeNames[motherlodeData.size]
            }` as keyof typeof SpriteKeys
          ];

        motherlodeOutline.setComponent(
          Texture(Assets.SpriteAtlas, outlineSprite)
        );
      }),
    ]);
  };

  const query = [
    Has(AsteroidType),
    Has(Position),
    HasValue(AsteroidType, { value: ESpaceRockType.Motherlode }),
  ];

  defineEnterSystem(gameWorld, query, ({ entity }) => {
    const entityId = world.entities[entity];
    const coord = Position.get(entityId);
    if (!coord) return;
    render(entityId, coord);
  });
};
