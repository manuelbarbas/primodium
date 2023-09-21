import { Scene } from "engine/types";
import {
  namespaceWorld,
  Has,
  defineEnterSystem,
  HasValue,
  defineComponentSystem,
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
  Motherlode,
  OwnedBy,
  Position,
  ReversePosition,
} from "src/network/components/chainComponents";
import { world } from "src/network/world";
import { MotherlodeSizeNames, MotherlodeTypeNames } from "src/util/constants";
import { EMotherlodeSize, ESpaceRockType } from "src/util/web3/types";
import { Send } from "src/network/components/clientComponents";
import { encodeAndTrimCoord, encodeCoord } from "src/util/encode";
import { ActiveButton } from "src/util/types";
import { Coord } from "@latticexyz/utils";
import { Assets, DepthLayers, SpriteKeys } from "@game/constants";

export const renderMotherlode = (scene: Scene, player: EntityID) => {
  const { tileWidth, tileHeight } = scene.tilemap;
  const gameWorld = namespaceWorld(world, "game");

  const render = (entityId: EntityID, coord: Coord) => {
    scene.objectPool.removeGroup("motherlode_" + entityId);

    const asteroidType = AsteroidType.get(entityId)?.value;
    if (asteroidType !== ESpaceRockType.Motherlode) return;

    const motherlodeObjectGroup = scene.objectPool.getGroup(
      "motherlode_" + entityId
    );
    const motherlodeData = Motherlode.get(entityId);
    if (!motherlodeData) throw new Error("motherlode data not found");

    const sprite =
      SpriteKeys[
        `Motherlode${MotherlodeTypeNames[motherlodeData.motherlodeType]}${
          MotherlodeSizeNames[motherlodeData.size]
        }` as keyof typeof SpriteKeys
      ];

    // const origin = Send.getOrigin();
    // const destination = Send.getDestination();
    // const owner = OwnedBy.get(entityId)?.value;

    // const originEntity = origin
    //   ? ReversePosition.get(encodeCoord(origin))
    //   : undefined;
    // const destinationEntity = destination
    //   ? ReversePosition.get(encodeCoord(destination))
    //   : undefined;

    // let outline: ReturnType<typeof Outline> | undefined;

    // if (originEntity?.value === entityId) {
    //   outline = Outline({ color: 0x00ffff });
    // } else if (destinationEntity?.value === entityId) {
    //   outline = Outline({ color: 0xffa500 });
    // } else if (owner === player) {
    //   outline = Outline({ color: 0xffffff });
    // } else outline = Outline({ color: 0x808080 });

    motherlodeObjectGroup.add("Sprite").setComponents([
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
      Texture(Assets.SpriteAtlas, sprite),
      OnClick(() => {
        const activeButton = Send.get()?.activeButton ?? ActiveButton.NONE;
        if (activeButton === ActiveButton.ORIGIN) {
          Send.setOrigin(coord);
        } else if (
          activeButton === ActiveButton.DESTINATION ||
          activeButton === ActiveButton.NONE
        ) {
          Send.setDestination(coord);
        }
        Send.update({ activeButton: ActiveButton.NONE });
      }),
    ]);
  };
  const query = [
    Has(AsteroidType),
    Has(Position),
    HasValue(AsteroidType, { value: ESpaceRockType.Motherlode }),
  ];
  defineEnterSystem(gameWorld, query, ({ entity }) => {
    const entityId = world.entities[entity];
    const coord = Position.get(entityId);
    if (!coord) return;
    render(entityId, coord);
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
