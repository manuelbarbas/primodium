import { BaseTableMetadata, Entity } from "@primodiumxyz/reactive-tables";

export type NotificationType = "battle" | "arrival-transit" | "arrival-orbit";
export type Notification = {
  id: string;
  entity: Entity;
  timestamp: number;
  type: NotificationType;
};

export type TxQueueOptions<M extends BaseTableMetadata = BaseTableMetadata> = {
  id: string;
  force?: true;
  metadata?: M;
};
