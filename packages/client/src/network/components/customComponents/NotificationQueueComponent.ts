import { world } from "src/network/world";
import newComponent from "./Component";
import { EntityID, Type } from "@latticexyz/recs";

export type Notification = {
  id: EntityID;
  timestamp: number;
};

export const NotificationQueueComponent = () => {
  const component = newComponent(
    world,
    {
      id: Type.EntityArray,
      timestamp: Type.NumberArray,
    },
    {
      id: "NotificationQueue",
      metadata: { contractId: `component.NotificationQueue` },
    }
  );

  const addNotification = (notification: Notification) => {
    const currentData = component.get() || {
      id: [],
      timestamp: [],
    };
    currentData.id.push(notification.id);
    currentData.timestamp.push(notification.timestamp);
    component.set(currentData);
  };

  const removeNotification = (id: EntityID) => {
    const currentData = component.get() || {
      id: [],
      timestamp: [],
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
