// import { SyncState } from "@latticexyz/network";
import { Entity, defineComponentSystem } from "@latticexyz/recs";
import { world } from "../world";
import { components } from "../components";
import { SetupResult } from "../types";
import { toast } from "react-toastify";
import { entityToAddress } from "src/util/common";
import { SyncStep } from "@latticexyz/store-sync";
import { getNow } from "src/util/time";

export function setupBattleNotifications(mud: SetupResult) {
  const playerEntity = mud.network.playerEntity;
  const { BattleResult, SyncProgress, Arrival, BlockNumber, Position } = components;
  defineComponentSystem(world, BattleResult, (update) => {
    if (SyncProgress.get()?.step !== SyncStep.LIVE) return;

    const battle = update.value[0];

    if (!battle) return;

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
    if (SyncProgress.get()?.step !== SyncStep.LIVE || !update.value[0]) return;

    const now = getNow();
    const entity = update.entity;

    const arrival = update.value[0];

    if (arrival?.from !== playerEntity && arrival?.to !== playerEntity) return;

    //it has arrived
    if (arrival.arrivalTime < now) return;

    toast.info(`Your fleet is en route and will arrive in ${(arrival.arrivalTime - now) / 60n} minute(s).`);
    orbitingQueue.set(entity, arrival.arrivalTime);
  });

  defineComponentSystem(world, BlockNumber, () => {
    if (SyncProgress.get()?.step !== SyncStep.LIVE) return;

    const now = getNow();

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
