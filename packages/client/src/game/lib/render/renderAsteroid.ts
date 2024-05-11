import { MainbaseLevelToEmblem } from "@/game/lib/mappings";
import { PrimaryAsteroid, SecondaryAsteroid } from "@/game/lib/objects/Asteroid";
import { BaseAsteroid } from "@/game/lib/objects/Asteroid/BaseAsteroid";
import { createCameraApi } from "@/game/api/camera";
import { components } from "@/network/components";
import { getAllianceName } from "@/util/alliance";
import { getRockRelationship } from "@/util/asteroid";
import { entityToColor } from "@/util/color";
import { getEntityTypeName } from "@/util/common";
import { EntityType } from "@/util/constants";
import { MapIdToAsteroidType } from "@/util/mappings";
import { entityToPlayerName, entityToRockName } from "@/util/name";
import { Entity } from "@latticexyz/recs";
import { EMap } from "contracts/config/enums";
import { Coord, Scene } from "engine/types";

export const renderAsteroid = (args: { scene: Scene; entity: Entity; coord?: Coord; addEventHandlers?: boolean }) => {
  const { scene, entity, coord = { x: 0, y: 0 }, addEventHandlers = false } = args;
  //TODO: replace with hanks fancy api stuff
  const cameraApi = createCameraApi(scene);
  const asteroidData = components.Asteroid.get(entity);
  if (!asteroidData) throw new Error("Asteroid data not found");

  const expansionLevel = components.Level.get(entity)?.value ?? 1n;
  const playerEntity = components.Account.get()?.value;
  const isHome = components.Home.get(playerEntity)?.value === entity;

  if (!playerEntity) return;

  const ownedBy = components.OwnedBy.get(entity)?.value;
  const ownedByPlayer = ownedBy === playerEntity;
  const level = components.Level.get(entity)?.value;

  const spriteScale = 0.34 + 0.05 * Number(asteroidData.maxLevel);

  let asteroid: BaseAsteroid;
  if (!asteroidData?.spawnsSecondary)
    asteroid = new SecondaryAsteroid({
      id: entity,
      scene,
      coord,
      resourceType: MapIdToAsteroidType[asteroidData.mapId] ?? EntityType.Kimberlite,
      maxLevel: asteroidData?.maxLevel,
      relationship: getRockRelationship(playerEntity, entity),
    }).setScale(spriteScale);
  else
    asteroid = new PrimaryAsteroid({
      id: entity,
      scene,
      coord,
      level: expansionLevel ?? 1n,
      relationship: getRockRelationship(playerEntity, entity),
    })
      .setScale(spriteScale)
      .setLevel(level ?? 1n);

  const alliance = components.PlayerAlliance.get(ownedBy as Entity)?.alliance;

  const ownerLabel = (() => {
    if (ownedByPlayer) return "You";
    if (ownedBy) return entityToPlayerName(ownedBy as Entity);
    if (asteroidData.wormhole) return "Wormhole";
    if (asteroidData.mapId === EMap.Common) return "BASIC";
    return getEntityTypeName(MapIdToAsteroidType[asteroidData.mapId]);
  })();

  asteroid.getAsteroidLabel().setProperties({
    nameLabel: entityToRockName(entity) + (isHome ? " *" : ""),
    nameLabelColor: ownedByPlayer ? 0xffff00 : asteroidData?.spawnsSecondary ? 0x00ffff : 0xffffff,
    emblemSprite: MainbaseLevelToEmblem[Phaser.Math.Clamp(Number(level) - 1, 0, MainbaseLevelToEmblem.length - 1)],
    ownerLabel: ownerLabel,
    allianceLabel: alliance ? getAllianceName(alliance as Entity) : undefined,
    allianceLabelColor: alliance ? parseInt(entityToColor(alliance as Entity).slice(1), 16) : undefined,
  });

  // Add event handlers
  if (!addEventHandlers) return asteroid;

  asteroid
    .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, (pointer: Phaser.Input.Pointer) => {
      if (pointer.downElement.nodeName !== "CANVAS") return;

      //TODO: move to reusable seq in fx
      const sequence = [
        {
          at: 0,
          run: () => cameraApi.pan(coord, { duration: 300 }),
        },
        {
          at: 300,
          run: () => cameraApi.zoomTo(scene.config.camera.maxZoom, 500),
        },
      ];
      //set the selected rock immediately if we are sufficiently zoomed in
      if (scene.camera.phaserCamera.zoom >= scene.config.camera.maxZoom * 0.5)
        components.SelectedRock.set({ value: entity });
      else sequence.push({ at: 800, run: () => components.SelectedRock.set({ value: entity }) });

      scene.phaserScene.add.timeline(sequence).play();

      //set the selected rock immediately if we are sufficiently zoomed in
      if (scene.camera.phaserCamera.zoom >= scene.config.camera.maxZoom * 0.5)
        components.SelectedRock.set({ value: entity });
    })
    .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
      components.HoverEntity.set({ value: entity });
    })
    .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
      components.HoverEntity.remove();
    });

  return asteroid;
};
