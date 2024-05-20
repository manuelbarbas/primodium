import { Fleet } from "@/game/lib/objects/Fleet";
import { components } from "@/network/components";
import { Entity } from "@latticexyz/recs";
import { PrimodiumScene } from "@/game/api/scene";
import { StanceToIcon } from "@/game/lib/mappings";
import { EFleetStance } from "contracts/config/enums";

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

  //set ownership
  const playerEntity = components.Account.get()?.value;
  const ownerEntity = components.OwnedBy.get(components.OwnedBy.get(entity)?.value as Entity | undefined)?.value;
  const isOwnedByPlayer = playerEntity === ownerEntity;
  if (!isOwnedByPlayer) newFleet.setRelationship("Enemy");

  // set stance icon
  const stance = components.FleetStance.get(entity)?.stance as EFleetStance | undefined;
  if (stance) newFleet.setStanceIcon(StanceToIcon[stance]);

  // set empty status
  const isEmpty = components.IsFleetEmpty.get(entity)?.value;
  if (isEmpty) newFleet.setAlpha(0.5);

  return newFleet;
}
