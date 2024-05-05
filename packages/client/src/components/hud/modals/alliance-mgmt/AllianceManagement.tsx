import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { useEffect, useMemo } from "react";
import { Navigator } from "@/components/core/Navigator";
import { useMud } from "@/hooks";
import { useSyncStatus } from "@/hooks/useSyncStatus";
import { components } from "@/network/components";
import { hydrateAllianceData } from "@/network/sync/indexer";
import { CreateScreen } from "./CreateScreen";
import { ErrorScreen } from "./ErrorScreen";
import { IndexScreen } from "./IndexScreen";
import { InvitesScreen } from "./InvitesScreen";
import { LoadingScreen } from "./LoadingScreen";
import { ManageScreen } from "./ManageScreen";

export const AllianceManagement = () => {
  const mud = useMud();
  const playerEntity = mud.playerAccount.entity;
  const allianceEntity = (components.PlayerAlliance.use(playerEntity)?.alliance ?? singletonEntity) as Entity;
  const { loading, error } = useSyncStatus(allianceEntity);

  useEffect(() => {
    hydrateAllianceData(allianceEntity, mud);
  }, [allianceEntity, mud]);

  const initialScreen = useMemo(() => {
    if (error) return "error";
    if (loading) return "loading";

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
