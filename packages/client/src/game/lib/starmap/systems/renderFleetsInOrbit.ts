import { Assets, DepthLayers, SpriteKeys } from "@game/constants";
import { Coord, tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { Entity, Has, defineComponentSystem, defineEnterSystem, namespaceWorld } from "@latticexyz/recs";
import { EFleetStance } from "contracts/config/enums";
import { Scene } from "engine/types";
import { toast } from "react-toastify";
import { Subscription, merge } from "rxjs";
import { components } from "src/network/components";
import { world } from "src/network/world";
import { getRockRelationship } from "src/util/asteroid";
import { RockRelationship } from "src/util/constants";
import { entityToFleetName } from "src/util/name";
import { getCanAttack, getOrbitingFleets } from "src/util/unit";
import {
  ObjectPosition,
  OnClickUp,
  OnComponentSystem,
  OnHover,
  OnOnce,
  SetValue,
  TweenCounter,
} from "../../common/object-components/common";
import { Circle, Line, Shield, Square } from "../../common/object-components/graphics";
import { Texture } from "../../common/object-components/sprite";
import { ObjectText } from "../../common/object-components/text";

const orbitRadius = 64;
function calculatePosition(
  angleInDegrees: number,
  origin: { x: number; y: number },
  scale?: { tileWidth: number; tileHeight: number }
): { x: number; y: number } {
  const tileWidth = scale?.tileWidth ?? 1;
  const tileHeight = scale?.tileHeight ?? 1;
  const radians = (angleInDegrees * Math.PI) / 180; // Convert angle to radians
  const x = (orbitRadius / tileWidth) * Math.cos(radians); // Calculate x coordinate
  const y = (orbitRadius / tileHeight) * Math.sin(radians); // Calculate y coordinate

  return { x: x + origin.x, y: y + origin.y };
}

function getFleetShape(fleetEntity: Entity, position: Coord) {
  const playerEntity = components.Account.get()?.value;
  if (!playerEntity) throw new Error("Player entity not found");
  const owner = components.OwnedBy.get(fleetEntity)?.value as Entity | undefined;
  const relationship = owner ? getRockRelationship(playerEntity, owner as Entity) : RockRelationship.Neutral;
  const color =
    relationship === RockRelationship.Ally ? 0x00ff00 : relationship === RockRelationship.Enemy ? 0xff0000 : 0x00ffff;

  const stance = components.FleetStance.get(fleetEntity)?.stance;

  const id = `fleetShape-${fleetEntity}`;
  if (stance === EFleetStance.Defend) {
    return Shield(16, 12, {
      color,
      borderThickness: 1,
      alpha: 0.75,
      position,
      id,
      center: true,
    });
  }

  if (stance === EFleetStance.Block) {
    return Square(16, 16, {
      color,
      borderThickness: 1,
      alpha: 0.75,
      position,
      id,
      rotate: 45,
      center: true,
    });
  }
  return Circle(8, {
    color,
    borderThickness: 1,
    alpha: 0.75,
    position,
    id,
  });
}

export const renderEntityOrbitingFleets = (rockEntity: Entity, scene: Scene) => {
  const objIndexSuffix = "_spacerockOrbits";
  const { tileWidth, tileHeight } = scene.tilemap;
  const playerEntity = components.Account.get()?.value;
  if (!playerEntity) return;
  const allFleets = getOrbitingFleets(rockEntity);
  const destination = components.Position.get(rockEntity);
  scene.objectPool.removeGroup(rockEntity + objIndexSuffix);
  if (!destination || allFleets.length == 0) return;

  const destinationPixelCoord = tileCoordToPixelCoord({ x: destination.x, y: -destination.y }, tileWidth, tileHeight);

  const fleetOrbit = scene.objectPool.getGroup(rockEntity + objIndexSuffix);

  fleetOrbit.add("Graphics").setComponents([
    ObjectPosition(destinationPixelCoord, DepthLayers.Path),
    Circle(orbitRadius, {
      color: 0x363636,
      borderThickness: 1,
      alpha: 0,
    }),
    SetValue({
      input: null,
    }),
  ]);

  const revolutionDuration = 60;
  allFleets.forEach((fleet, i) => {
    const owner = components.OwnedBy.get(fleet)?.value as Entity | undefined;
    const relationship = owner ? getRockRelationship(playerEntity, owner as Entity) : RockRelationship.Neutral;
    const name = entityToFleetName(fleet, true);

    const now = components.Time.get()?.value ?? 0n;
    const addedOffset = (Number(now) / revolutionDuration) % 360;
    const offset = addedOffset + ((i + 1) / allFleets.length) * 360;
    const fleetPosition = calculatePosition(offset, destinationPixelCoord);

    const sharedComponents = [ObjectPosition(fleetPosition, DepthLayers.Marker)];
    const fleetOrbitObject = fleetOrbit.add("Graphics", fleet + "_fleetOrbit");
    const fleetHomeLineObject = fleetOrbit.add("Graphics");

    fleetOrbitObject.setComponents([
      ...sharedComponents,
      getFleetShape(fleet, { x: fleetPosition.x, y: fleetPosition.y }),
      OnOnce((gameObject) => {
        const hoverSize = 16;
        gameObject.setInteractive(
          new Phaser.Geom.Rectangle(-hoverSize / 2, -hoverSize / 2, hoverSize, hoverSize),
          Phaser.Geom.Rectangle.Contains
        );
      }),

      OnHover(
        () => {
          components.HoverEntity.set({ value: fleet });
        },
        () => {
          components.HoverEntity.remove();
        }
      ),
      OnComponentSystem(
        components.FleetStance,
        (gameObject, { entity, value: [newVal, oldVal] }) => {
          if (entity !== fleet || oldVal?.stance === newVal?.stance) return;
          const id = `fleetShape-${fleet}`;
          if (fleetOrbitObject.hasComponent(id)) {
            fleetOrbitObject.removeComponent(id);
            const shape = getFleetShape(fleet, { x: gameObject.x, y: gameObject.y });
            fleetOrbitObject.setComponent(shape);
          }
        },
        { runOnInit: false }
      ),
      OnComponentSystem(components.SelectedFleet, (_, { value: [newVal, oldVal] }) => {
        const id = `homeLine-${fleet}`;
        if (newVal?.value == fleet) {
          fleetHomeLineObject.setComponent(
            Line(tileCoordToPixelCoord({ x: ownerPosition.x, y: -ownerPosition.y }, tileWidth, tileHeight), {
              id,
              thickness: Math.min(10, 3 / scene.camera.phaserCamera.zoom),
              alpha: 0.2,
              color: 0x696969,
            })
          );
        } else if (oldVal?.value == fleet) {
          fleetHomeLineObject.removeComponent(id);
        }
      }),

      OnClickUp(scene, (gameObject) => {
        const attackOrigin = components.Attack.get()?.originFleet;
        if (attackOrigin) {
          if (getCanAttack(attackOrigin, fleet)) components.Attack.setDestination(fleet);
          else toast.error("Cannot attack this fleet.");
          return;
        }
        if (!gameObject || relationship !== RockRelationship.Self) return;

        components.SelectedFleet.set({
          value: fleet,
        });
      }),
    ]);

    const ownerPosition = components.Position.get(owner) ?? { x: 0, y: 0 };

    const fleetLabel = fleetOrbit.add("BitmapText");
    let subscription: Subscription | null = null;

    const subscribeToUpdates = (tween: Phaser.Tweens.Tween) =>
      merge(
        components.SelectedFleet.update$,
        components.SelectedRock.update$,
        components.BattleRender.update$
      ).subscribe(() => {
        const selectedAsteroid = components.SelectedRock.get()?.value;
        const battlePosition = components.BattleRender.get()?.value;
        const selectedFleet = components.SelectedFleet.get()?.value;
        const fleetRock = components.FleetMovement.get(selectedFleet)?.destination as Entity;

        if (
          !tween.isDestroyed() &&
          (fleetRock !== rockEntity || (selectedAsteroid !== rockEntity && battlePosition !== rockEntity))
        ) {
          tween.play();
        }
      });

    const unsubscribeFromUpdates = () => {
      // Check if subscription exists and then unsubscribe
      if (subscription) {
        subscription.unsubscribe();
        subscription = null; // Optional: Clean up the reference
      }
    };
    const gracePeriod = fleetOrbit.add("Sprite");

    gracePeriod.setComponents([
      ...sharedComponents,
      SetValue({ scale: 0.25, originX: 0.5, originY: 1.2 }),

      OnComponentSystem(components.Time, (gameObject) => {
        const graceTime = components.GracePeriod.get(fleet)?.value ?? 0n;
        const time = components.Time.get()?.value ?? 0n;

        if (time >= graceTime) {
          gameObject.alpha = 0;
        } else {
          gameObject.alpha = 1;
        }
      }),
      Texture(Assets.SpriteAtlas, SpriteKeys.GracePeriod),
      SetValue({
        depth: DepthLayers.Marker + 1,
        input: null,
      }),
    ]);
    fleetLabel.setComponents([
      ...sharedComponents,
      SetValue({
        originX: 0.5,
        originY: 0.4,
        depth: DepthLayers.Marker + 2,
      }),
      ObjectText(name, {
        id: "fleetLabel",
        fontSize: 6,
        color: 0xffffff,
        stroke: 0x000000,
      }),
      TweenCounter(scene, {
        from: 0,
        to: 360,
        duration: revolutionDuration * 1000, // Duration of one complete revolution in milliseconds
        repeat: -1, // -1 makes the tween loop infinitely
        onPause: (tween) => {
          subscribeToUpdates(tween);
        },
        onStart: () => {
          unsubscribeFromUpdates();
        },
        onUpdate: (...[tween, , , current]) => {
          const selectedFleet = components.SelectedFleet.get()?.value;
          const fleetRock = components.FleetMovement.get(selectedFleet)?.destination as Entity;
          const selectedAsteroid = components.SelectedRock.get()?.value;
          const battlePosition = components.BattleRender.get()?.value;
          if ([fleetRock, selectedAsteroid, battlePosition].includes(rockEntity)) {
            tween.pause();
            return;
          }
          const angleRads = Phaser.Math.DegToRad(current + offset);
          const x = destinationPixelCoord.x + orbitRadius * Math.cos(angleRads);
          const y = destinationPixelCoord.y + orbitRadius * Math.sin(angleRads);
          fleetOrbitObject.setComponent(ObjectPosition({ x, y }, DepthLayers.Marker));
          fleetLabel.setComponent(ObjectPosition({ x, y }, DepthLayers.Marker + 2));
          fleetHomeLineObject.setComponent(ObjectPosition({ x, y }, DepthLayers.Marker - 1));
          gracePeriod.setComponent(ObjectPosition({ x, y }, DepthLayers.Marker + 1));
        },
      }),
    ]);
  });
};

export const renderFleetsInOrbit = (scene: Scene) => {
  const systemsWorld = namespaceWorld(world, "systems");

  defineComponentSystem(systemsWorld, components.FleetMovement, (update) => {
    const newMovement = update.value[0];
    if (newMovement) {
      const time = components.Time.get()?.value ?? 0n;
      const arrivalTime = newMovement.arrivalTime ?? 0n;
      if (arrivalTime < time) {
        renderEntityOrbitingFleets(newMovement.destination as Entity, scene);
      }
    }
    if (update.value[1]) renderEntityOrbitingFleets(update.value[1].destination as Entity, scene);
  });

  defineEnterSystem(systemsWorld, [Has(components.SelectedFleet)], () => {
    components.SelectedRock.remove();
  });

  defineEnterSystem(systemsWorld, [Has(components.SelectedRock)], () => {
    components.SelectedFleet.remove();
  });
};
