import { EntityID, defineComponentSystem } from "@latticexyz/recs";
import { world } from "../world";
import {
  Battle,
  Account,
  NotificationQueue,
  BlockNumber,
} from "../components/clientComponents"; // Update with actual Battle and Player component imports
import { Notification } from "../components/customComponents/NotificationQueueComponent";
import { Arrival, LoadingState, Position } from "../components/chainComponents";
import { SingletonID, SyncState } from "@latticexyz/network";
import { uuid } from "@latticexyz/utils";
import { toast } from "react-toastify";

const LENGTH = 3500;

export function setupNotificationQueue() {
  defineComponentSystem(world, Battle, (update) => {
    if (LoadingState.get()?.state !== SyncState.LIVE) return;
    const playerAddress = Account.get()?.value; // Assuming Player component has an 'address' field
    const battle = update.value[0];
    if (!battle) return;
    if (
      battle.attacker === playerAddress ||
      battle.defender === playerAddress
    ) {
      const newNotification: Notification = {
        id: uuid(),
        entity: world.entities[update.entity],
        timestamp: Date.now(),
        type: "battle",
      };

      NotificationQueue.addNotification(newNotification);

      toast.info(
        "A battle has taken place. View Battle Reports for more info..."
      );
    }
  });

  const usedArrivals = new Set<EntityID>();
  const orbitingQueue = new Map<EntityID, number>();
  defineComponentSystem(world, Arrival, (update) => {
    if (LoadingState.get()?.state !== SyncState.LIVE) return;
    const playerAddress = Account.get()?.value; // Assuming Player component has an 'address' field
    const blockNumber = BlockNumber.get()?.value ?? 0;
    if (!playerAddress) return;
    const entityId = world.entities[update.entity];
    if (usedArrivals.has(entityId)) {
      return;
    }
    usedArrivals.add(entityId);
    const arrival = Arrival.getWithId(entityId);
    if (arrival?.from !== playerAddress && arrival?.to !== playerAddress)
      return;
    if (Number(arrival.arrivalBlock) < blockNumber) return;
    const newNotification: Notification = {
      id: uuid(),
      entity: world.entities[update.entity],
      timestamp: Date.now(),
      type: "arrival-transit",
    };

    NotificationQueue.addNotification(newNotification);
    orbitingQueue.set(entityId, Number(arrival.arrivalBlock));

    const coord = Position.get(arrival.destination, {
      x: 0,
      y: 0,
      parent: SingletonID,
    });

    toast.info(`Your fleet on its way to [${coord.x}, ${coord.y}]`);
  });

  defineComponentSystem(world, BlockNumber, ({ value: [block] }) => {
    if (LoadingState.get()?.state !== SyncState.LIVE) return;
    const blockNumber = block?.value ?? 0;
    const currentTime = Date.now();
    const notifications = NotificationQueue.get();
    notifications?.ids.forEach((id, index) => {
      const timestamp = notifications.timestamp[index];
      if (currentTime - timestamp >= LENGTH) {
        NotificationQueue.removeNotification(id);
      }
    });
    orbitingQueue.forEach((arrivalBlock, entityId) => {
      if (blockNumber > arrivalBlock) {
        const newNotification: Notification = {
          id: uuid(),
          entity: entityId,
          timestamp: Date.now(),
          type: "arrival-orbit",
        };

        NotificationQueue.addNotification(newNotification);
        orbitingQueue.delete(entityId);

        toast.info(
          `Your fleet has arrived at its destination. Awaiting your command...`
        );
      }
    });
  });
}
