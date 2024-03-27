import { Entity } from "@latticexyz/recs";
import { Fleet } from "../lib/objects/Fleet";
import { Scene } from "engine/types";

export function createObjectApi(scene: Scene) {
  function getFleet(entity: Entity) {
    const fleet = scene.objects.get(entity);
    if (!fleet || !(fleet instanceof Fleet)) return;
    return fleet;
  }

  return {
    getFleet,
  };
}
