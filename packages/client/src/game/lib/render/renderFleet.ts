import { Fleet } from "@/game/lib/objects/Fleet";
import { components } from "@/network/components";
import { Entity } from "@latticexyz/recs";
import { PrimodiumScene } from "@/game/api/scene";
import { isDomInteraction } from "@/util/canvas";

export function renderFleet(args: { scene: PrimodiumScene; entity: Entity }) {
  const { scene, entity } = args;
  //TODO: replace with hanks fancy api stuff
  const fleet = scene.objects.fleet.get(entity);

  if (fleet) return fleet;

  const newFleet = new Fleet({ id: entity, scene, coord: { x: 0, y: 0 } })
    .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, (pointer: Phaser.Input.Pointer) => {
      if (isDomInteraction(pointer, "up")) return;
      if (pointer.downElement.nodeName !== "CANVAS") return;

      components.SelectedFleet.set({
        value: entity,
      });
      // audioApi.play("Bleep", "ui");
    })
    .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
      components.HoverEntity.set({
        value: entity,
      });
    })
    .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
      components.HoverEntity.remove();
    });

  return newFleet;
}
