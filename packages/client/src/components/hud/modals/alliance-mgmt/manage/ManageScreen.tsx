import { Button } from "@/components/core/Button";
import { SecondaryCard } from "@/components/core/Card";
import { Join } from "@/components/core/Join";
import { Navigator } from "@/components/core/Navigator";
import { Tabs } from "@/components/core/Tabs";
import { Tooltip } from "@/components/core/Tooltip";
import { AllianceJoinRequests } from "@/components/hud/modals/alliance-mgmt/manage/AllianceJoinRequests";
import { Invite } from "@/components/hud/modals/alliance-mgmt/manage/Invite";
import { TransactionQueueMask } from "@/components/shared/TransactionQueueMask";
import { useMud } from "@/hooks";
import { components } from "@/network/components";
import { leaveAlliance } from "@/network/setup/contractCalls/alliance";
import { MUD } from "@/network/types";
import { getAllianceName } from "@/util/alliance";
import { entityToAddress } from "@/util/common";
import { TransactionQueueType } from "@/util/constants";
import { hashEntities } from "@/util/encode";
import { entityToPlayerName } from "@/util/name";
import { Entity } from "@latticexyz/recs";
import { EAllianceRole } from "contracts/config/enums";
import {
  FaAngleDoubleDown,
  FaAngleDoubleUp,
  FaCopy,
  FaDoorOpen,
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa";
import { GiRank1, GiRank2, GiRank3 } from "react-icons/gi";
import { toast } from "react-toastify";
import { MemberItems } from "./MemberItems";

export const ManageScreen: React.FC = () => {
  /* ---------------------------------- STATE --------------------------------- */
  const mud = useMud();
  const playerEntity = mud.playerAccount.entity;

  /* ----------------------------- ALLIANCE/PLAYER ---------------------------- */
  const alliance = components.PlayerAlliance.get(playerEntity);
  const allianceEntity = alliance?.alliance as Entity;
  const allianceName = getAllianceName(allianceEntity, true);
  const inviteOnly = components.Alliance.get(allianceEntity)?.inviteMode;
  const maxAllianceMembers = components.P_AllianceConfig.get()?.maxAllianceMembers ?? 1n;
  const playerRole = alliance?.role ?? EAllianceRole.Member;
  const players = components.PlayerAlliance.useAllWith({
    alliance: allianceEntity,
  })
    // sort by role
    .map((entity) => {
      return { entity, name: entityToPlayerName(entity), ...components.PlayerAlliance.get(entity) };
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
          <SecondaryCard className="flex flex-col items-center gap-4">
            <div className="flex justify-center items-center gap-8">
              FRIEND CODE:
              <Tooltip tooltipContent="Click to copy" direction="top">
                <Button
                  variant="ghost"
                  className="btn-xs flex gap-2"
                  onClick={() => navigator.clipboard.writeText(entityToAddress(playerEntity))}
                >
                  {entityToAddress(playerEntity, true)}
                  <FaCopy />
                </Button>
              </Tooltip>
            </div>
            <div className="relative flex justify-center w-full">
              <TransactionQueueMask queueItemId={hashEntities(TransactionQueueType.LeaveAlliance, playerEntity)}>
                <Button
                  tooltip={inviteOnly ? "You will need to request to join again" : undefined}
                  tooltipDirection="top"
                  variant="error"
                  onClick={() => (playerRole === EAllianceRole.Owner ? confirmLeaveAlliance(mud) : leaveAlliance(mud))}
                  className="btn-sm"
                >
                  LEAVE
                </Button>
              </TransactionQueueMask>
            </div>
          </SecondaryCard>
        </Tabs.Pane>
      </Tabs>

      <div className="flex w-full gap-2 w-full items-center">
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

const confirmLeaveAlliance = async (mud: MUD) => {
  toast(
    ({ closeToast }) => (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col text-center justify-center items-center gap-2 w-full">
          <FaExclamationTriangle size={24} className="text-warning" />
          Are you sure you want to leave the alliance? Leadership will be transferred to the next highest ranking
          member.
        </div>

        <div className="flex justify-center w-full gap-2">
          <button
            className="btn btn-secondary btn-xs"
            onClick={() => {
              leaveAlliance(mud);
              closeToast && closeToast();
            }}
          >
            Confirm
          </button>
          <button
            onClick={() => {
              closeToast && closeToast();
            }}
            className="btn btn-primary btn-xs"
          >
            Cancel
          </button>
        </div>
      </div>
    ),
    {
      // className: "border-error",
      position: "top-center",
      autoClose: false,
      closeOnClick: false,
      draggable: false,
      closeButton: false,
      hideProgressBar: true,
    }
  );
};
