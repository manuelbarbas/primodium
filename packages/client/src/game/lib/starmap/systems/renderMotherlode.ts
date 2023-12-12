import { Entity, Has, HasValue, defineEnterSystem, namespaceWorld } from "@latticexyz/recs";
import { Scene } from "engine/types";
import { world } from "src/network/world";
import { MotherlodeSizeNames, MotherlodeTypeNames, RockRelationship } from "src/util/constants";
import {
  ObjectPosition,
  OnClick,
  OnComponentSystem,
  OnRxjsSystem,
  SetValue,
  Tween,
} from "../../common/object-components/common";
import { Outline, Texture } from "../../common/object-components/sprite";
import { Assets, DepthLayers, SpriteKeys } from "@game/constants";
import { Coord } from "@latticexyz/utils";
import { ERock, ESize } from "contracts/config/enums";
import { components } from "src/network/components";
import { SetupResult } from "src/network/types";
import { getRockRelationship } from "src/util/spacerock";
import { getRandomRange } from "src/util/common";
import { entityToRockName } from "src/util/name";
import { ObjectText } from "../../common/object-components/text";
import { throttleTime } from "rxjs";

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

    const spriteScale = getSpriteScale(motherlodeData.size);

    const sharedComponents = [
      ObjectPosition({
        x: coord.x * tileWidth,
        y: -coord.y * tileHeight,
      }),
      SetValue({
        originX: 0.5,
        originY: 0.5,
        scale: spriteScale,
      }),
      Tween(scene, {
        scale: { from: spriteScale - getRandomRange(0, 0.05), to: spriteScale + getRandomRange(0, 0.05) },
        ease: "Sine.easeInOut",
        hold: getRandomRange(0, 1000),
        duration: 5000, // Duration of one wobble
        yoyo: true, // Go back to original scale
        repeat: -1, // Repeat indefinitely
      }),
      Tween(scene, {
        scrollFactorX: { from: 1 - getRandomRange(0, 0.005), to: 1 + getRandomRange(0, 0.005) },
        ease: "Sine.easeInOut",
        hold: getRandomRange(0, 1000),
        duration: 3000, // Duration of one wobble
        yoyo: true, // Go back to original scale
        repeat: -1, // Repeat indefinitely
      }),
      Tween(scene, {
        scrollFactorY: { from: 1 - getRandomRange(0, 0.005), to: 1 + getRandomRange(0, 0.005) },
        ease: "Sine.easeInOut",
        hold: getRandomRange(0, 1000),
        duration: 5000, // Duration of one wobble
        yoyo: true, // Go back to original scale
        repeat: -1, // Repeat indefinitely
      }),
    ];

    const rotationTween = Tween(scene, {
      rotation: { from: -getRandomRange(0, Math.PI / 8), to: getRandomRange(0, Math.PI / 8) },
      // ease: "Sine.easeInOut",
      hold: getRandomRange(0, 10000),
      duration: 5 * 1000, // Duration of one wobble
      yoyo: true, // Go back to original scale
      repeat: -1, // Repeat indefinitely
    });

    const motherlodeObject = motherlodeObjectGroup.add("Sprite");

    motherlodeObject.setComponents([
      ...sharedComponents,
      rotationTween,
      Texture(Assets.SpriteAtlas, sprite),
      SetValue({
        depth: DepthLayers.Rock,
      }),
    ]);

    const motherlodeOutline = motherlodeObjectGroup.add("Sprite");
    motherlodeOutline.setComponents([
      ...sharedComponents,
      rotationTween,
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
        components.SelectedRock.set({ value: entity });
      }),
      SetValue({
        depth: DepthLayers.Rock + 1,
      }),
    ]);

    const motherlodeLabel = motherlodeObjectGroup.add("BitmapText");

    motherlodeLabel.setComponents([
      ...sharedComponents,
      SetValue({
        originX: 0.5,
        originY: -3,
        depth: DepthLayers.Marker,
        alpha: 0.5,
      }),
      ObjectText(entityToRockName(entity), {
        id: "addressLabel",
        fontSize: Math.max(8, Math.min(24, 16 / scene.camera.phaserCamera.zoom)),
        color: 0xffffff,
      }),
      OnRxjsSystem(
        // @ts-ignore
        scene.camera.zoom$.pipe(throttleTime(10)),
        (gameObject, zoom) => {
          const mapOpen = components.MapOpen.get()?.value ?? false;

          if (!mapOpen) return;

          const size = Math.max(8, Math.min(24, 16 / zoom));

          gameObject.setFontSize(size);
        }
      ),
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

const getSpriteScale = (size: ESize) => {
  switch (size) {
    case ESize.Small:
      return 0.6;
    case ESize.Medium:
      return 0.8;
    case ESize.Large:
      return 1;
  }
};
