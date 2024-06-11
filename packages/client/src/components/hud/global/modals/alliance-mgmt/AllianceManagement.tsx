import { Navigator } from "@/components/core/Navigator";
import { useMud } from "@/react/hooks";
import { useSyncStatus } from "@/react/hooks/useSyncStatus";
import { components } from "@/network/components";
import { hydrateAllianceData } from "@/network/sync/indexer";
import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { useEffect, useMemo } from "react";
import { CreateScreen } from "@/components/hud/global/modals/alliance-mgmt/CreateScreen";
import { ErrorScreen } from "@/components/hud/global/modals/alliance-mgmt/ErrorScreen";
import { IndexScreen } from "@/components/hud/global/modals/alliance-mgmt/IndexScreen";
import { InvitesScreen } from "@/components/hud/global/modals/alliance-mgmt/InvitesScreen";
import { LoadingScreen } from "@/components/hud/global/modals/alliance-mgmt/LoadingScreen";
import { ManageScreen } from "@/components/hud/global/modals/alliance-mgmt/manage/ManageScreen";
import { Keys } from "@/util/constants";

export const AllianceManagement = () => {
  const mud = useMud();
  const playerEntity = mud.playerAccount.entity;
  // global alliance data
  const { loading: globalLoading, error: globalError } = useSyncStatus(Keys.SECONDARY);
  // player alliance data
  const allianceEntity = (components.PlayerAlliance.use(playerEntity)?.alliance ?? singletonEntity) as Entity;
  const { loading, error } = useSyncStatus(allianceEntity);

  useEffect(() => {
    hydrateAllianceData(allianceEntity, mud);
  }, [allianceEntity, mud]);

  const initialScreen = useMemo(() => {
    if (error || globalError) return "error";
    if (loading || globalLoading) return "loading";

    if (allianceEntity === singletonEntity) return "search";
    return "manage";
  }, [loading, error, allianceEntity]);

  return (
    <Navigator initialScreen={initialScreen} className="border-none p-0! h-full">
      <LoadingScreen />
      <ErrorScreen />
      <IndexScreen />
      <CreateScreen />
      <InvitesScreen />
      <ManageScreen />
    </Navigator>
  );
};
