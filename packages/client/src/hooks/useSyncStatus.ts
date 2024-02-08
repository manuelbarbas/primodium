import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { useEffect, useState } from "react";
import { SyncSourceType, SyncStep } from "src/util/constants";
import { useMud } from "./useMud";

export const useSyncStatus = (syncId?: Entity) => {
  const { components } = useMud();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const syncSource = components.SyncSource.use()?.value;
  const syncEntity = syncSource === SyncSourceType.RPC ? singletonEntity : syncId;
  const syncStatus = components.SyncStatus.use(syncEntity)?.step;
  const syncProgress = components.SyncStatus.use(syncEntity)?.progress;
  const syncMessage = components.SyncStatus.use(syncEntity)?.message;
  const notSynced = components.Systems.useAll().length === 0;

  useEffect(() => {
    if (syncStatus === undefined) return;
    if (syncStatus === SyncStep.Complete && !notSynced) {
      setLoading(false);
      setError(false);
    } else if (syncStatus === SyncStep.Error) {
      setLoading(false);
      setError(true);
    } else {
      setLoading(true);
      setError(false);
    }
  }, [notSynced, syncSource, syncStatus]);

  return {
    loading,
    error,
    progress: syncProgress ?? 0,
    message: syncMessage,
    exists: syncStatus !== undefined,
  };
};
