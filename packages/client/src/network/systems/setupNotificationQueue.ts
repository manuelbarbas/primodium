import { defineComponentSystem } from "@latticexyz/recs";
import { world } from "../world";
import {
  Battle,
  Account,
  NotificationQueue,
  BlockNumber,
} from "../components/clientComponents"; // Update with actual Battle and Player component imports
import { Notification } from "../components/customComponents/NotificationQueueComponent";

export function setupNotificationQueue() {
  defineComponentSystem(world, Battle, (update) => {
    const playerAddress = Account.get()?.value; // Assuming Player component has an 'address' field
    const battle = update.value[0];
    if (!battle) return;
    if (
      battle.attacker === playerAddress ||
      battle.defender === playerAddress
    ) {
      const newNotification: Notification = {
        id: world.entities[update.entity],
        timestamp: Date.now(),
      };

      NotificationQueue.addNotification(newNotification);
    }
  });

  const length = 100000;
  defineComponentSystem(world, BlockNumber, () => {
    const currentTime = Date.now();
    const notifications = NotificationQueue.get();
    notifications?.id.forEach((id, index) => {
      const timestamp = notifications.timestamp[index];
      if (currentTime - timestamp >= length) {
        NotificationQueue.removeNotification(id);
      }
    });
  });
}
