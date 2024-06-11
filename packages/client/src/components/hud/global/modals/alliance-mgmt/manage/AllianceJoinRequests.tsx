import { Button } from "@/components/core/Button";
import { SecondaryCard } from "@/components/core/Card";
import { AccountDisplay } from "@/components/shared/AccountDisplay";
import { TransactionQueueMask } from "@/components/shared/TransactionQueueMask";
import { useGame } from "@/react/hooks/useGame";
import { useMud } from "@/react/hooks/useMud";
import { components } from "@/network/components";
import { acceptJoinRequest, rejectJoinRequest, revokeInvite } from "@/network/setup/contractCalls/alliance";
import { getAsteroidEmblem } from "@/util/asteroid";
import { TransactionQueueType } from "@/util/constants";
import { hashEntities } from "@/util/encode";
import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { FaCheck, FaTimes } from "react-icons/fa";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as List } from "react-window";

export const AllianceJoinRequests = ({
  allianceEntity,
  players,
}: {
  allianceEntity: Entity;
  players: {
    alliance?: string | undefined;
    role?: number | undefined;
    entity: Entity;
    name: string;
  }[];
}) => {
  const maxAllianceMembers = components.P_AllianceConfig.use()?.maxAllianceMembers ?? 1n;
  /* ------------------------------ JOIN REQUESTS ----------------------------- */
  const joinRequestPlayers = (
    components.AllianceRequest.useAllWith({ alliance: allianceEntity ?? singletonEntity }) ?? []
  )
    .map((request) => {
      const player = components.AllianceRequest.get(request)?.player;
      // filter out requests from players who are already in an alliance
      if (components.PlayerAlliance.get(player)?.alliance !== undefined) return undefined;
      // return only the player entity
      return player;
    })
    .filter((player) => !!player) as Entity[];

  /* --------------------------------- INVITES -------------------------------- */
  const invitedPlayers = (components.PlayerInvite.useAllWith({ alliance: allianceEntity ?? singletonEntity }) ?? [])
    .map((invite) => {
      const player = components.PlayerInvite.get(invite)?.target;
      // filter out invites to players who joined the alliance in the meantime (e.g. after requesting)
      // but keep them if they're in another alliance, you never know if they'll leave
      if (components.PlayerAlliance.get(player)?.alliance === allianceEntity) return undefined;
      // return only the player entity
      return player;
    })
    .filter((player) => !!player) as Entity[];

  return (
    <div className="grid grid-rows-2 gap-2 h-full">
      <div className="flex flex-col gap-2">
        <span className="opacity-75">REQUESTS TO JOIN ({joinRequestPlayers.length})</span>
        {joinRequestPlayers.length > 0 ? (
          <SecondaryCard className="h-full w-full">
            <AutoSizer>
              {({ height, width }: { height: number; width: number }) => (
                <List
                  height={height}
                  width={width}
                  itemCount={joinRequestPlayers.length}
                  itemSize={30}
                  className="scrollbar"
                >
                  {({ index, style }) => (
                    <AllianceJoinRequestsItem
                      key={index}
                      index={index}
                      playerEntity={joinRequestPlayers[index]}
                      full={BigInt(players.length) >= maxAllianceMembers}
                      style={style}
                    />
                  )}
                </List>
              )}
            </AutoSizer>
          </SecondaryCard>
        ) : (
          <SecondaryCard className="flex items-center justify-center h-full">
            <span className="opacity-50">NO REQUESTS</span>
          </SecondaryCard>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <span className="opacity-75">INVITATIONS SENT ({invitedPlayers.length})</span>
        {invitedPlayers.length > 0 ? (
          <SecondaryCard className="h-full w-full">
            <AutoSizer>
              {({ height, width }: { height: number; width: number }) => (
                <List
                  height={height}
                  width={width}
                  itemCount={invitedPlayers.length}
                  itemSize={30}
                  className="scrollbar"
                >
                  {({ index, style }) => (
                    <div style={style} className="pr-2">
                      <InvitedPlayerItem key={index} index={index} playerEntity={invitedPlayers[index]} />
                    </div>
                  )}
                </List>
              )}
            </AutoSizer>
          </SecondaryCard>
        ) : (
          <SecondaryCard className="flex items-center justify-center h-full">
            <span className="opacity-50">NO INVITATIONS</span>
          </SecondaryCard>
        )}
      </div>
    </div>
  );
};

const AllianceJoinRequestsItem = ({
  index,
  playerEntity,
  full,
  style,
}: {
  index: number;
  playerEntity: Entity;
  full: boolean;
  style: React.CSSProperties;
}) => {
  const mud = useMud();
  const game = useGame();

  // Get the mainbase level for the emblem
  const asteroidEntity = components.Home.use(playerEntity)?.value as Entity | undefined;
  if (!asteroidEntity) return null;

  return (
    <div style={style} className="grid grid-cols-[30px_1fr_min-content] items-center gap-2">
      <span>{index + 1}.</span>
      {/* small top margin to balance the fact that it's a little above the rest */}
      <div className="flex items-center gap-1 mt-[3px]">
        <img src={getAsteroidEmblem(game, asteroidEntity)} className="pixel-images h-8" />
        <AccountDisplay player={playerEntity} showAlliance={false} noColor />
      </div>
      <div className="flex items-center justify-self-end">
        <TransactionQueueMask queueItemId={hashEntities(TransactionQueueType.AcceptRequest, playerEntity)}>
          <Button
            variant="ghost"
            tooltip={full ? "Alliance is full" : undefined}
            tooltipDirection="top"
            className="btn-xs !rounded-box text-success"
            onClick={() => acceptJoinRequest(mud, playerEntity)}
            disabled={full}
          >
            <div className="flex gap-1">
              <FaCheck /> ACCEPT
            </div>
          </Button>
        </TransactionQueueMask>
        <TransactionQueueMask queueItemId={hashEntities(TransactionQueueType.RejectRequest, playerEntity)}>
          <Button
            variant="ghost"
            className="btn-xs !rounded-box text-error"
            onClick={() => rejectJoinRequest(mud, playerEntity)}
          >
            <div className="flex gap-1">
              <FaTimes /> DECLINE
            </div>
          </Button>
        </TransactionQueueMask>
      </div>
    </div>
  );
};

const InvitedPlayerItem = ({ index, playerEntity }: { index: number; playerEntity: Entity }) => {
  const mud = useMud();
  const game = useGame();

  // Get the mainbase level for the emblem
  const asteroidEntity = components.Home.get(playerEntity)?.value as Entity | undefined;

  return (
    <div className="grid grid-cols-[30px_1fr_min-content] items-center">
      <span>{index + 1}.</span>
      {/* small top margin to balance the fact that it's a little above the rest */}
      <div className="flex items-center gap-1 mt-[3px]">
        <img src={getAsteroidEmblem(game, asteroidEntity)} className="pixel-images h-8" />
        <AccountDisplay player={playerEntity} showAlliance={false} noColor />
      </div>
      <div className="flex items-center justify-self-end">
        <TransactionQueueMask queueItemId={hashEntities(TransactionQueueType.RevokeInvite, playerEntity)}>
          <Button
            variant="ghost"
            className="btn-xs !rounded-box opacity-75"
            onClick={() => revokeInvite(mud, playerEntity)}
          >
            REVOKE
          </Button>
        </TransactionQueueMask>
      </div>
    </div>
  );
};
