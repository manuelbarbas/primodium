import { Fleet } from "@/game/lib/objects/Fleet";
import { components } from "@/network/components";
import { createObjectApi } from "@/game/api/objects";
import { Entity } from "@latticexyz/recs";
import { Scene } from "engine/types";

export function renderFleet(args: { scene: Scene; entity: Entity }) {
  const { scene, entity } = args;
  //TODO: replace with hanks fancy api stuff
  const objects = createObjectApi(scene);
  const fleet = objects.getFleet(entity);

  if (fleet) return fleet;

  const newFleet = new Fleet(scene, { x: 0, y: 0 })
    .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, (pointer: Phaser.Input.Pointer) => {
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

  scene.objects.add(entity, newFleet);

  return newFleet;
}
