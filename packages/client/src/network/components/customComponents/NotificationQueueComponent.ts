import { world } from "src/network/world";
import newComponent from "./Component";
import { Type } from "@latticexyz/recs";

export type Notification = {
  id: string;
  message: string;
  icon: string;
  timestamp: number;
};

export const NotificationQueueComponent = () => {
  const component = newComponent(
    world,
    {
      id: Type.StringArray,
      message: Type.StringArray,
      icon: Type.StringArray,
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
      icon: [],
      timestamp: [],
    };
    currentData.id.push(notification.id);
    currentData.message.push(notification.message);
    currentData.icon.push(notification.icon);
    currentData.timestamp.push(notification.timestamp);
    component.set(currentData);
  };

  const removeNotification = (id: string) => {
    const currentData = component.get() || {
      id: [],
      message: [],
      icon: [],
      timestamp: [],
    };
    const index = currentData.id.indexOf(id);
    if (index !== -1) {
      currentData.id.splice(index, 1);
      currentData.message.splice(index, 1);
      currentData.icon.splice(index, 1);
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
