import { Assets, DepthLayers, EntitytoSpriteKey, SpriteKeys } from "@game/constants";
import { Entity, Has, Not, defineEnterSystem, namespaceWorld } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { Scene } from "engine/types";
import { throttleTime } from "rxjs";
import { components } from "src/network/components";
import { world } from "src/network/world";
import { entityToColor } from "src/util/color";
import { clampedIndex, getRandomRange } from "src/util/common";
import { EntityType, RockRelationship } from "src/util/constants";
import { entityToPlayerName } from "src/util/name";
import { getRockRelationship } from "src/util/spacerock";
import { getEnsName } from "src/util/web3/getEnsName";
import {
  ObjectPosition,
  OnClick,
  OnComponentSystem,
  OnHover,
  OnOnce,
  OnRxjsSystem,
  SetValue,
  Tween,
} from "../../common/object-components/common";
import { Outline, Texture } from "../../common/object-components/sprite";
import { ObjectText } from "../../common/object-components/text";
import { initializeSecondaryAsteroids } from "./utils/initializeSecondaryAsteroids";

export const renderAsteroid = (scene: Scene) => {
  const { tileWidth, tileHeight } = scene.tilemap;
  const systemsWorld = namespaceWorld(world, "systems");

  const render = (entity: Entity, coord: Coord) => {
    scene.objectPool.removeGroup("asteroid_" + entity);

    const asteroidData = components.Asteroid.get(entity);
    if (!asteroidData) throw new Error("Asteroid data not found");

    const ownedBy = components.OwnedBy.get(entity)?.value as Entity | undefined;

    const homeAsteroid = ownedBy ? components.Home.get(ownedBy)?.value : undefined;
    const mainBase = components.Home.get(homeAsteroid as Entity)?.value;

    const mainBaseLevel = mainBase ? components.Level.get(mainBase as Entity)?.value ?? 1n : 1n;

    const asteroidObjectGroup = scene.objectPool.getGroup("asteroid_" + entity);

    const spriteScale = 0.34 + 0.05 * Number(asteroidData.maxLevel);

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
        scrollFactorX: { from: 1 - getRandomRange(0, 0.0025), to: 1 + getRandomRange(0, 0.0025) },
        ease: "Sine.easeInOut",
        hold: getRandomRange(0, 1000),
        duration: 5000, // Duration of one wobble
        yoyo: true, // Go back to original scale
        repeat: -1, // Repeat indefinitely
      }),
      Tween(scene, {
        scrollFactorY: { from: 1 - getRandomRange(0, 0.0025), to: 1 + getRandomRange(0, 0.0025) },
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

    const asteroidObject = asteroidObjectGroup.add("Sprite");

    asteroidObject.setComponents([
      ...sharedComponents,
      rotationTween,
      Texture(
        Assets.SpriteAtlas,
        EntitytoSpriteKey[EntityType.Asteroid][
          clampedIndex(Number(mainBaseLevel) - 1, EntitytoSpriteKey[EntityType.Asteroid].length)
        ]
      ),
      SetValue({
        depth: DepthLayers.Rock,
      }),
    ]);

    const asteroidOutline = asteroidObjectGroup.add("Sprite");
    const playerEntity = components.Account.get()?.value;
    asteroidOutline.setComponents([
      ...sharedComponents,
      rotationTween,
      OnComponentSystem(components.SelectedRock, () => {
        if (components.SelectedRock.get()?.value === entity) {
          if (asteroidOutline.hasComponent(Outline().id)) return;
          asteroidOutline.setComponent(Outline({ thickness: 1.5, color: 0xffa500 }));
          return;
        }

        if (asteroidOutline.hasComponent(Outline().id)) {
          asteroidOutline.removeComponent(Outline().id);
        }
      }),
      OnComponentSystem(components.PlayerAlliance, (_, { entity: _entity }) => {
        const playerEntity = components.Account.get()?.value;
        if (!playerEntity || (ownedBy !== _entity && playerEntity !== _entity)) return;

        asteroidOutline.setComponent(Texture(Assets.SpriteAtlas, getOutlineSprite(playerEntity, entity)));
      }),
      playerEntity ? Texture(Assets.SpriteAtlas, getOutlineSprite(playerEntity, entity)) : undefined,
      OnClick(scene, () => {
        components.Send.setDestination(entity);
        components.SelectedRock.set({ value: entity });
      }),
      OnHover(
        () => {
          components.HoverEntity.set({ value: entity });
        },
        () => {
          components.HoverEntity.remove();
        }
      ),
      SetValue({
        depth: DepthLayers.Rock + 1,
      }),
    ]);

    const gracePeriod = asteroidObjectGroup.add("Sprite");

    gracePeriod.setComponents([
      ...sharedComponents,
      rotationTween,
      OnComponentSystem(components.Time, (gameObject) => {
        const player = components.OwnedBy.get(entity)?.value as Entity | undefined;
        const graceTime = components.GracePeriod.get(player)?.value ?? 0n;
        const time = components.Time.get()?.value ?? 0n;

        if (time >= graceTime) {
          gameObject.alpha = 0;
        } else {
          gameObject.alpha = 0.8;
        }
      }),
      Texture(Assets.SpriteAtlas, SpriteKeys.GracePeriod),
      SetValue({
        depth: DepthLayers.Marker,
        input: null,
      }),
    ]);

    const asteroidLabel = asteroidObjectGroup.add("BitmapText");

    asteroidLabel.setComponents([
      ...sharedComponents,
      SetValue({
        originX: 0.5,
        originY: -3,
        depth: DepthLayers.Marker,
      }),
      ObjectText(entityToPlayerName(ownedBy), {
        id: "addressLabel",
        fontSize: Math.max(8, Math.min(44, 16 / scene.camera.phaserCamera.zoom)),
        color: parseInt(entityToColor(ownedBy).slice(1), 16),
      }),
      OnOnce(async (gameObject) => {
        const ensNameData = await getEnsName(ownedBy);
        const name = ensNameData.ensName ?? entityToPlayerName(ownedBy);

        gameObject.setText(name);
        gameObject.setFontSize(Math.max(8, Math.min(44, 16 / scene.camera.phaserCamera.zoom)));
      }),
      OnRxjsSystem(
        // @ts-ignore
        scene.camera.zoom$.pipe(throttleTime(10)),
        (gameObject, zoom) => {
          const mapOpen = components.MapOpen.get()?.value ?? false;

          if (!mapOpen) return;

          const size = Math.max(8, Math.min(44, 16 / zoom));

          gameObject.setFontSize(size);
        }
      ),
    ]);
  };

  const query = [Has(components.Asteroid), Has(components.Position), Not(components.PirateAsteroid)];

  defineEnterSystem(systemsWorld, query, ({ entity }) => {
    const coord = components.Position.get(entity);
    const asteroidData = components.Asteroid.get(entity);

    if (!coord) return;

    render(entity, coord);
    if (asteroidData?.spawnsSecondary) initializeSecondaryAsteroids(entity, coord);
  });
};

const getOutlineSprite = (playerEntity: Entity, rock: Entity) => {
  const rockRelationship = getRockRelationship(playerEntity, rock);

  return SpriteKeys[
    `Asteroid${
      {
        [RockRelationship.Ally]: "Alliance",
        [RockRelationship.Enemy]: "Enemy",
        [RockRelationship.Neutral]: "Enemy",
        [RockRelationship.Self]: "Player",
      }[rockRelationship]
    }` as keyof typeof SpriteKeys
  ];
};
