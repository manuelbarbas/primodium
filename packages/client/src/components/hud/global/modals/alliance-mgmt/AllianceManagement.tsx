import { Navigator } from "@/components/core/Navigator";
import { defaultEntity, Entity } from "@primodiumxyz/reactive-tables";
import { useEffect, useMemo } from "react";
import { CreateScreen } from "@/components/hud/global/modals/alliance-mgmt/CreateScreen";
import { ErrorScreen } from "@/components/hud/global/modals/alliance-mgmt/ErrorScreen";
import { IndexScreen } from "@/components/hud/global/modals/alliance-mgmt/IndexScreen";
import { InvitesScreen } from "@/components/hud/global/modals/alliance-mgmt/InvitesScreen";
import { LoadingScreen } from "@/components/hud/global/modals/alliance-mgmt/LoadingScreen";
import { ManageScreen } from "@/components/hud/global/modals/alliance-mgmt/manage/ManageScreen";
import { useAccountClient, useCore, useSyncStatus } from "@primodiumxyz/core/react";
import { Keys } from "@primodiumxyz/core";

export const AllianceManagement = () => {
  const { tables, sync } = useCore();
  const playerEntity = useAccountClient().playerAccount.entity;
  // global alliance data
  const { loading: globalLoading, error: globalError } = useSyncStatus(Keys.SECONDARY);
  // player alliance data
  const allianceEntity = (tables.PlayerAlliance.use(playerEntity)?.alliance ?? defaultEntity) as Entity;
  const { loading, error } = useSyncStatus(allianceEntity);

  useEffect(() => {
    sync.syncAllianceData(allianceEntity);
  }, [allianceEntity]);

  const initialScreen = useMemo(() => {
    if (error || globalError) return "error";
    if (loading || globalLoading) return "loading";

    if (allianceEntity === defaultEntity) return "search";
    return "manage";
  }, [loading, error, allianceEntity, globalLoading, globalError]);

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
