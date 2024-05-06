import { Button } from "@/components/core/Button";
import { SecondaryCard } from "@/components/core/Card";
import { AccountDisplay } from "@/components/shared/AccountDisplay";
import { TransactionQueueMask } from "@/components/shared/TransactionQueueMask";
import { useMud, usePrimodium } from "@/hooks";
import { components } from "@/network/components";
import { grantRole, kickPlayer } from "@/network/setup/contractCalls/alliance";
import { getAsteroidEmblem } from "@/util/asteroid";
import { TransactionQueueType } from "@/util/constants";
import { hashEntities } from "@/util/encode";
import { Entity } from "@latticexyz/recs";
import { EAllianceRole } from "contracts/config/enums";
import { FC } from "react";
import { FaAngleDoubleDown, FaAngleDoubleUp, FaDoorOpen } from "react-icons/fa";
import { GiCowled, GiGraduateCap, GiRank1, GiRank2, GiRank3 } from "react-icons/gi";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as List } from "react-window";

/* -------------------------------------------------------------------------- */
/*                                   MEMBER                                   */
/* -------------------------------------------------------------------------- */
export const MemberItems = ({
  players,
  playerRole,
}: {
  players: {
    alliance?: string | undefined;
    role?: EAllianceRole | undefined;
    entity: Entity;
    name: string;
  }[];
  playerRole: EAllianceRole;
}) => {
  return (
    <div className="w-full h-full flex flex-col gap-2">
      {players.length === 0 && <SecondaryCard className="w-full h-full">No members</SecondaryCard>}
      {players.length > 0 && (
        <SecondaryCard className="h-full">
          <AutoSizer>
            {({ height, width }: { height: number; width: number }) => (
              <List height={height} width={width} itemCount={players.length} itemSize={35} className="scrollbar">
                {({ index }) => (
                  <MemberItem
                    key={index}
                    index={index}
                    playerRole={playerRole}
                    player={{
                      entity: players[index].entity,
                      name: players[index].name,
                      role: (players[index].role as EAllianceRole) ?? EAllianceRole.Member,
                    }}
                  />
                )}
              </List>
            )}
          </AutoSizer>
        </SecondaryCard>
      )}
    </div>
  );
};

export const MemberItem: FC<{
  index: number;
  playerRole: EAllianceRole;
  player: {
    alliance?: string | undefined;
    role?: EAllianceRole | undefined;
    entity: Entity;
    name: string;
  };
}> = ({ index, playerRole, player }) => {
  const mud = useMud();
  const playerEntity = mud.playerAccount.entity;
  const primodium = usePrimodium();

  const role = player.role ?? EAllianceRole.Member;
  const roleContents = {
    [EAllianceRole.Owner]: { label: "Overseer", color: "accent", Icon: GiCowled },
    [EAllianceRole.CanGrantRole]: { label: "Archon", color: "warning", Icon: GiRank3 },
    [EAllianceRole.CanKick]: { label: "Warden", color: "warning", Icon: GiRank2 },
    [EAllianceRole.CanInvite]: { label: "Emissary", color: "warning", Icon: GiRank1 },
    [EAllianceRole.Member]: { label: "Cadet", color: "white", Icon: GiGraduateCap },
  };
  const { color, label, Icon } = roleContents[role];

  const asteroidEntity = components.Home.use(player.entity)?.value as Entity | undefined;

  return (
    <div className={"grid grid-cols-[30px_minmax(250px,auto)_minmax(100px,auto)_1fr] items-center px-2"}>
      <span>{index + 1}.</span>
      {/* small top margin to balance the fact that it's a little above the rest */}
      <div className={`flex items-center gap-1 mt-[3px] text-${color}`}>
        <img src={getAsteroidEmblem(primodium, asteroidEntity)} className="pixel-images h-8" />
        <AccountDisplay player={player.entity} showAlliance={false} overridePlayerColor={color} />
      </div>
      <div className={`flex items-center gap-1 text-${color}`}>
        <Icon className="w-5 h-5" />
        {label}
      </div>
      <div className="flex items-center justify-self-end">
        {playerRole <= EAllianceRole.CanGrantRole && (
          <>
            <TransactionQueueMask queueItemId={hashEntities(TransactionQueueType.Promote, player.entity)}>
              <Button
                variant="ghost"
                className="btn-sm !rounded-box text-success"
                onClick={() => grantRole(mud, player.entity, Math.max(role - 1, EAllianceRole.CanGrantRole))}
                disabled={
                  player.entity === playerEntity ||
                  // the owner should not be able to promote over right below owner
                  (playerRole === EAllianceRole.Owner && player.role === EAllianceRole.CanGrantRole) ||
                  // the officer should not be able to promote over right below grant role
                  (playerRole === EAllianceRole.CanGrantRole && role <= EAllianceRole.CanKick)
                }
              >
                <FaAngleDoubleUp />
              </Button>
            </TransactionQueueMask>
            <TransactionQueueMask queueItemId={hashEntities(TransactionQueueType.Demote, player.entity)}>
              <Button
                variant="ghost"
                className="btn-sm !rounded-box text-warning"
                onClick={() => grantRole(mud, player.entity, Math.min(role + 1, EAllianceRole.Member))}
                disabled={
                  player.entity === playerEntity ||
                  player.role === EAllianceRole.Member ||
                  player.role === EAllianceRole.Owner
                }
              >
                <FaAngleDoubleDown />
              </Button>
            </TransactionQueueMask>
          </>
        )}
        {playerRole <= EAllianceRole.CanKick && (
          <TransactionQueueMask queueItemId={hashEntities(TransactionQueueType.KickPlayer, player.entity)}>
            <Button
              variant="ghost"
              className="btn-sm flex gap-1 !rounded-box text-error"
              onClick={() => kickPlayer(mud, player.entity)}
              disabled={player.entity === playerEntity || role <= playerRole}
            >
              <FaDoorOpen />
            </Button>
          </TransactionQueueMask>
        )}
      </div>
    </div>
  );
};
