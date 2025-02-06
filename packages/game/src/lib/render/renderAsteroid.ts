import { EMap } from "contracts/config/enums";

import {
  Core,
  entityToPlayerName,
  entityToRockName,
  EntityType,
  getEnsName,
  getEntityTypeName,
  MapEntityLookup,
  Mode,
} from "@primodiumxyz/core";
import { Coord } from "@primodiumxyz/engine/types";
import { Entity } from "@primodiumxyz/reactive-tables";
import { MainbaseLevelToEmblem } from "@game/lib/mappings";
import { PrimaryAsteroid, SecondaryAsteroid } from "@game/lib/objects/asteroid";
import { BaseAsteroid } from "@game/lib/objects/asteroid/BaseAsteroid";
import { PrimodiumScene } from "@game/types";

export const renderAsteroid = (args: {
  scene: PrimodiumScene;
  entity: Entity;
  coord?: Coord;
  addEventHandlers?: boolean;
  core: Core;
}) => {
  const {
    scene,
    entity,
    coord = { x: 0, y: 0 },
    addEventHandlers = false,
    core: { tables, utils, config },
  } = args;
  //TODO: replace with hanks fancy api stuff
  const asteroidData = tables.Asteroid.get(entity);
  if (!asteroidData) throw new Error("Asteroid data not found");

  const expansionLevel = tables.Level.get(entity)?.value ?? 1n;
  const playerEntity = tables.Account.get()?.value;
  const isHome = tables.Home.get(playerEntity)?.value === entity;

  if (!playerEntity) return;

  const ownedBy = tables.OwnedBy.get(entity)?.value;
  const ownedByPlayer = ownedBy === playerEntity;

  const spriteScale = 0.34 + 0.05 * Number(asteroidData.maxLevel);

  let asteroid: BaseAsteroid;
  if (!asteroidData?.spawnsSecondary)
    asteroid = new SecondaryAsteroid({
      id: entity,
      scene,
      coord,
      resourceType: MapEntityLookup[asteroidData.mapId] ?? EntityType.Kimberlite,
      maxLevel: asteroidData?.maxLevel,
      relationship: utils.getRockRelationship(playerEntity, entity),
    }).setScale(spriteScale);
  else
    asteroid = new PrimaryAsteroid({
      id: entity,
      scene,
      coord,
      level: expansionLevel,
      relationship: utils.getRockRelationship(playerEntity, entity),
    })
      .setScale(spriteScale)
      .setLevel(expansionLevel);

  const alliance = tables.PlayerAlliance.get(ownedBy as Entity)?.alliance;

  const ownerLabel = (() => {
    if (ownedByPlayer) return "You";
    if (ownedBy) return entityToPlayerName(ownedBy as Entity);
    if (asteroidData.wormhole) return "Wormhole";
    if (asteroidData.mapId === EMap.Common) return "COMMON";
    return getEntityTypeName(MapEntityLookup[asteroidData.mapId]);
  })();

  asteroid.getAsteroidLabel().setProperties({
    nameLabel: entityToRockName(entity) + (isHome ? " *" : ""),
    nameLabelColor: ownedByPlayer ? 0xffff00 : asteroidData?.spawnsSecondary ? 0x00ffff : 0xffffff,
    emblemSprite:
      MainbaseLevelToEmblem[Phaser.Math.Clamp(Number(expansionLevel) - 1, 0, MainbaseLevelToEmblem.length - 1)],
    ownerLabel: ownerLabel,
    allianceLabel: alliance ? utils.getAllianceName(alliance as Entity) : undefined,
    allianceLabelColor: alliance ? parseInt(utils.getEntityColor(alliance as Entity).slice(1), 16) : undefined,
  });

  // just trigger rendering the ENS name if available
  if (ownedBy && config.accountLinkUrl) {
    getEnsName(config.accountLinkUrl, ownedBy as Entity).then((addressObj) => {
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
        tables.SelectedRock.set({ value: entity });
      else sequence.push({ at: 800, run: () => tables.SelectedRock.set({ value: entity }) });

      scene.phaserScene.add.timeline(sequence).play();

      //set the selected rock immediately if we are sufficiently zoomed in
      if (scene.camera.phaserCamera.zoom >= scene.config.camera.maxZoom * 0.5)
        tables.SelectedRock.set({ value: entity });
    })
    .onDoubleClick(() => {
      tables.SelectedRock.set({ value: entity });
      tables.SelectedMode.set({ value: Mode.CommandCenter });
    })
    .onHoverEnter(() => {
      tables.HoverEntity.set({ value: entity });
    })
    .onHoverExit(() => {
      tables.HoverEntity.remove();
    });

  //TODO: this is not great since we have to check every asteroid creation, but we are going to be deffering so maybe ok. Reason we need to do this on init currently is because asteroid may not be initialized yet when the fleet stance update comes in. We could set a timeout on that system but not ideal.
  if (utils.isAsteroidBlocked(entity)) asteroid?.getFleetsContainer().showBlockRing();

  return asteroid;
};
