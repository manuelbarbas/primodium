import { Entity } from "@latticexyz/recs";
import { EMap } from "contracts/config/enums";
import { components } from "@primodiumxyz/core/network/components";
import { getAllianceName } from "@primodiumxyz/core/util/alliance";
import { getRockRelationship, isAsteroidBlocked } from "@primodiumxyz/core/util/asteroid";
import { entityToColor } from "@primodiumxyz/core/util/color";
import { getEntityTypeName } from "@primodiumxyz/core/util/common";
import { EntityType, Mode } from "@primodiumxyz/core/util/constants";
import { MapIdToAsteroidType } from "@primodiumxyz/core/util/mappings";
import { entityToPlayerName, entityToRockName } from "@primodiumxyz/core/util/name";
import { getEnsName } from "@primodiumxyz/core/util/web3/getEnsName";

import { Coord } from "@primodiumxyz/engine/types";
import { PrimodiumScene } from "@/api/scene";
import { MainbaseLevelToEmblem } from "@/lib/mappings";
import { PrimaryAsteroid, SecondaryAsteroid } from "@/lib/objects/asteroid";
import { BaseAsteroid } from "@/lib/objects/asteroid/BaseAsteroid";

export const renderAsteroid = (args: {
  scene: PrimodiumScene;
  entity: Entity;
  coord?: Coord;
  addEventHandlers?: boolean;
}) => {
  const { scene, entity, coord = { x: 0, y: 0 }, addEventHandlers = false } = args;
  //TODO: replace with hanks fancy api stuff
  const asteroidData = components.Asteroid.get(entity);
  if (!asteroidData) throw new Error("Asteroid data not found");

  const expansionLevel = components.Level.get(entity)?.value ?? 1n;
  const playerEntity = components.Account.get()?.value;
  const isHome = components.Home.get(playerEntity)?.value === entity;

  if (!playerEntity) return;

  const ownedBy = components.OwnedBy.get(entity)?.value;
  const ownedByPlayer = ownedBy === playerEntity;

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
      level: expansionLevel,
      relationship: getRockRelationship(playerEntity, entity),
    })
      .setScale(spriteScale)
      .setLevel(expansionLevel);

  const alliance = components.PlayerAlliance.get(ownedBy as Entity)?.alliance;

  const ownerLabel = (() => {
    if (ownedByPlayer) return "You";
    if (ownedBy) return entityToPlayerName(ownedBy as Entity);
    if (asteroidData.wormhole) return "Wormhole";
    if (asteroidData.mapId === EMap.Common) return "COMMON";
    return getEntityTypeName(MapIdToAsteroidType[asteroidData.mapId]);
  })();

  asteroid.getAsteroidLabel().setProperties({
    nameLabel: entityToRockName(entity) + (isHome ? " *" : ""),
    nameLabelColor: ownedByPlayer ? 0xffff00 : asteroidData?.spawnsSecondary ? 0x00ffff : 0xffffff,
    emblemSprite:
      MainbaseLevelToEmblem[Phaser.Math.Clamp(Number(expansionLevel) - 1, 0, MainbaseLevelToEmblem.length - 1)],
    ownerLabel: ownerLabel,
    allianceLabel: alliance ? getAllianceName(alliance as Entity) : undefined,
    allianceLabelColor: alliance ? parseInt(entityToColor(alliance as Entity).slice(1), 16) : undefined,
  });

  // just trigger rendering the ENS name if available
  if (ownedBy) {
    getEnsName(ownedBy as Entity).then((addressObj) => {
      if (addressObj.ensName) asteroid.getAsteroidLabel().setProperties({ ownerLabel: addressObj.ensName });
    });
  }

  // Add event handlers
  if (!addEventHandlers) return asteroid;

  const sequence = [
    {
      at: 0,
      run: () => scene.camera.pan(coord, { duration: 300 }),
    },
    {
      at: 300,
      run: () => scene.camera.zoomTo(scene.config.camera.maxZoom, 500),
    },
  ];

  asteroid
    .onClick(() => {
      //TODO: move to reusable seq in fx

      //set the selected rock immediately if we are sufficiently zoomed in
      if (scene.camera.phaserCamera.zoom >= scene.config.camera.maxZoom * 0.5)
        components.SelectedRock.set({ value: entity });
      else sequence.push({ at: 800, run: () => components.SelectedRock.set({ value: entity }) });

      scene.phaserScene.add.timeline(sequence).play();

      //set the selected rock immediately if we are sufficiently zoomed in
      if (scene.camera.phaserCamera.zoom >= scene.config.camera.maxZoom * 0.5)
        components.SelectedRock.set({ value: entity });
    })
    .onDoubleClick(() => {
      components.SelectedRock.set({ value: entity });
      components.SelectedMode.set({ value: Mode.CommandCenter });
    })
    .onHoverEnter(() => {
      components.HoverEntity.set({ value: entity });
    })
    .onHoverExit(() => {
      components.HoverEntity.remove();
    });

  //TODO: this is not great since we have to check every asteroid creation, but we are going to be deffering so maybe ok. Reason we need to do this on init currently is because asteroid may not be initialized yet when the fleet stance update comes in. We could set a timeout on that system but not ideal.
  if (isAsteroidBlocked(entity)) asteroid?.getFleetsContainer().showBlockRing();

  return asteroid;
};
