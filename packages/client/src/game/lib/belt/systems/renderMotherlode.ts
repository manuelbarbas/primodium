import { Scene } from "engine/types";
import {
  namespaceWorld,
  Has,
  defineEnterSystem,
  EntityIndex,
  HasValue,
  defineComponentSystem,
} from "@latticexyz/recs";
import {
  ObjectPosition,
  OnClick,
  SetValue,
} from "../../common/object-components/common";
import { Outline, Texture } from "../../common/object-components/sprite";
import {
  AsteroidType,
  Motherlode,
  Position,
} from "src/network/components/chainComponents";
import { world } from "src/network/world";
import { MotherlodeSizeNames, MotherlodeTypeNames } from "src/util/constants";
import { EMotherlodeSize, ESpaceRockType } from "src/util/web3/types";
import { SelectedAsteroid } from "src/network/components/clientComponents";

export const renderMotherlode = (scene: Scene) => {
  const { tileWidth, tileHeight } = scene.tilemap;
  const gameWorld = namespaceWorld(world, "game");

  const query = [
    Has(AsteroidType),
    HasValue(AsteroidType, { value: ESpaceRockType.Motherlode }),
  ];

  const render = ({ entity }: { entity: EntityIndex }) => {
    const entityId = world.entities[entity];
    scene.objectPool.removeGroup("motherlode_" + entity);
    const motherlodeObjectGroup = scene.objectPool.getGroup(
      "motherlode_" + entity
    );
    const motherlodeData = Motherlode.get(world.entities[entity]);
    if (!motherlodeData) throw new Error("motherlode data not found");
    const sprite = `motherlode-${
      MotherlodeTypeNames[motherlodeData.motherlodeType]
    }-${MotherlodeSizeNames[motherlodeData.size]}`;
    const coord = Position.get(world.entities[entity]);
    if (!coord) return;

    const selectedAsteroid = SelectedAsteroid.get()?.value;

    const scale =
      motherlodeData.size == EMotherlodeSize.SMALL
        ? 1
        : motherlodeData.size == EMotherlodeSize.MEDIUM
        ? 2
        : 4;
    motherlodeObjectGroup.add("Sprite").setComponents([
      ObjectPosition({
        x: coord.x * tileWidth,
        y: -coord.y * tileHeight,
      }),
      selectedAsteroid && selectedAsteroid === entityId ? Outline() : undefined,
      SetValue({
        originX: 0.5,
        originY: 0.5,
        scale,
      }),
      Texture(sprite),
      OnClick(() => {
        if (selectedAsteroid && selectedAsteroid === entityId) {
          SelectedAsteroid.remove();
          return;
        }

        SelectedAsteroid.set({ value: entityId });
      }),
    ]);
  };

  defineEnterSystem(gameWorld, query, render);

  defineComponentSystem(
    gameWorld,
    SelectedAsteroid,
    ({ value: [newValue, oldValue] }) => {
      if (oldValue?.value) {
        const entityId = oldValue.value;

        const asteroidType = AsteroidType.get(entityId)?.value;
        if (!asteroidType || asteroidType !== ESpaceRockType.Motherlode) return;

        const entityIndex = world.entityToIndex.get(entityId);
        if (entityIndex) render({ entity: entityIndex });
      }
      if (newValue?.value) {
        const entityId = newValue.value;

        const asteroidType = AsteroidType.get(entityId)?.value;
        if (!asteroidType || asteroidType !== ESpaceRockType.Motherlode) return;

        const entityIndex = world.entityToIndex.get(entityId);
        if (entityIndex) render({ entity: entityIndex });
      }
    }
  );
};
