// import { SyncState } from "@latticexyz/network";
import { Entity, defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { toast } from "react-toastify";
import { entityToAddress } from "src/util/common";
import { components } from "../components";
import { MUD } from "../types";
import { world } from "../world";

export function setupBattleNotifications(mud: MUD) {
  const systemWorld = namespaceWorld(world, "systems");
  const playerEntity = mud.playerAccount.entity;
  const { BattleResult, FleetMovement, BlockNumber, Position } = components;
  defineComponentSystem(systemWorld, BattleResult, (update) => {
    const now = components.Time.get()?.value ?? 0n;

    const battle = update.value[0];

    if (!battle) return;

    if (battle.timestamp + 30n < now) return;

    const winner = battle.winner;
    if (battle.attacker === playerEntity) {
      playerEntity === winner
        ? toast.success(
            `Victory! You attacked ${entityToAddress(
              playerEntity,
              true
            )} and won! View details in the battle reports pane.`
          )
        : toast.error(
            `Defeat! You attacked ${entityToAddress(
              playerEntity,
              true
            )} and lost! View details in the battle reports pane.`
          );
    }

    if (battle.defender === playerEntity) {
      playerEntity === winner
        ? toast.success(
            `Victory! You defended against ${entityToAddress(
              playerEntity,
              true
            )} and won! View details in the battle reports pane.`
          )
        : toast.error(
            `Defeat! You defended against ${entityToAddress(
              playerEntity,
              true
            )} and lost! View details in the battle reports pane.`
          );
    }
  });

  const fleetTransitQueue = new Map<Entity, bigint>();
  defineComponentSystem(systemWorld, FleetMovement, (update) => {
    const ownerRock = components.OwnedBy.get(update.entity)?.value as Entity | undefined;
    const ownerRockOwner = components.OwnedBy.get(ownerRock)?.value;
    const player = components.Account.get()?.value;
    const now = components.Time.get()?.value ?? 0n;
    const entity = update.entity;

    const arrival = update.value[0];
    if (!arrival) return;

    if (!ownerRockOwner || ownerRockOwner !== player) return;

    //it has arrived
    if (arrival.sendTime + 30n < now) return;
    const minutes = (arrival.arrivalTime - now) / 60n;
    const seconds = (arrival.arrivalTime - now) % 60n;
    const output = minutes > 0 ? `${minutes} minute(s)` : `${seconds} seconds`;

    toast.info(`Your fleet is en route and will arrive in ${output}.`);
    fleetTransitQueue.set(entity, arrival.arrivalTime);
  });

  defineComponentSystem(systemWorld, BlockNumber, () => {
    const now = components.Time.get()?.value ?? 0n;

    fleetTransitQueue.forEach((arrivalTime, entityId) => {
      const arrival = FleetMovement.get(entityId);

      if (!arrival) return;

      const destination = Position.get(arrival.destination as Entity);
      if (now > arrivalTime) {
        toast.info(`Your fleet has arrived at [${destination?.x ?? 0}, ${destination?.y ?? 0}].`);

        fleetTransitQueue.delete(entityId);
      }
    });
  });
}
