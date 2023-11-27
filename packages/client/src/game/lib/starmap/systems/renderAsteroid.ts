import { Entity, Has, HasValue, Not, defineEnterSystem, namespaceWorld } from "@latticexyz/recs";
import { Scene } from "engine/types";
import { singletonIndex, world } from "src/network/world";
import { ObjectPosition, OnClick, OnComponentSystem, SetValue, Tween } from "../../common/object-components/common";
import { Outline, Texture } from "../../common/object-components/sprite";

import { Assets, DepthLayers, EntitytoSpriteKey, SpriteKeys } from "@game/constants";
import { Coord } from "@latticexyz/utils";
import { ERock } from "contracts/config/enums";
import { components } from "src/network/components";
import { SetupResult } from "src/network/types";
import { clampedIndex, entityToAddress, getRandomRange, shortenAddress } from "src/util/common";
import { EntityType, RockRelationship } from "src/util/constants";
import { getNow } from "src/util/time";
import { initializeMotherlodes } from "../utils/initializeMotherlodes";
import { getRockRelationship } from "src/util/spacerock";
import { ObjectText } from "../../common/object-components/text";
import { Hex } from "viem";

export const renderAsteroid = (scene: Scene, mud: SetupResult) => {
  const { tileWidth, tileHeight } = scene.tilemap;
  const gameWorld = namespaceWorld(world, "game");
  const playerEntity = mud.network.playerEntity;

  const render = (entity: Entity, coord: Coord) => {
    scene.objectPool.removeGroup("asteroid_" + entity);

    //TODO - fix conversion to Entity
    const ownedBy = components.OwnedBy.get(entity, {
      value: singletonIndex,
    }).value as Entity;

    const mainBaseEntity = components.Home.get(ownedBy, {
      mainBase: "-1" as Entity,
      asteroid: "-1" as Entity,
    }).mainBase as Entity;

    const mainBaseLevel = components.Level.get(mainBaseEntity, {
      value: 1n,
    }).value;

    const asteroidObjectGroup = scene.objectPool.getGroup("asteroid_" + entity);

    const sharedComponents = [
      ObjectPosition({
        x: coord.x * tileWidth,
        y: -coord.y * tileHeight,
      }),
      SetValue({
        originX: 0.5,
        originY: 0.5,
        scale: 1.5,
      }),
      Tween(scene, {
        scale: { from: 1.5 - getRandomRange(0, 0.05), to: 1.5 + getRandomRange(0, 0.05) },
        ease: "Sine.easeInOut",
        hold: getRandomRange(0, 1000),
        duration: 5000, // Duration of one wobble
        yoyo: true, // Go back to original scale
        repeat: -1, // Repeat indefinitely
      }),
      Tween(scene, {
        rotation: { from: -getRandomRange(0, Math.PI / 8), to: getRandomRange(0, Math.PI / 8) },
        // ease: "Sine.easeInOut",
        hold: getRandomRange(0, 10000),
        duration: 5 * 1000, // Duration of one wobble
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

    const asteroidObject = asteroidObjectGroup.add("Sprite");

    asteroidObject.setComponents([
      ...sharedComponents,
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
    asteroidOutline.setComponents([
      ...sharedComponents,
      OnComponentSystem(components.Send, () => {
        if (components.Send.get()?.destination === entity) {
          if (asteroidOutline.hasComponent(Outline().id)) return;
          asteroidOutline.setComponent(Outline({ thickness: 1.5, color: 0xffa500 }));
          return;
        }

        if (asteroidOutline.hasComponent(Outline().id)) {
          asteroidOutline.removeComponent(Outline().id);
        }
      }),
      OnComponentSystem(components.PlayerAlliance, (_, { entity: _entity }) => {
        if (ownedBy !== _entity && playerEntity !== _entity) return;

        asteroidOutline.setComponent(Texture(Assets.SpriteAtlas, getOutlineSprite(playerEntity, entity)));
      }),
      Texture(Assets.SpriteAtlas, getOutlineSprite(playerEntity, entity)),
      OnClick(scene, () => {
        components.Send.setDestination(entity);
      }),
      SetValue({
        depth: DepthLayers.Rock + 1,
      }),
    ]);

    const gracePeriod = asteroidObjectGroup.add("Sprite");

    gracePeriod.setComponents([
      ...sharedComponents,
      OnComponentSystem(components.BlockNumber, (gameObject) => {
        const player = components.OwnedBy.get(entity)?.value as Entity | undefined;
        const graceTime = components.GracePeriod.get(player)?.value ?? 0n;
        const time = getNow();

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

    const asteroidLabel = asteroidObjectGroup.add("Text");

    asteroidLabel.setComponents([
      ...sharedComponents,
      SetValue({
        originX: 0.5,
        originY: -3,
      }),
      ObjectText(shortenAddress(entityToAddress(ownedBy) as Hex), {
        backgroundColor: "#000000",
        color: "cyan",
        fontSize: 8,
      }),
    ]);
  };

  const query = [
    Has(components.RockType),
    HasValue(components.RockType, { value: ERock.Asteroid }),
    Has(components.Position),
    Has(components.OwnedBy),
    Not(components.PirateAsteroid),
  ];

  defineEnterSystem(gameWorld, query, ({ entity }) => {
    const coord = components.Position.get(entity);

    if (!coord) return;

    render(entity, coord);
    initializeMotherlodes(entity, coord);
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
