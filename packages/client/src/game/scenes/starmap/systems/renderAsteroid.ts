import { Entity, Has, defineEnterSystem, namespaceWorld } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { Scene } from "engine/types";
import { toast } from "react-toastify";
import { createCameraApi } from "src/game/api/camera";
import { PrimaryAsteroid, SecondaryAsteroid } from "src/game/lib/objects/Asteroid";
import { BaseAsteroid } from "src/game/lib/objects/Asteroid/BaseAsteroid";
import { components } from "src/network/components";
import { world } from "src/network/world";
import { EntityType } from "src/util/constants";
import { getCanSend } from "src/util/unit";
import { initializeSecondaryAsteroids } from "./utils/initializeSecondaryAsteroids";
import { MapIdToAsteroidType } from "@/util/mappings";
import { entityToPlayerName, entityToRockName } from "@/util/name";
import { getRockRelationship } from "@/util/asteroid";
import { getAllianceName } from "@/util/alliance";
import { entityToColor } from "@/util/color";
import { getEntityTypeName } from "@/util/common";
import { MainbaseLevelToEmblem } from "@/game/lib/mappings";
import { EMap } from "contracts/config/enums";

export const renderAsteroid = (scene: Scene) => {
  const systemsWorld = namespaceWorld(world, "systems");
  const cameraApi = createCameraApi(scene);

  const render = (entity: Entity, coord: Coord) => {
    const asteroidData = components.Asteroid.get(entity);
    if (!asteroidData) throw new Error("Asteroid data not found");

    const expansionLevel = components.Level.get(entity)?.value ?? 1n;
    const playerEntity = components.Account.get()?.value;

    if (!playerEntity) return;

    const ownedBy = components.OwnedBy.get(entity)?.value;
    const ownedByPlayer = ownedBy === playerEntity;
    const level = components.Level.get(entity)?.value;

    const spriteScale = 0.34 + 0.05 * Number(asteroidData.maxLevel);
    let asteroid: BaseAsteroid;
    if (!asteroidData?.spawnsSecondary)
      asteroid = new SecondaryAsteroid({
        scene,
        coord,
        resourceType: MapIdToAsteroidType[asteroidData.mapId] ?? EntityType.Kimberlite,
        maxLevel: asteroidData?.maxLevel,
        relationship: getRockRelationship(playerEntity, entity),
      }).setScale(spriteScale);
    else
      asteroid = new PrimaryAsteroid({
        scene,
        coord,
        level: expansionLevel ?? 1n,
        relationship: getRockRelationship(playerEntity, entity),
      })
        .setScale(spriteScale)
        .setLevel(level ?? 1n);

    asteroid
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
        const attackOrigin = components.Attack.get()?.originFleet;
        const sendOrigin = components.Send.get()?.originFleet;
        if (attackOrigin) {
          components.Attack.setDestination(entity);
          // if (getCanAttack(attackOrigin, entity)) components.Attack.setDestination(entity);
          // else toast.error("Cannot attack this asteroid.");
        } else if (sendOrigin) {
          if (getCanSend(sendOrigin, entity)) components.Send.setDestination(entity);
          else toast.error("Cannot send to this asteroid.");
        } else {
          scene.phaserScene.add
            .timeline([
              {
                at: 0,
                run: () => cameraApi.pan(coord, { duration: 300 }),
              },
              {
                at: 300,
                run: () => cameraApi.zoomTo(scene.config.camera.maxZoom, 500),
              },
              {
                at: 800,
                run: () => components.SelectedRock.set({ value: entity }),
              },
            ])
            .play();
        }
      })
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
        components.HoverEntity.set({ value: entity });
      })
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
        components.HoverEntity.remove();
      });

    const alliance = components.PlayerAlliance.get(ownedBy as Entity)?.alliance;

    const ownerLabel = (() => {
      if (ownedByPlayer) return "You";
      if (ownedBy) return entityToPlayerName(ownedBy as Entity);
      if (asteroidData.wormhole) return "Wormhole";
      if (asteroidData.mapId === EMap.Common) return "BASIC";
      return getEntityTypeName(MapIdToAsteroidType[asteroidData.mapId]);
    })();

    asteroid.getAsteroidLabel().setProperties({
      nameLabel: entityToRockName(entity),
      nameLabelColor: ownedByPlayer ? 0xffff00 : asteroidData?.spawnsSecondary ? 0x00ffff : 0xffffff,
      emblemSprite: MainbaseLevelToEmblem[Phaser.Math.Clamp(Number(level) - 1, 0, MainbaseLevelToEmblem.length - 1)],
      ownerLabel: ownerLabel,
      allianceLabel: alliance ? getAllianceName(alliance as Entity) : undefined,
      allianceLabelColor: alliance ? parseInt(entityToColor(alliance as Entity).slice(1), 16) : undefined,
    });

    scene.objects.add(entity, asteroid, true);
  };

  const query = [Has(components.Asteroid), Has(components.Position)];

  defineEnterSystem(systemsWorld, query, async ({ entity }) => {
    const coord = components.Position.get(entity);
    const asteroidData = components.Asteroid.get(entity);

    if (!coord) return;

    // //TODO: not sure why this is needed but rendering of unitialized asteroids wont work otherwise
    await new Promise((resolve) => setTimeout(resolve, 0));

    render(entity, coord);
    if (asteroidData?.spawnsSecondary) initializeSecondaryAsteroids(entity, coord);
  });
};
