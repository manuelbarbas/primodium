import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { useEffect, useMemo } from "react";
import { Navigator } from "src/components/core/Navigator";
import { useMud } from "src/hooks";
import { useSyncStatus } from "src/hooks/useSyncStatus";
import { components } from "src/network/components";
import { hydrateAllianceData } from "src/network/sync/indexer";
import { CreateScreen } from "./CreateScreen";
import { ErrorScreen } from "./ErrorScreen";
import { IndexScreen } from "./IndexScreen";
import { InvitesScreen } from "./InvitesScreen";
import { LoadingScreen } from "./LoadingScreen";
import { ManageScreen } from "./ManageScreen";
import { SendInviteScreen } from "./SendInviteScreen";

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
      <SendInviteScreen />
      <ManageScreen />
    </Navigator>
  );
};
