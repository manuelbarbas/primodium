import { Entity } from "@latticexyz/recs";
import { Fleet } from "../lib/objects/Fleet";
import { Scene } from "engine/types";
import { TransitLine } from "../lib/objects/TransitLine";
import { BaseAsteroid } from "../lib/objects/Asteroid/BaseAsteroid";

export function createObjectApi(scene: Scene) {
  function getFleet(entity: Entity) {
    const fleet = scene.objects.get(entity);
    if (!fleet || !(fleet instanceof Fleet)) return;
    return fleet;
  }

  function getTransitLine(entity: Entity) {
    const transitLine = scene.objects.get(`transit_${entity}`);
    if (!transitLine || !(transitLine instanceof TransitLine)) return;
    return transitLine;
  }

  function getAsteroid(entity: Entity) {
    const asteroid = scene.objects.get(entity);
    if (!asteroid || !(asteroid instanceof BaseAsteroid)) return;
    return asteroid;
  }

  return {
    getFleet,
    getTransitLine,
    getAsteroid,
  };
}
