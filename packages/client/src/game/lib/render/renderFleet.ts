import { Fleet } from "@/game/lib/objects/Fleet";
import { components } from "@/network/components";
import { Entity } from "@latticexyz/recs";
import { PrimodiumScene } from "@/game/api/scene";

export function renderFleet(args: { scene: PrimodiumScene; entity: Entity }) {
  const { scene, entity } = args;
  const fleet = scene.objects.fleet.get(entity);

  if (fleet) return fleet;

  const newFleet = new Fleet({ id: entity, scene, coord: { x: 0, y: 0 } })
    .onClick(() => {
      components.SelectedFleet.set({
        value: entity,
      });
      // audioApi.play("Bleep", "ui");
    })
    .onHoverEnter(() => {
      components.HoverEntity.set({
        value: entity,
      });
    })
    .onHoverExit(() => {
      components.HoverEntity.remove();
    });

  return newFleet;
}
