import { Tabs } from "@/components/core/Tabs";
import { getAllianceName } from "@/util/alliance";
import { EAllianceRole } from "contracts/config/enums";
// import { useState } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as List } from "react-window";
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
import { TransactionQueueType } from "src/util/constants";
import { hashEntities } from "src/util/encode";

export const ManageScreen: React.FC = () => {
  // const [activeTab, setActiveTab] = useState<"members" | "requests" | "settings">("members");
  // const [editMode, setEditMode] = useState(false);
  const mud = useMud();
  const playerEntity = mud.playerAccount.entity;

  const alliance = components.PlayerAlliance.get(playerEntity);
  const allianceEntity = alliance?.alliance;
  const allianceName = getAllianceName(allianceEntity, true);
  const playerRole = alliance?.role ?? EAllianceRole.Member;
  const playerEntities = components.PlayerAlliance.useAllWith({
    alliance: allianceEntity,
  });
  const maxAllianceMembers = components.P_AllianceConfig.get()?.maxAllianceMembers ?? 1n;

  if (!allianceEntity) return <></>;

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
      className="grid grid-rows-[min-content_1fr_min-content] w-full h-full text-xs pointer-events-auto py-6 px-24 gap-4"
    >
      <div className="justify-self-center text-base text-warning">ALLIANCE [{allianceName}]</div>
      <Tabs className="flex flex-col items-center gap-2 w-full h-full">
        <Join className="border border-secondary/25">
          <Tabs.Button index={0} className="btn-sm">
            MEMBERS
          </Tabs.Button>
          {playerRole <= EAllianceRole.CanInvite ? (
            <Tabs.Button index={1} className="btn-sm">
              REQUESTS
            </Tabs.Button>
          ) : null}
          <Tabs.Button index={2} className="btn-sm">
            SETTINGS
          </Tabs.Button>
        </Join>

        <Tabs.Pane index={0} className="w-full h-full p-0 border-none">
          {/* <Leaderboards alliance activeTab={activeTab} setActiveTab={setActiveTab} /> */}
          <AutoSizer>
            {({ height, width }: { height: number; width: number }) => (
              <List height={height} width={width} itemCount={players.length} itemSize={47} className="scrollbar">
                {({ index, style }) => {
                  return (
                    <div style={style} className="grid grid-cols-[40px_1fr_min-content] gap-4 pr-4">
                      <span>{index + 1}</span>
                      <AccountDisplay player={players[index].entity} />
                      {players[index].role === EAllianceRole.Owner ? (
                        <span className="text-warning">LEADER</span>
                      ) : players[index].role === EAllianceRole.Member ? (
                        <span>MEMBER</span>
                      ) : (
                        <span className="text-accent">OFFICER</span>
                      )}
                    </div>
                  );
                }}
              </List>
            )}
          </AutoSizer>
        </Tabs.Pane>
        <Tabs.Pane index={1} className="w-full h-full p-0 border-none">
          {/* <Leaderboards activeTab={activeTab} setActiveTab={setActiveTab} /> */}
        </Tabs.Pane>
        <Tabs.Pane index={2} className="w-full h-full p-0 border-none">
          {/* <Leaderboards activeTab={activeTab} setActiveTab={setActiveTab} /> */}
        </Tabs.Pane>
      </Tabs>

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
