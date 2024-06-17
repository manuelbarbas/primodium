import { Tables } from "@primodiumxyz/core";
import { Entity } from "@primodiumxyz/reactive-tables";
import { EFleetStance } from "contracts/config/enums";

import { Fleet } from "@/lib/objects/Fleet";
import { PrimodiumScene } from "@/types";
import { StanceToIcon } from "@/lib/mappings";

export function renderFleet(args: { scene: PrimodiumScene; entity: Entity; tables: Tables }) {
  const { scene, entity, tables } = args;
  const fleet = scene.objects.fleet.get(entity);

  if (fleet) return fleet;

  const newFleet = new Fleet({ id: entity, scene, coord: { x: 0, y: 0 } })
    .onClick(() => {
      tables.SelectedFleet.set({
        value: entity,
      });
      // audioApi.play("Bleep", "ui");
    })
    .onHoverEnter(() => {
      tables.HoverEntity.set({
        value: entity,
      });
    })
    .onHoverExit(() => {
      tables.HoverEntity.remove();
    });

  //set ownership
  const playerEntity = tables.Account.get()?.value;
  const ownerEntity = tables.OwnedBy.get(tables.OwnedBy.get(entity)?.value as Entity | undefined)?.value;
  const isOwnedByPlayer = playerEntity === ownerEntity;
  if (!isOwnedByPlayer) newFleet.setRelationship("Enemy");

  // set stance icon
  const stance = tables.FleetStance.get(entity)?.stance as EFleetStance | undefined;
  if (stance) newFleet.setStanceIcon(StanceToIcon[stance]);

  // set empty status
  const isEmpty = tables.IsFleetEmpty.get(entity)?.value;
  if (isEmpty) newFleet.setAlpha(0.5);

  return newFleet;
}
