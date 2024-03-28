import { Entity, Has, defineSystem, namespaceWorld } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { Coord } from "@latticexyz/utils";
import { Scene } from "engine/types";
import { toast } from "react-toastify";
import { components } from "src/network/components";
import { world } from "src/network/world";
import { PIRATE_KEY } from "src/util/constants";
import { hashKeyEntity } from "src/util/encode";
import { PirateAsteroid } from "src/game/lib/objects/Asteroid";
import { getCanAttack, getCanSend } from "src/util/unit";
import { createCameraApi } from "src/game/api/camera";

export const renderPirateAsteroid = (scene: Scene) => {
  const systemsWorld = namespaceWorld(world, "systems");
  const camera = createCameraApi(scene);

  const render = (entity: Entity, coord: Coord) => {
    const ownedBy = components.OwnedBy.get(entity, {
      value: singletonEntity,
    }).value;

    const playerEntity = components.Account.get()?.value;
    if (!playerEntity || hashKeyEntity(PIRATE_KEY, playerEntity) !== ownedBy) return;

    const asteroid = new PirateAsteroid(scene, coord).setScale(0.5);

    asteroid
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
        const attackOrigin = components.Attack.get()?.originFleet;
        const sendOrigin = components.Send.get()?.originFleet;
        if (attackOrigin) {
          if (getCanAttack(attackOrigin, entity)) components.Attack.setDestination(entity);
          else toast.error("Cannot attack this asteroid.");
        } else if (sendOrigin) {
          if (getCanSend(sendOrigin, entity)) components.Send.setDestination(entity);
          else toast.error("Cannot send to this asteroid.");
        } else {
          components.SelectedRock.set({ value: entity });
          camera.pan(coord, 500);
          camera.zoomTo(1.5, 500);
        }
      })
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
        components.HoverEntity.set({ value: entity });
      })
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
        components.HoverEntity.remove();
      });

    scene.objects.add(entity, asteroid, true);
  };

  const query = [
    Has(components.Asteroid),
    Has(components.Position),
    Has(components.PirateAsteroid),
    Has(components.OwnedBy),
  ];

  defineSystem(systemsWorld, query, ({ entity, value }) => {
    if (!value[0]) return;
    const coord = components.Position.get(entity);
    if (!coord) return;
    const defeated = components.PirateAsteroid.get(entity)?.isDefeated ?? false;
    if (defeated) {
      scene.objects.remove(entity);
      return;
    }

    render(entity, coord);
  });
};
