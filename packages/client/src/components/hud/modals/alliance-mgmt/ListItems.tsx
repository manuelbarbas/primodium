import { Entity } from "@latticexyz/recs";
import { FaAngleDoubleDown, FaAngleDoubleUp, FaCheck, FaDoorOpen, FaTimes } from "react-icons/fa";
import { GiRank1, GiRank2, GiRank3 } from "react-icons/gi";
import { Button } from "@/components/core/Button";
import { Tooltip } from "@/components/core/Tooltip";
import { TransactionQueueMask } from "@/components/shared/TransactionQueueMask";
import { AccountDisplay } from "@/components/shared/AccountDisplay";
import {
  acceptJoinRequest,
  grantRole,
  kickPlayer,
  rejectJoinRequest,
  revokeInvite,
} from "@/network/setup/contractCalls/alliance";
import { components } from "@/network/components";
import { cn } from "@/util/client";
import { useMud, usePrimodium } from "@/hooks";
import { AsteroidLevelToSprite } from "@/game/lib/mappings";
import { EAllianceRole } from "contracts/config/enums";
import { hashEntities } from "@/util/encode";
import { TransactionQueueType } from "@/util/constants";

/* -------------------------------------------------------------------------- */
/*                                   MEMBER                                   */
/* -------------------------------------------------------------------------- */

