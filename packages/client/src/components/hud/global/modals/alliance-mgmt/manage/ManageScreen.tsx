import { Join } from "@/components/core/Join";
import { Navigator } from "@/components/core/Navigator";
import { Tabs } from "@/components/core/Tabs";
import { AllianceJoinRequests } from "@/components/hud/global/modals/alliance-mgmt/manage/AllianceJoinRequests";
import { AllianceSettings } from "@/components/hud/global/modals/alliance-mgmt/manage/AllianceSettings";
import { Invite } from "@/components/hud/global/modals/alliance-mgmt/manage/Invite";
import { Entity } from "@primodiumxyz/reactive-tables";
import { EAllianceRole } from "contracts/config/enums";
import { FaAngleDoubleDown, FaAngleDoubleUp, FaDoorOpen, FaInfoCircle } from "react-icons/fa";
import { GiRank1, GiRank2, GiRank3 } from "react-icons/gi";
import { MemberItems } from "./MemberItems";
import { useAccountClient, useAllianceName, useCore } from "@primodiumxyz/core/react";
import { entityToPlayerName } from "@primodiumxyz/core";

export const ManageScreen: React.FC = () => {
  /* ---------------------------------- STATE --------------------------------- */
  const { tables } = useCore();
  const playerEntity = useAccountClient().playerAccount.entity;

  /* ----------------------------- ALLIANCE/PLAYER ---------------------------- */
  const alliance = tables.PlayerAlliance.use(playerEntity);
  const allianceEntity = alliance?.alliance as Entity;
  const allianceName = useAllianceName(allianceEntity, true);
  const maxAllianceMembers = tables.P_AllianceConfig.get()?.maxAllianceMembers ?? 1n;
  const playerRole = alliance?.role ?? EAllianceRole.Member;
  const players = tables.PlayerAlliance.useAllWith({
    alliance: allianceEntity,
  })
    // sort by role
    .map((entity) => {
      return { entity, name: entityToPlayerName(entity), ...tables.PlayerAlliance.get(entity) };
    })
    .sort((a, b) => {
      return (a.role ?? EAllianceRole.Member) - (b.role ?? EAllianceRole.Member);
    });

  if (!allianceEntity) return <></>;
  return (
    <Navigator.Screen
      title="manage"
      className="grid grid-rows-[min-content_1fr_min-content] w-full h-full text-xs pointer-events-auto p-4 gap-4"
    >
      <div className="relative flex justify-center">
        <div className="text-base text-warning">ALLIANCE [{allianceName}]</div>
        <div className="absolute top-[50%] right-0 transform translate-y-[-50%] opacity-75">
          {players.length}/{maxAllianceMembers?.toString() ?? "?"} member(s)
        </div>
      </div>
      <Tabs className="flex flex-col gap-2 w-full h-full">
        <div className="relative flex justify-center w-full">
          <Join className="border border-secondary/25">
            <Tabs.Button index={0} className="btn-sm">
              MEMBERS
            </Tabs.Button>
            {playerRole <= EAllianceRole.CanInvite && (
              <Tabs.Button index={1} className="btn-sm">
                REQUESTS
              </Tabs.Button>
            )}
            <Tabs.Button index={2} className="btn-sm">
              SETTINGS
            </Tabs.Button>
          </Join>
          <IconHints playerRole={playerRole} />
        </div>

        <Tabs.Pane index={0} className="w-full h-full p-0 flex flex-col gap-2" fragment>
          <MemberItems players={players} playerRole={playerRole} />
          <Invite />
        </Tabs.Pane>
        <Tabs.Pane index={1} className="w-full h-full p-0 flex flex-col gap-2" fragment>
          <AllianceJoinRequests allianceEntity={allianceEntity} players={players} />
          <Invite />
        </Tabs.Pane>
        <Tabs.Pane index={2} className="w-full h-full p-0" fragment>
          <AllianceSettings allianceEntity={allianceEntity} playerEntity={playerEntity} />
        </Tabs.Pane>
      </Tabs>

      <div className="flex gap-2 w-full items-center">
        <Navigator.NavButton size="sm" to="search" className="w-fit ">
          Back
        </Navigator.NavButton>
      </div>
    </Navigator.Screen>
  );
};

const IconHints = ({ playerRole }: { playerRole: EAllianceRole }) => {
  return (
    <div className="absolute top-[50%] right-0 transform translate-y-[-50%] flex items-center">
      <div className="dropdown dropdown-top">
        <label tabIndex={0} className="btn btn-circle btn-ghost btn-xs">
          <FaInfoCircle size={16} />
        </label>
        <div
          tabIndex={0}
          className="card compact dropdown-content z-[1] shadow bg-base-100 w-60 p-2 m-1 border border-secondary gap-1 right-[50%] transform translate-x-[50%]"
        >
          <span>ROLES</span>
          <span className="flex gap-2">
            <GiRank3 size={16} className="text-warning" /> Promote/Demote Members
          </span>
          <span className="flex gap-2">
            <GiRank2 size={16} className="text-warning" /> Kick Members
          </span>
          <span className="flex gap-2">
            <GiRank1 size={16} className="text-warning" /> Invite Members
          </span>
          {playerRole <= EAllianceRole.CanKick && (
            <>
              <span className="border-t border-secondary opacity-50 my-1" />
              <span>ACTIONS</span>
              {playerRole <= EAllianceRole.CanGrantRole && (
                <>
                  <span className="flex gap-2">
                    <FaAngleDoubleUp size={16} className="text-success" /> Promote
                  </span>
                  <span className="flex gap-2">
                    <FaAngleDoubleDown size={16} className="text-warning" /> Demote
                  </span>
                </>
              )}
              <span className="flex gap-2">
                <FaDoorOpen size={16} className="text-error" /> Kick
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
