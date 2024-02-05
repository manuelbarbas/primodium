import { DepthLayers } from "@game/constants";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { Entity, Has, defineComponentSystem, defineEnterSystem, namespaceWorld } from "@latticexyz/recs";
import { Scene } from "engine/types";
import { Subscription, merge } from "rxjs";
import { components } from "src/network/components";
import { world } from "src/network/world";
import { getRockRelationship } from "src/util/asteroid";
import { RockRelationship } from "src/util/constants";
import { entityToFleetName } from "src/util/name";
import { getAllOrbitingFleets } from "src/util/unit";
import {
  ObjectPosition,
  OnClickUp,
  OnComponentSystem,
  OnHover,
  OnOnce,
  SetValue,
  TweenCounter,
} from "../../common/object-components/common";
import { Circle, Line } from "../../common/object-components/graphics";
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

export const renderEntityOrbitingFleets = (rockEntity: Entity, scene: Scene) => {
  const objIndexSuffix = "_spacerockOrbits";
  const { tileWidth, tileHeight } = scene.tilemap;
  const playerEntity = components.Account.get()?.value;
  if (!playerEntity) return;
  const allFleets = getAllOrbitingFleets(rockEntity);
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

  const revolutionDuration = 120;

  allFleets.forEach((fleet, i) => {
    const owner = components.OwnedBy.get(fleet)?.value as Entity | undefined;
    const relationship = owner ? getRockRelationship(playerEntity, owner as Entity) : RockRelationship.Neutral;
    const color =
      relationship === RockRelationship.Ally ? 0x00ff00 : relationship === RockRelationship.Enemy ? 0xff0000 : 0x00ffff;
    const name = entityToFleetName(fleet, true);

    const now = components.Time.get()?.value ?? 0n;
    const offset = (Number(now) / revolutionDuration) % 360;
    const angle = offset + ((i + 1) / allFleets.length) * 360;
    const fleetPosition = calculatePosition(angle, destinationPixelCoord);

    const sharedComponents = [ObjectPosition(fleetPosition, DepthLayers.Marker), SetValue({ originX: 1, originY: -1 })];
    const fleetOrbitObject = fleetOrbit.add("Graphics");
    const fleetHomeLineObject = fleetOrbit.add("Graphics");

    fleetOrbitObject.setComponents([
      ...sharedComponents,
      Circle(8, {
        color,
        borderThickness: 1,
        alpha: 0.75,
        position: fleetPosition,
        id: `circle-${i}`,
      }),
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
      OnComponentSystem(components.SelectedFleet, (_, { value: [newVal, oldVal] }) => {
        const id = `homeLine-${fleet}`;
        if (newVal?.fleet == fleet) {
          fleetHomeLineObject.setComponent(
            Line(tileCoordToPixelCoord({ x: ownerPosition.x, y: -ownerPosition.y }, tileWidth, tileHeight), {
              id,
              thickness: Math.min(10, 3 / scene.camera.phaserCamera.zoom),
              alpha: 0.25,
              color: 0xffffff,
            })
          );
        } else if (oldVal?.fleet == fleet) {
          fleetHomeLineObject.removeComponent(id);
        }
      }),

      OnClickUp(scene, (gameObject) => {
        if (!gameObject || relationship !== RockRelationship.Self) return;
        const position = { x: gameObject.x, y: -gameObject.y };

        const tilePosition = { x: position.x / tileWidth, y: position.y / tileHeight };
        components.SelectedFleet.set({
          fleet,
          asteroid: rockEntity,
          ...tilePosition,
          angle,
        });
      }),
    ]);

    const ownerPosition = components.Position.get(owner) ?? { x: 0, y: 0 };

    const fleetLabel = fleetOrbit.add("BitmapText");
    let subscription: Subscription | null = null;

    const subscribeToUpdates = (tween: Phaser.Tweens.Tween) =>
      merge(components.SelectedFleet.update$, components.SelectedRock.update$).subscribe(() => {
        const asteroid = components.SelectedFleet.get()?.asteroid;
        const selectedAsteroid = components.SelectedRock.get()?.value;

        if (asteroid !== rockEntity || selectedAsteroid !== rockEntity) {
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

    fleetLabel.setComponents([
      ...sharedComponents,
      SetValue({
        originX: 0.5,
        originY: 0.4,
        depth: DepthLayers.Marker + 1,
      }),
      ObjectText(name, {
        id: "fleetLabel",
        fontSize: 6,
        color: 0xffffff,
      }),
      TweenCounter(scene, {
        from: 0,
        to: 360,
        duration: 60 * 1000, // Duration of one complete revolution in milliseconds
        repeat: -1, // -1 makes the tween loop infinitely
        onPause: (tween) => {
          subscribeToUpdates(tween);
        },
        onStart: () => {
          unsubscribeFromUpdates();
        },
        onUpdate: (...[tween, , , current]) => {
          const asteroid = components.SelectedFleet.get()?.asteroid;
          const selectedAsteroid = components.SelectedRock.get()?.value;
          if (asteroid == rockEntity || selectedAsteroid == rockEntity) {
            tween.pause();
            return;
          }
          const angleRads = Phaser.Math.DegToRad(current + offset);
          const x = destinationPixelCoord.x + orbitRadius * Math.cos(angleRads);
          const y = destinationPixelCoord.y + orbitRadius * Math.sin(angleRads);
          fleetOrbitObject.setComponent(ObjectPosition({ x, y }, DepthLayers.Marker));
          fleetLabel.setComponent(ObjectPosition({ x, y }, DepthLayers.Marker + 1));
          fleetHomeLineObject.setComponent(ObjectPosition({ x, y }, DepthLayers.Marker - 1));
        },
      }),
    ]);
  });
};

export const renderFleetsInOrbit = (scene: Scene) => {
  const systemsWorld = namespaceWorld(world, "systems");

  defineComponentSystem(systemsWorld, components.FleetMovement, (update) => {
    if (update.value[0]) renderEntityOrbitingFleets(update.value[0].destination as Entity, scene);
    if (update.value[1]) renderEntityOrbitingFleets(update.value[1].destination as Entity, scene);
  });

  defineEnterSystem(systemsWorld, [Has(components.SelectedFleet)], () => {
    components.SelectedRock.remove();
  });

  defineEnterSystem(systemsWorld, [Has(components.SelectedRock)], () => {
    components.SelectedFleet.remove();
  });
};
