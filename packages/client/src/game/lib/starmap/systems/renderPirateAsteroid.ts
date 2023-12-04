import { Assets, DepthLayers, SpriteKeys } from "@game/constants";
import {
  Entity,
  Has,
  HasValue,
  defineComponentSystem,
  defineEnterSystem,
  defineUpdateSystem,
  namespaceWorld,
} from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { Coord } from "@latticexyz/utils";
import { ERock } from "contracts/config/enums";
import { Scene } from "engine/types";
import { components } from "src/network/components";
import { world } from "src/network/world";
import { PIRATE_KEY } from "src/util/constants";
import { ObjectPosition, OnClick, OnComponentSystem, SetValue, Tween } from "../../common/object-components/common";
import { decodeEntity, hashKeyEntity } from "src/util/encode";
import { Outline, Texture } from "../../common/object-components/sprite";
import { ObjectText } from "../../common/object-components/text";
import { getRandomRange } from "src/util/common";

export const renderPirateAsteroid = (scene: Scene, player: Entity) => {
  const { tileWidth, tileHeight } = scene.tilemap;
  const gameWorld = namespaceWorld(world, "game");

  const render = (entity: Entity, coord: Coord) => {
    scene.objectPool.removeGroup("asteroid_" + entity);
    const asteroidType = components.RockType.get(entity)?.value;

    const ownedBy = components.OwnedBy.get(entity, {
      value: singletonEntity,
    }).value;

    if (hashKeyEntity(PIRATE_KEY, player) !== ownedBy) return;

    if (asteroidType !== ERock.Asteroid) return;
    const asteroidObjectGroup = scene.objectPool.getGroup("asteroid_" + entity);

    const sharedComponents = [
      ObjectPosition({
        x: coord.x * tileWidth,
        y: -coord.y * tileHeight,
      }),
      SetValue({
        originX: 0.5,
        originY: 0.5,
      }),
      Tween(scene, {
        scale: { from: 1 - getRandomRange(0, 0.05), to: 1 + getRandomRange(0, 0.05) },
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

    asteroidObjectGroup.add("Sprite").setComponents([
      ...sharedComponents,
      Texture(Assets.SpriteAtlas, SpriteKeys.PirateAsteroid1),
      OnClick(scene, () => {
        components.Send.setDestination(entity);
        components.SelectedRock.set({ value: entity });
      }),
      SetValue({
        depth: DepthLayers.Rock,
      }),
    ]);

    const outlineSprite = SpriteKeys[`Asteroid${ownedBy === player ? "Player" : "Enemy"}` as keyof typeof SpriteKeys];

    const asteroidOutline = asteroidObjectGroup.add("Sprite");

    asteroidOutline.setComponents([
      ...sharedComponents,
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
      Texture(Assets.SpriteAtlas, outlineSprite),
      OnClick(scene, () => {
        components.SelectedRock.set({ value: entity });
      }),
      SetValue({
        depth: DepthLayers.Rock + 1,
      }),
    ]);

    const asteroidLabel = asteroidObjectGroup.add("Text");

    asteroidLabel.setComponents([
      ...sharedComponents,
      SetValue({
        originX: 0.5,
        originY: -3,
      }),
      ObjectText("PIRATE", {
        backgroundColor: "#000000",
        color: "orange",
        fontSize: 8,
      }),
    ]);
  };

  const query = [
    Has(components.RockType),
    HasValue(components.RockType, {
      value: ERock.Asteroid,
    }),
    Has(components.Position),
    Has(components.PirateAsteroid),
    Has(components.OwnedBy),
  ];

  defineEnterSystem(gameWorld, query, ({ entity }) => {
    const coord = components.Position.get(entity);

    if (!coord) return;

    render(entity, coord);
  });

  defineUpdateSystem(gameWorld, query, ({ entity }) => {
    const coord = components.Position.get(entity);

    if (!coord) return;

    render(entity, coord);
  });

  //remove or add if pirate asteroid is defeated
  defineComponentSystem(world, components.PirateAsteroid, ({ entity }) => {
    const coord = components.Position.get(entity);

    if (!coord) return;

    render(entity, coord);
  });

  defineComponentSystem(world, components.DefeatedPirate, ({ entity }) => {
    const { entity: playerEntity, pirate } = decodeEntity(components.DefeatedPirate.metadata.keySchema, entity);
    if (playerEntity != player) return;

    const values = components.PirateAsteroid.getAllWith({ prototype: pirate, playerEntity });
    if (values.length === 0) return;

    scene.objectPool.removeGroup("asteroid_" + values[0]);
    components.Send.setDestination(undefined);
  });
};
