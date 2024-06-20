import { LoadingOverlay } from "@/components/shared/LoadingOverlay";
import { hashEntities, Keys } from "@primodiumxyz/core";
import { useCore } from "@primodiumxyz/core/react";
import { defaultEntity } from "@primodiumxyz/reactive-tables";

export const AsteroidLoading = () => {
  const { tables } = useCore();
  const systemsReady = tables.SystemsReady.use()?.value ?? false;
  const activeRock = tables.ActiveRock.use()?.value ?? defaultEntity;
  const syncId = hashEntities(Keys.ACTIVE, activeRock);

  return (
    <LoadingOverlay
      syncId={syncId}
      ready={systemsReady}
      loadingMessage="Loading Asteroid"
      errorMessage="Error syncing asteroid data. Please refresh the page."
    />
  );
};