export const MemberItem = ({
  index,
  playerRole,
  player,
  editMode,
  style,
}: {
  index: number;
  playerRole: EAllianceRole;
  player: { entity: Entity; name: string; role: EAllianceRole };
  editMode: boolean;
  style: React.CSSProperties;
}) => {
  const mud = useMud();
  const playerEntity = mud.playerAccount.entity;
  const { getSpriteBase64 } = usePrimodium().api().sprite;

  // Label and color depending on the role
  const { roleLabel, roleColor } =
    player.role === EAllianceRole.Owner
      ? { roleLabel: "LEADER", roleColor: "accent" }
      : player.role === EAllianceRole.Member
      ? { roleLabel: "MEMBER", roleColor: "white" }
      : { roleLabel: "OFFICER", roleColor: "warning" };

  // Get the mainbase level for the emblem
  const mainBase = components.Home.get(player.entity)?.value as Entity | undefined;
  const level = components.Level.get(mainBase)?.value ?? 1n;

  // Display an additional icon for the officer rank in edit mode
  const { rankIcon, rankTooltip } = editMode
    ? player.role === EAllianceRole.CanInvite
      ? { rankIcon: <GiRank1 />, rankTooltip: "Invite members" }
      : player.role === EAllianceRole.CanKick
      ? { rankIcon: <GiRank2 />, rankTooltip: "Invite and kick members" }
      : player.role === EAllianceRole.CanGrantRole
      ? { rankIcon: <GiRank3 />, rankTooltip: "Invite, kick and promote/demote members" }
      : { rankIcon: <></>, rankTooltip: "" }
    : { rankIcon: <></>, rankTooltip: "" };

  return (
    <div
      style={style}
      className={cn(
        "grid grid-cols-[30px_1fr_min-content] items-center gap-4 pr-4",
        editMode && "grid-cols-[30px_minmax(250px,auto)_min-content_1fr]"
      )}
    >
      <span>{index + 1}.</span>
      {/* small top margin to balance the fact that it's a little above the rest */}
      <div className={`flex gap-1 mt-[3px] text-${roleColor}`}>
        <img
          src={AsteroidLevelToSprite[level] !== undefined ? getSpriteBase64(AsteroidLevelToSprite[level]) : undefined}
          className="pixel-images"
        />
        <AccountDisplay player={player.entity} showAlliance={false} overridePlayerColor={roleColor} />
      </div>
      <div className={`flex items-center gap-1 text-${roleColor}`}>
        {roleLabel}
        <Tooltip tooltipContent={rankTooltip} direction="bottom">
          {rankIcon}
        </Tooltip>
      </div>
      {editMode ? (
        <div className="flex items-center justify-self-end">
          {playerRole <= EAllianceRole.CanGrantRole ? (
            <>
              <TransactionQueueMask queueItemId={hashEntities(TransactionQueueType.Promote, player.entity)}>
                <Button
                  variant="ghost"
                  className="btn-xs !rounded-box text-success"
                  onClick={() => grantRole(mud, player.entity, Math.max(player.role - 1, EAllianceRole.CanGrantRole))}
                  disabled={
                    player.entity === playerEntity ||
                    // the owner should not be able to promote over right below owner
                    (playerRole === EAllianceRole.Owner && player.role === EAllianceRole.CanGrantRole) ||
                    // the officer should not be able to promote over right below grant role
                    (playerRole === EAllianceRole.CanGrantRole && player.role === EAllianceRole.CanKick)
                  }
                >
                  <FaAngleDoubleUp />
                </Button>
              </TransactionQueueMask>
              <TransactionQueueMask queueItemId={hashEntities(TransactionQueueType.Demote, player.entity)}>
                <Button
                  variant="ghost"
                  className="btn-xs !rounded-box text-error"
                  onClick={() => grantRole(mud, player.entity, Math.min(player.role + 1, EAllianceRole.Member))}
                  disabled={player.entity === playerEntity || player.role === EAllianceRole.Member}
                >
                  <FaAngleDoubleDown />
                </Button>
              </TransactionQueueMask>
            </>
          ) : null}
          {playerRole <= EAllianceRole.CanKick ? (
            <TransactionQueueMask queueItemId={hashEntities(TransactionQueueType.KickPlayer, player.entity)}>
              <Button
                variant="ghost"
                className="btn-xs flex gap-1 !rounded-box opacity-75"
                onClick={() => kickPlayer(mud, player.entity)}
                disabled={player.entity === playerEntity || player.role <= playerRole}
              >
                <FaDoorOpen />
              </Button>
            </TransactionQueueMask>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                              REQUESTED PLAYER                              */
/* -------------------------------------------------------------------------- */

export const JoinRequestPlayerItem = ({
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
  const { getSpriteBase64 } = usePrimodium().api().sprite;

  // Get the mainbase level for the emblem
  const mainBase = components.Home.get(playerEntity)?.value as Entity | undefined;
  const level = components.Level.get(mainBase)?.value ?? 1n;

  return (
    <div style={style} className="grid grid-cols-[30px_1fr_min-content] items-center gap-4 pr-4">
      <span>{index + 1}.</span>
      {/* small top margin to balance the fact that it's a little above the rest */}
      <div className="flex gap-1 mt-[3px]">
        <img
          src={AsteroidLevelToSprite[level] !== undefined ? getSpriteBase64(AsteroidLevelToSprite[level]) : undefined}
          className="pixel-images"
        />
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

/* -------------------------------------------------------------------------- */
/*                               INVITED PLAYER                               */
/* -------------------------------------------------------------------------- */

export const InvitedPlayerItem = ({
  index,
  playerEntity,
  style,
}: {
  index: number;
  playerEntity: Entity;
  style: React.CSSProperties;
}) => {
  const mud = useMud();
  const { getSpriteBase64 } = usePrimodium().api().sprite;

  // Get the mainbase level for the emblem
  const mainBase = components.Home.get(playerEntity)?.value as Entity | undefined;
  const level = components.Level.get(mainBase)?.value ?? 1n;

  return (
    <div style={style} className="grid grid-cols-[30px_1fr_min-content] items-center gap-4 pr-4">
      <span>{index + 1}.</span>
      {/* small top margin to balance the fact that it's a little above the rest */}
      <div className="flex gap-1 mt-[3px]">
        <img
          src={AsteroidLevelToSprite[level] !== undefined ? getSpriteBase64(AsteroidLevelToSprite[level]) : undefined}
          className="pixel-images"
        />
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
