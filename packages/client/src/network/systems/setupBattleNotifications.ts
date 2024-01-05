// import { SyncState } from "@latticexyz/network";
import { Entity, defineComponentSystem } from "@latticexyz/recs";
import { toast } from "react-toastify";
import { entityToAddress } from "src/util/common";
import { components } from "../components";
import { MUD } from "../types";
import { world } from "../world";

export function setupBattleNotifications(mud: MUD) {
  const playerEntity = mud.playerAccount.entity;
  const { BattleResult, Arrival, BlockNumber, Position } = components;
  defineComponentSystem(world, BattleResult, (update) => {
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

  const orbitingQueue = new Map<Entity, bigint>();
  defineComponentSystem(world, Arrival, (update) => {
    const now = components.Time.get()?.value ?? 0n;
    const entity = update.entity;

    const arrival = update.value[0];

    if (arrival?.from !== playerEntity && arrival?.to !== playerEntity) return;

    //it has arrived
    if (arrival.sendTime + 30n < now) return;

    toast.info(`Your fleet is en route and will arrive in ${(arrival.arrivalTime - now) / 60n} minute(s).`);
    orbitingQueue.set(entity, arrival.arrivalTime);
  });

  defineComponentSystem(world, BlockNumber, () => {
    const now = components.Time.get()?.value ?? 0n;

    orbitingQueue.forEach((arrivalTime, entityId) => {
      const arrival = Arrival.getWithId(entityId);

      if (!arrival) return;

      const destination = Position.get(arrival.destination);
      if (now > arrivalTime) {
        toast.info(`Your fleet has arrived at [${destination?.x ?? 0}, ${destination?.y ?? 0}].`);

        orbitingQueue.delete(entityId);
      }
    });
  });
}
