import { Entity, Has, HasValue, defineEnterSystem, namespaceWorld } from "@latticexyz/recs";
import { Scene } from "engine/types";
import { world } from "src/network/world";
import { MotherlodeSizeNames, MotherlodeTypeNames, RockRelationship } from "src/util/constants";
import { ObjectPosition, OnClick, OnComponentSystem, SetValue } from "../../common/object-components/common";
import { Outline, Texture } from "../../common/object-components/sprite";
import { Assets, DepthLayers, SpriteKeys } from "@game/constants";
import { Coord } from "@latticexyz/utils";
import { ERock, ESize } from "contracts/config/enums";
import { components } from "src/network/components";
import { SetupResult } from "src/network/types";
import { getRockRelationship } from "src/util/spacerock";

export const renderMotherlode = (scene: Scene, mud: SetupResult) => {
  const { tileWidth, tileHeight } = scene.tilemap;
  const playerEntity = mud.network.playerEntity;
  const gameWorld = namespaceWorld(world, "game");

  const render = (entity: Entity, coord: Coord) => {
    scene.objectPool.removeGroup("motherlode_" + entity);

    const motherlodeObjectGroup = scene.objectPool.getGroup("motherlode_" + entity);
    const motherlodeData = components.Motherlode.get(entity);

    if (!motherlodeData) throw new Error("motherlode data not found");

    const sprite =
      SpriteKeys[
        `Motherlode${MotherlodeTypeNames[motherlodeData.motherlodeType]}${
          MotherlodeSizeNames[motherlodeData.size]
        }` as keyof typeof SpriteKeys
      ];

    const sharedComponents = [
      ObjectPosition({
        x: coord.x * tileWidth,
        y: -coord.y * tileHeight,
      }),
      SetValue({
        originX: 0.5,
        originY: 0.5,
      }),
    ];

    motherlodeObjectGroup.add("Sprite").setComponents([
      ...sharedComponents,
      Texture(Assets.SpriteAtlas, sprite),
      SetValue({
        depth: DepthLayers.Rock,
      }),
    ]);

    const motherlodeOutline = motherlodeObjectGroup.add("Sprite");
    motherlodeOutline.setComponents([
      ...sharedComponents,
      Texture(Assets.SpriteAtlas, getOutlineSprite(playerEntity, entity, motherlodeData.size)),
      OnComponentSystem(components.Send, () => {
        if (components.Send.get()?.destination === entity) {
          if (motherlodeOutline.hasComponent(Outline().id)) return;
          motherlodeOutline.setComponent(Outline({ thickness: 1.5, color: 0xffa500 }));
          return;
        }
        if (motherlodeOutline.hasComponent(Outline().id)) {
          motherlodeOutline.removeComponent(Outline().id);
        }
      }),
      OnComponentSystem(components.OwnedBy, (_, { entity: _entity }) => {
        if (entity !== _entity) return;

        motherlodeOutline.setComponent(
          Texture(Assets.SpriteAtlas, getOutlineSprite(playerEntity, entity, motherlodeData.size))
        );
      }),
      OnComponentSystem(components.PlayerAlliance, (_, { entity: _entity }) => {
        const ownedBy = components.OwnedBy.get(entity)?.value;
        if (ownedBy !== _entity && playerEntity !== _entity) return;

        motherlodeOutline.setComponent(
          Texture(Assets.SpriteAtlas, getOutlineSprite(playerEntity, entity, motherlodeData.size))
        );
      }),
      OnClick(scene, () => {
        components.Send.setDestination(entity);
      }),
      SetValue({
        depth: DepthLayers.Rock + 1,
      }),
    ]);
  };

  const query = [Has(components.Position), HasValue(components.RockType, { value: ERock.Motherlode })];

  defineEnterSystem(gameWorld, query, ({ entity }) => {
    const coord = components.Position.get(entity);
    if (!coord) return;
    render(entity, coord);
  });
};

const getOutlineSprite = (playerEntity: Entity, rock: Entity, size: ESize) => {
  const rockRelationship = getRockRelationship(playerEntity, rock);

  return SpriteKeys[
    `Motherlode${
      {
        [RockRelationship.Ally]: "Alliance",
        [RockRelationship.Enemy]: "Enemy",
        [RockRelationship.Neutral]: "Neutral",
        [RockRelationship.Self]: "Player",
      }[rockRelationship]
    }${MotherlodeSizeNames[size]}` as keyof typeof SpriteKeys
  ];
};
