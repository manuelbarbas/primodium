import { Entity, Metadata } from "@primodiumxyz/reactive-tables";

export type NotificationType = "battle" | "arrival-transit" | "arrival-orbit";
export type Notification = {
  id: string;
  entity: Entity;
  timestamp: number;
  type: NotificationType;
};

export type TxQueueOptions<M extends Metadata> = {
  id: string;
  force?: true;
  metadata?: M;
};
