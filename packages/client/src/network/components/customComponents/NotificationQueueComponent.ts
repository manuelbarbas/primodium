import { world } from "src/network/world";
import newComponent from "./Component";
import { EntityID, Type } from "@latticexyz/recs";

export type Notification = {
  id: EntityID;
  message: string;
  status: string;
  timestamp: number;
};

export const NotificationQueueComponent = () => {
  const component = newComponent(
    world,
    {
      id: Type.EntityArray,
      message: Type.StringArray,
      status: Type.StringArray,
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
      message: [],
      status: [],
      timestamp: [],
    };
    currentData.id.push(notification.id);
    currentData.message.push(notification.message);
    currentData.status.push(notification.status);
    currentData.timestamp.push(notification.timestamp);
    component.set(currentData);
  };

  const removeNotification = (id: EntityID) => {
    const currentData = component.get() || {
      id: [],
      message: [],
      status: [],
      timestamp: [],
    };
    const index = currentData.id.indexOf(id);
    if (index !== -1) {
      currentData.id.splice(index, 1);
      currentData.message.splice(index, 1);
      currentData.status.splice(index, 1);
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
