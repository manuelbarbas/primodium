import { Scene } from "engine/types";
import {
  namespaceWorld,
  Has,
  defineEnterSystem,
  defineComponentSystem,
  HasValue,
  EntityID,
} from "@latticexyz/recs";
import {
  ObjectPosition,
  OnClick,
  SetValue,
} from "../../common/object-components/common";
import { Outline, Texture } from "../../common/object-components/sprite";
import {
  AsteroidType,
  Position,
  ReversePosition,
} from "src/network/components/chainComponents";
import { world } from "src/network/world";
import { ActiveAsteroid, Send } from "src/network/components/clientComponents";
import { initializeMotherlodes } from "../utils/initializeMotherlodes";
import { ESpaceRockType } from "src/util/web3/types";
import { Coord } from "@latticexyz/utils";
import { encodeCoord } from "src/util/encode";

export const renderAsteroid = (scene: Scene) => {
  const { tileWidth, tileHeight } = scene.tilemap;
  const gameWorld = namespaceWorld(world, "game");

  const query = [
    Has(AsteroidType),
    HasValue(AsteroidType, {
      value: ESpaceRockType.Asteroid,
    }),
  ];

  const render = (entityId: EntityID, coord: Coord) => {
    scene.objectPool.removeGroup("asteroid_" + entityId);
    const asteroidObjectGroup = scene.objectPool.getGroup(
      "asteroid_" + entityId
    );

    const activeAsteroid = ActiveAsteroid.get()?.value;

    const selectedTarget = Send.getDestination();

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
      selectedTarget && selectedTarget.entity === entityId
        ? Outline()
        : undefined,
      OnClick(() => {
        if (entityId === ActiveAsteroid.get()?.value) return;

        if (selectedTarget && selectedTarget.entity === entityId) {
          Send.remove();
          return;
        }

        Send.setDestination(coord);
      }),
    ]);
  };

  defineEnterSystem(gameWorld, query, ({ entity }) => {
    const entityId = world.entities[entity];

    const coord = Position.get(entityId);

    if (!coord) return;

    render(entityId, coord);
    initializeMotherlodes(entityId, coord);
  });
  defineComponentSystem(gameWorld, Send, ({ value: [newValue, oldValue] }) => {
    if (oldValue?.destinationX && oldValue?.destinationY) {
      const coord = { x: oldValue.destinationX, y: oldValue.destinationY };
      const entityId = ReversePosition.get(encodeCoord(coord))?.value;
      if (!entityId) return;
      const asteroidType = AsteroidType.get(entityId)?.value;
      if (!asteroidType || asteroidType !== ESpaceRockType.Asteroid) return;

      render(entityId, coord);
    }
    if (newValue?.destinationX && newValue?.destinationY) {
      const coord = { x: newValue.destinationX, y: newValue.destinationY };
      const entityId = ReversePosition.get(encodeCoord(coord))?.value;

      if (!entityId) return;
      const asteroidType = AsteroidType.get(entityId)?.value;
      if (!asteroidType || asteroidType !== ESpaceRockType.Asteroid) return;

      render(entityId, coord);
    }
  });
};
