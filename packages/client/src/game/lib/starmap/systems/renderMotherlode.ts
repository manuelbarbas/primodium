import { Scene } from "engine/types";
import { namespaceWorld, Has, defineEnterSystem, HasValue, Entity } from "@latticexyz/recs";
import { ObjectPosition, OnClick, OnComponentSystem, SetValue } from "../../common/object-components/common";
import { Texture } from "../../common/object-components/sprite";
import { world } from "src/network/world";
import { MotherlodeSizeNames, MotherlodeTypeNames } from "src/util/constants";
// import { Send } from "src/network/components/clientComponents";
import { Coord } from "@latticexyz/utils";
import { Assets, DepthLayers, SpriteKeys } from "@game/constants";
import { SetupResult } from "src/network/types";
import { components } from "src/network/components";
import { ERock } from "contracts/config/enums";

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
      OnClick(scene, () => {
        // Send.setDestination(entityId);
      }),
    ]);

    const ownedBy = components.OwnedBy.get(entity)?.value;

    const outlineSprite =
      SpriteKeys[
        `Motherlode${ownedBy ? (ownedBy === playerEntity ? "Player" : "Enemy") : "Neutral"}${
          MotherlodeSizeNames[motherlodeData.size]
        }` as keyof typeof SpriteKeys
      ];
    const motherlodeOutline = motherlodeObjectGroup.add("Sprite");
    motherlodeOutline.setComponents([
      ...sharedComponents,
      Texture(Assets.SpriteAtlas, outlineSprite),
      // OnComponentSystem(components.Send, () => {
      // if (Send.get()?.destination === entityId) {
      //   if (motherlodeOutline.hasComponent(Outline().id)) return;
      //   motherlodeOutline.setComponent(Outline({ thickness: 1.5, color: 0xffa500 }));
      //   return;
      // }
      // if (motherlodeOutline.hasComponent(Outline().id)) {
      //   motherlodeOutline.removeComponent(Outline().id);
      // }
      // }),
      OnComponentSystem(components.OwnedBy, (_, { entity: _entity }) => {
        if (entity === _entity) return;
        const ownedBy = components.OwnedBy.get(_entity)?.value;

        const outlineSprite =
          SpriteKeys[
            `Motherlode${ownedBy ? (ownedBy === playerEntity ? "Player" : "Enemy") : "Neutral"}${
              MotherlodeSizeNames[motherlodeData.size]
            }` as keyof typeof SpriteKeys
          ];

        motherlodeOutline.setComponent(Texture(Assets.SpriteAtlas, outlineSprite));
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
