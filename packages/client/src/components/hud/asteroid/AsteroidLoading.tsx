import { singletonEntity } from "@latticexyz/store-sync/recs";
import { components } from "@/network/components";
import { LoadingOverlay } from "@/components/shared/LoadingOverlay";
import { Keys } from "@/util/constants";
import { hashEntities } from "@/util/encode";

export const AsteroidLoading = () => {
  const activeRock = components.ActiveRock.use()?.value ?? singletonEntity;
  const syncId = hashEntities(Keys.ACTIVE, activeRock);

  return (
    <LoadingOverlay
      syncId={syncId}
      loadingMessage="Loading Asteroid"
      errorMessage="Error syncing asteroid data. Please refresh the page."
    />
  );
};
