import { Scene } from "engine/types";
import {
  namespaceWorld,
  Has,
  defineEnterSystem,
  defineComponentSystem,
  HasValue,
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
import { Send } from "src/network/components/clientComponents";
import { initializeMotherlodes } from "../utils/initializeMotherlodes";
import { ESpaceRockType } from "src/util/web3/types";
import { Coord } from "@latticexyz/utils";
import { encodeAndTrimCoord, encodeCoord } from "src/util/encode";
import { ActiveButton } from "src/util/types";

export const renderAsteroid = (scene: Scene) => {
  const { tileWidth, tileHeight } = scene.tilemap;
  const gameWorld = namespaceWorld(world, "game");

  const query = [
    Has(AsteroidType),
    HasValue(AsteroidType, {
      value: ESpaceRockType.Asteroid,
    }),
  ];

  const render = (coord: Coord) => {
    const entityId = ReversePosition.get(encodeAndTrimCoord(coord))?.value;

    if (!entityId) return;
    scene.objectPool.removeGroup("asteroid_" + entityId);
    const asteroidType = AsteroidType.get(entityId)?.value;

    if (asteroidType !== ESpaceRockType.Asteroid) return;
    const asteroidObjectGroup = scene.objectPool.getGroup(
      "asteroid_" + entityId
    );

    const origin = Send.getOrigin();
    const destination = Send.getDestination();

    const originEntity = origin
      ? ReversePosition.get(encodeCoord(origin))
      : undefined;
    const destinationEntity = destination
      ? ReversePosition.get(encodeCoord(destination))
      : undefined;
    const outline =
      originEntity?.value === entityId
        ? Outline({ color: 0x00ff00 })
        : destinationEntity?.value === entityId
        ? Outline()
        : undefined;
    asteroidObjectGroup.add("Sprite").setComponents([
      ObjectPosition({
        x: coord.x * tileWidth,
        y: -coord.y * tileHeight,
      }),
      SetValue({
        originX: 0.5,
        originY: 0.5,
        scale: 1.2,
      }),
      Texture("asteroid-sprite"),
      outline,
      OnClick(() => {
        const activeButton = Send.get()?.activeButton ?? ActiveButton.NONE;
        if (activeButton === ActiveButton.ORIGIN) {
          Send.setOrigin(coord);
        } else if (activeButton === ActiveButton.DESTINATION) {
          Send.setDestination(coord);
        }
        Send.update({ activeButton: ActiveButton.NONE });
      }),
    ]);
  };

  defineEnterSystem(gameWorld, query, ({ entity }) => {
    const entityId = world.entities[entity];

    const coord = Position.get(entityId);

    if (!coord) return;

    render(coord);
    initializeMotherlodes(entityId, coord);
  });

  defineComponentSystem(gameWorld, Send, ({ value: values }) => {
    values.map((value) => {
      [
        { x: value?.originX, y: value?.originY },
        { x: value?.destinationX, y: value?.destinationY },
      ].map((coord) => {
        if (!coord || !coord.x || !coord.y) return;
        render({ x: coord.x, y: coord.y });
      });
    });
  });
};
