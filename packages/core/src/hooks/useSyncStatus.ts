import { Entity } from "@latticexyz/recs";
import { useMud } from "./useMud";
import { SyncSourceType, SyncStep } from "@/lib/types";
import { useEffect, useState } from "react";
import { singletonEntity } from "@latticexyz/store-sync/recs";

export const useSyncStatus = (syncId?: Entity) => {
  const { components } = useMud();
  const syncSource = components.SyncSource.use()?.value;
  const syncEntity = syncSource === SyncSourceType.RPC ? singletonEntity : syncId;
  const syncStatus = components.SyncStatus.use(syncEntity)?.step;
  const syncProgress = components.SyncStatus.use(syncEntity)?.progress;
  const syncMessage = components.SyncStatus.use(syncEntity)?.message;

  const [loading, setLoading] = useState(syncStatus ? syncStatus !== SyncStep.Complete : true);
  const [error, setError] = useState(syncStatus === SyncStep.Error);

  //TODO: sync with time updates
  useEffect(() => {
    if (syncStatus === undefined) return;
    if (syncStatus === SyncStep.Complete) {
      setLoading(false);
      setError(false);
    } else if (syncStatus === SyncStep.Error) {
      setLoading(false);
      setError(true);
    } else {
      setLoading(true);
      setError(false);
    }
  }, [syncSource, syncStatus]);

  return {
    loading,
    error,
    progress: syncProgress ?? 0,
    message: syncMessage,
    exists: !!syncStatus,
  };
};
