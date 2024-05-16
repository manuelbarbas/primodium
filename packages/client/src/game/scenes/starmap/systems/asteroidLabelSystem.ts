import { components } from "@/network/components";
import { world } from "@/network/world";
import { PrimodiumScene } from "@/game/api/scene";
import { MainbaseLevelToEmblem } from "@/game/lib/mappings";
import { BaseAsteroid } from "@/game/lib/objects/Asteroid/BaseAsteroid";
import { getAllianceName } from "@/util/alliance";
import { entityToColor } from "@/util/color";
import { Mode } from "@/util/constants";
import { entityToPlayerName, entityToRockName } from "@/util/name";
import { Entity, defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { toHex } from "viem";

const UPDATE_INTERVAL = 1000;

export const asteroidLabelSystem = (scene: PrimodiumScene) => {
  const systemsWorld = namespaceWorld(world, "systems");

  const playerEntity = components.Account.get()?.value;
  const playerHomeEntity = components.Home.get(playerEntity)?.value as Entity | undefined;

  let unsub: (() => void) | undefined = undefined;
  systemsWorld.registerDisposer(() => unsub && unsub());
  defineComponentSystem(systemsWorld, components.SelectedMode, ({ value: [currentMode] }) => {
    if (unsub) unsub();
    if (currentMode?.value !== Mode.Starmap) return;

    const asteroidsRenderContainer = scene.objects.deferredRenderContainer.getContainer(toHex("asteroids") as Entity);
    if (!asteroidsRenderContainer) return;

    unsub = asteroidsRenderContainer.$subscribe(UPDATE_INTERVAL, (visibleEntities: Entity[]) => {
      visibleEntities.forEach((entity) => {
        const asteroid = scene.objects.asteroid.get(entity);
        if (!asteroid) return;

        updateAsteroidLabel(asteroid, entity, playerEntity, playerHomeEntity);
      });
    });
  });
};

const updateAsteroidLabel = (
  asteroid: BaseAsteroid,
  asteroidEntity: Entity,
  playerEntity?: Entity,
  playerHomeEntity?: Entity
) => {
  playerEntity = playerEntity ?? components.Account.get()?.value;
  playerHomeEntity = playerHomeEntity ?? (components.Home.get(playerEntity)?.value as Entity | undefined);

  const ownerEntity = (components.OwnedBy.get(asteroidEntity)?.value as Entity | undefined) ?? singletonEntity;
  const ownerAllianceEntity = components.PlayerAllianceInfo.get(ownerEntity)?.alliance ?? singletonEntity;
  const expansionLevel = components.Level.get(asteroidEntity)?.value ?? 1n;

  const isHome = playerHomeEntity === asteroidEntity;
  const ownedByPlayer = ownerEntity === playerEntity;
  const hasAlliance = ownerAllianceEntity && ownerAllianceEntity !== singletonEntity;

  asteroid.getAsteroidLabel().setProperties({
    nameLabel: entityToRockName(asteroidEntity) + (isHome ? " *" : ""),
    nameLabelColor: ownedByPlayer
      ? 0xffff00
      : components.Asteroid.get(asteroidEntity)?.spawnsSecondary
      ? 0x00ffff
      : 0xffffff,
    emblemSprite:
      MainbaseLevelToEmblem[Phaser.Math.Clamp(Number(expansionLevel) - 1, 0, MainbaseLevelToEmblem.length - 1)],
    ownerLabel: ownedByPlayer ? "You" : ownerEntity === singletonEntity ? "unowned" : entityToPlayerName(ownerEntity),
    allianceLabel: hasAlliance ? getAllianceName(ownerAllianceEntity) : undefined,
    allianceLabelColor: hasAlliance ? parseInt(entityToColor(ownerAllianceEntity).slice(1), 16) : undefined,
  });
};

export const subscribeToAsteroidLabel = (scene: PrimodiumScene, asteroid: BaseAsteroid, entity: Entity) => {
  const playerEntity = components.Account.get()?.value;
  const playerHomeEntity = components.Home.get(playerEntity)?.value as Entity | undefined;

  const interval = setInterval(() => {
    updateAsteroidLabel(asteroid, entity, playerEntity, playerHomeEntity);
  }, UPDATE_INTERVAL);

  return () => clearInterval(interval);
};
