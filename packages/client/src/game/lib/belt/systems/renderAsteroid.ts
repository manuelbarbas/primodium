import { BeltMap } from "@game/constants";
import { EntityID, Has, HasValue, defineComponentSystem, defineEnterSystem, namespaceWorld } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { Scene } from "engine/types";
import { AsteroidType, OwnedBy, Position, ReversePosition } from "src/network/components/chainComponents";
import { Send } from "src/network/components/clientComponents";
import { world } from "src/network/world";
import { encodeAndTrimCoord, encodeCoord } from "src/util/encode";
import { ActiveButton } from "src/util/types";
import { ESpaceRockType } from "src/util/web3/types";
import { ObjectPosition, OnClick, SetValue } from "../../common/object-components/common";
import { Outline, Texture } from "../../common/object-components/sprite";
import { initializeMotherlodes } from "../utils/initializeMotherlodes";

const { DepthLayers } = BeltMap;

export const renderAsteroid = (scene: Scene, player: EntityID) => {
  const { tileWidth, tileHeight } = scene.tilemap;
  const gameWorld = namespaceWorld(world, "game");

  const render = (entityId: EntityID, coord: Coord) => {
    scene.objectPool.removeGroup("asteroid_" + entityId);
    const asteroidType = AsteroidType.get(entityId)?.value;

    if (asteroidType !== ESpaceRockType.Asteroid) return;
    const asteroidObjectGroup = scene.objectPool.getGroup("asteroid_" + entityId);

    const origin = Send.getOrigin();
    const destination = Send.getDestination();
    const owner = OwnedBy.get(entityId)?.value;

    const originEntity = origin ? ReversePosition.get(encodeCoord(origin)) : undefined;
    const destinationEntity = destination ? ReversePosition.get(encodeCoord(destination)) : undefined;

    let outline: ReturnType<typeof Outline> | undefined;

    if (originEntity?.value === entityId) {
      outline = Outline({ color: 0x00ffff });
    } else if (destinationEntity?.value === entityId) {
      outline = Outline({ color: 0xffa500 });
    } else if (owner === player) {
      outline = Outline({ color: 0x00ff00 });
    } else outline = Outline({ color: 0xff0000 });

    asteroidObjectGroup.add("Sprite").setComponents([
      ObjectPosition(
        {
          x: coord.x * tileWidth,
          y: -coord.y * tileHeight,
        },
        DepthLayers.Asteroid
      ),
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
        } else if (activeButton === ActiveButton.DESTINATION || activeButton === ActiveButton.NONE) {
          Send.setDestination(coord);
        }
        Send.update({ activeButton: ActiveButton.NONE });
      }),
    ]);
  };

  const query = [
    Has(AsteroidType),
    HasValue(AsteroidType, {
      value: ESpaceRockType.Asteroid,
    }),
    Has(Position),
  ];

  defineEnterSystem(gameWorld, query, ({ entity }) => {
    const entityId = world.entities[entity];

    const coord = Position.get(entityId);

    if (!coord) return;

    render(entityId, coord);
    initializeMotherlodes(entityId, coord);
  });

  defineComponentSystem(gameWorld, Send, ({ value: values }) => {
    values.map((value) => {
      [
        { x: value?.originX, y: value?.originY },
        { x: value?.destinationX, y: value?.destinationY },
      ].map((rawCoord) => {
        if (!rawCoord || !rawCoord.x || !rawCoord.y) return;
        const coord = { x: rawCoord.x, y: rawCoord.y };
        const entity = ReversePosition.get(encodeAndTrimCoord(coord))?.value;
        if (!entity) return;
        render(entity, coord);
      });
    });
  });
};
