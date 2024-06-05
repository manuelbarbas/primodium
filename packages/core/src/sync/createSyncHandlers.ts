import { SyncStep } from "@/lib/types";
import { Entity } from "@latticexyz/recs";
import { Core } from "@/lib/types";

export function createSyncHandlers(
  { components }: Core,
  syncId: Entity,
  message: {
    progress: string;
    complete: string;
    error: string;
  }
) {
  return [
    (_: number, ___: bigint, progress: number) => {
      components.SyncStatus.set(
        {
          step: SyncStep.Syncing,
          progress,
          message: message.progress,
        },
        syncId
      );

      if (progress === 1) {
        components.SyncStatus.set(
          {
            step: SyncStep.Complete,
            progress,
            message: message.complete,
          },
          syncId
        );
      }
    },
    // on error
    (e: unknown) => {
      console.error(e);
      components.SyncStatus.set(
        {
          step: SyncStep.Error,
          progress: 0,
          message: message.error,
        },
        syncId
      );
    },
  ];
}
