import { EAllianceRole } from "contracts/config/enums";
import { FaArrowDown, FaArrowLeft, FaArrowUp, FaInfoCircle, FaUserMinus } from "react-icons/fa";
import { GiRank1, GiRank2, GiRank3 } from "react-icons/gi";
import { Button } from "src/components/core/Button";
import { SecondaryCard } from "src/components/core/Card";
import { Join } from "src/components/core/Join";
import { Navigator } from "src/components/core/Navigator";
import { AccountDisplay } from "src/components/shared/AccountDisplay";
import { TransactionQueueMask } from "src/components/shared/TransactionQueueMask";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { grantRole, kickPlayer, leaveAlliance } from "src/network/setup/contractCalls/alliance";
import { EntityType, TransactionQueueType } from "src/util/constants";
import { hashEntities } from "src/util/encode";

export const ManageScreen: React.FC = () => {
  const mud = useMud();
  const playerEntity = mud.playerAccount.entity;
  const data = components.Leaderboard.use(EntityType.AllianceConquestLeaderboard);
  const allianceEntity = data?.players[(data?.playerRank ?? 1) - 1];
  const playerRole = components.PlayerAlliance.get(playerEntity)?.role ?? EAllianceRole.Member;
  const playerEntities = components.PlayerAlliance.useAllWith({
    alliance: allianceEntity,
  });
  const maxAllianceMembers = components.P_AllianceConfig.get()?.maxAllianceMembers ?? 1n;

  if (!data) return <></>;

  // sort by role
  const players = playerEntities
    .map((entity) => {
      return { entity, ...components.PlayerAlliance.get(entity) };
    })
    .sort((a, b) => {
      return (a.role ?? EAllianceRole.Member) - (b.role ?? EAllianceRole.Member);
    });

  return (
    <Navigator.Screen
      title="manage"
      className="flex flex-col items-center w-full text-xs pointer-events-auto h-full overflow-hidden"
    >
      <div className="w-full flex flex-col flex-grow">
        <div className="flex justify-between items-center">
          <p className="font-bold p-1 opacity-75">MEMBERS</p>
          <div className="dropdown dropdown-end ">
            <label tabIndex={0} className="btn btn-circle btn-ghost btn-xs">
              <FaInfoCircle />
            </label>
            <div
              tabIndex={0}
              className="card compact dropdown-content z-[1] shadow bg-base-100 w-56 p-1 m-1 border border-secondary"
            >
              <span className="flex">
                <GiRank3 size={18} className="text-yellow-500" /> Promote/Demote Members
              </span>
              <span className="flex">
                <GiRank2 size={18} className="text-yellow-500" /> Kick Members
              </span>

              <span className="flex">
                <GiRank1 size={18} className="text-yellow-500" /> Invite Members
              </span>
            </div>
          </div>
        </div>

        <Join
          direction="vertical"
          className="overflow-auto w-full h-full scrollbar bg-neutral border border-secondary/25"
        >
          {players.map((player) => {
            const role = player?.role ?? EAllianceRole.Member;
            const entity = player.entity;

            return (
              <SecondaryCard key={player.entity} className="border-b rounded-none flex-row justify-between">
                {role === EAllianceRole.Owner && (
                  <div className="flex items-center gap-1 font-bold text-warning uppercase">
                    <GiRank3 size={18} className="text-yellow-500" />
                    <AccountDisplay player={entity} />
                    <p className="bg-yellow-500 text-neutral px-2 rounded-sm text-xs">OWNER</p>
                  </div>
                )}
                {role === EAllianceRole.CanGrantRole && (
                  <div className="flex items-center gap-1 font-bold">
                    <GiRank3 size={18} className="text-yellow-500" />
                    <AccountDisplay player={entity} />
                  </div>
                )}
                {role === EAllianceRole.CanKick && (
                  <div className="flex items-center gap-1 font-bold">
                    <GiRank2 size={18} className="text-yellow-500" />
                    <AccountDisplay player={entity} />
                  </div>
                )}
                {role === EAllianceRole.CanInvite && (
                  <div className="flex items-center gap-1 font-bold">
                    <GiRank1 size={18} className="text-yellow-500" />
                    <AccountDisplay player={entity} />
                  </div>
                )}
                {role === EAllianceRole.Member && (
                  <div className="flex items-center gap-1 font-bold">
                    <AccountDisplay player={entity} />
                  </div>
                )}
                <div className="flex gap-1">
                  {/* only kick if not current player, has the ability to kick, and current player is higher than member */}
                  {entity !== playerEntity && playerRole <= EAllianceRole.CanKick && role > playerRole && (
                    <TransactionQueueMask queueItemId={hashEntities(TransactionQueueType.KickPlayer, entity)}>
                      <Button
                        tooltip="Kick"
                        tooltipDirection="left"
                        className="btn-xs !rounded-box border-error"
                        onClick={() => kickPlayer(mud, entity)}
                      >
                        <FaUserMinus className="rounded-none" size={10} />
                      </Button>
                    </TransactionQueueMask>
                  )}
                  {/* only promote if not current player, has the ability to promote, and current player is higher than member */}
                  {entity !== playerEntity && playerRole <= EAllianceRole.CanGrantRole && role > playerRole && (
                    <TransactionQueueMask queueItemId={hashEntities(TransactionQueueType.Demote, entity)}>
                      <Button
                        tooltip="Demote"
                        tooltipDirection="left"
                        className="btn-xs !rounded-box border-warning"
                        onClick={() => grantRole(mud, entity, Math.min(role + 1, EAllianceRole.Member))}
                      >
                        <FaArrowDown />
                      </Button>
                    </TransactionQueueMask>
                  )}
                  {/* only promote if not current player, has the ability to promote, and current player is higher than member */}
                  {entity !== playerEntity && playerRole <= EAllianceRole.CanGrantRole && role > playerRole && (
                    <TransactionQueueMask queueItemId={hashEntities(TransactionQueueType.Promote, entity)}>
                      <Button
                        tooltip="Promote"
                        tooltipDirection="left"
                        className="btn-xs !rounded-box border-success"
                        onClick={() => grantRole(mud, entity, Math.max(role - 1, EAllianceRole.CanGrantRole))}
                      >
                        <FaArrowUp />
                      </Button>
                    </TransactionQueueMask>
                  )}
                </div>
              </SecondaryCard>
            );
          })}
        </Join>
        <p className="p-1 opacity-50 text-right">
          {players.length}/{maxAllianceMembers?.toLocaleString()} member(s)
        </p>
      </div>

      <div className="flex gap-1">
        <Navigator.BackButton>
          <FaArrowLeft />
        </Navigator.BackButton>

        <Navigator.BackButton className="btn-error border-none" onClick={() => leaveAlliance(mud)}>
          LEAVE ALLIANCE
        </Navigator.BackButton>
      </div>
    </Navigator.Screen>
  );
};
