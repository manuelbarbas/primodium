import { Scene } from "engine/types";
import {
  namespaceWorld,
  Has,
  defineEnterSystem,
  EntityIndex,
  defineComponentSystem,
  HasValue,
} from "@latticexyz/recs";
import {
  ObjectPosition,
  OnClick,
  SetValue,
} from "../../common/object-components/common";
import { Outline, Texture } from "../../common/object-components/sprite";
import { AsteroidType, Position } from "src/network/components/chainComponents";
import { world } from "src/network/world";
import {
  ActiveAsteroid,
  SelectedAsteroid,
} from "src/network/components/clientComponents";
import { initializeMotherlodes } from "../utils/initializeMotherlodes";
import { ESpaceRockType } from "src/util/web3/types";

export const renderAsteroid = (scene: Scene) => {
  const { tileWidth, tileHeight } = scene.tilemap;
  const gameWorld = namespaceWorld(world, "game");

  const query = [
    Has(AsteroidType),
    HasValue(AsteroidType, {
      value: ESpaceRockType.Asteroid,
    }),
  ];

  const render = ({ entity }: { entity: EntityIndex }) => {
    const entityId = world.entities[entity];

    scene.objectPool.removeGroup("asteroid_" + entityId);
    const asteroidObjectGroup = scene.objectPool.getGroup(
      "asteroid_" + entityId
    );
    const coord = Position.get(entityId);

    const activeAsteroid = ActiveAsteroid.get()?.value;

    if (!coord) return;

    const selectedAsteroid = SelectedAsteroid.get()?.value;

    asteroidObjectGroup.add("Sprite").setComponents([
      ObjectPosition({
        x: coord.x * tileWidth,
        y: -coord.y * tileHeight,
      }),
      SetValue({
        originX: 0.5,
        originY: 0.5,
      }),
      Texture("asteroid-sprite"),
      activeAsteroid && activeAsteroid === entityId
        ? Outline({ color: 0xffffff })
        : undefined,
      selectedAsteroid && selectedAsteroid === entityId ? Outline() : undefined,
      OnClick(() => {
        if (entityId === ActiveAsteroid.get()?.value) return;

        selectedAsteroid
          ? SelectedAsteroid.remove()
          : SelectedAsteroid.set({ value: entityId });
      }),
    ]);

    initializeMotherlodes(entityId, coord);
  };

  defineEnterSystem(gameWorld, query, render);

  defineComponentSystem(
    gameWorld,
    SelectedAsteroid,
    ({ value: [newValue, oldValue] }) => {
      if (oldValue?.value) {
        const entityIndex = world.entityToIndex.get(oldValue.value);
        if (entityIndex) render({ entity: entityIndex });
      }
      if (newValue?.value) {
        const entityIndex = world.entityToIndex.get(newValue.value);
        if (entityIndex) render({ entity: entityIndex });
      }
    }
  );
};
