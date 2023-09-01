import { world } from "src/network/world";
import newComponent from "./Component";
import { EntityID, Type } from "@latticexyz/recs";

export type NotificationType = "battle" | "arrival-transit" | "arrival-orbit";
export type Notification = {
  id: EntityID;
  timestamp: number;
  type: NotificationType;
};

export const NotificationQueueComponent = () => {
  const component = newComponent(
    world,
    {
      id: Type.EntityArray,
      timestamp: Type.NumberArray,
      type: Type.StringArray,
    },
    {
      id: "NotificationQueue",
      metadata: { contractId: `component.NotificationQueue` },
    }
  );

  const addNotification = (notification: Notification) => {
    const currentData = component.get() || {
      id: new Array<EntityID>(),
      timestamp: new Array<number>(),
      type: new Array<NotificationType>(),
    };
    currentData.id.push(notification.id);
    currentData.timestamp.push(notification.timestamp);
    currentData.type.push(notification.type);
    component.set(currentData);
  };

  const removeNotification = (id: EntityID) => {
    const currentData = component.get() || {
      id: [],
      timestamp: [],
      type: [],
    };
    const index = currentData.id.indexOf(id);
    if (index !== -1) {
      currentData.id.splice(index, 1);
      currentData.timestamp.splice(index, 1);
    }
    component.set(currentData);
  };

  return {
    ...component,
    addNotification,
    removeNotification,
  };
};
