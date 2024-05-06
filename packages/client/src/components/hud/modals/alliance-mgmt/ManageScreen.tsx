import { useState } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as List } from "react-window";
import { toast } from "react-toastify";
import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { Hex, padHex } from "viem";
import {
  FaAngleDoubleDown,
  FaAngleDoubleUp,
  FaArrowLeft,
  FaCopy,
  FaDoorOpen,
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa";
import { Tabs } from "@/components/core/Tabs";
import { Button } from "@/components/core/Button";
import { Join } from "@/components/core/Join";
import { Navigator } from "@/components/core/Navigator";
import { Tooltip } from "@/components/core/Tooltip";
import { TextInput } from "@/components/core/TextInput";
import { TransactionQueueMask } from "@/components/shared/TransactionQueueMask";
import { components } from "@/network/components";
import { MUD } from "@/network/types";
import { invite, leaveAlliance } from "@/network/setup/contractCalls/alliance";
import { useMud } from "@/hooks";
import { EAllianceRole } from "contracts/config/enums";
import { getAllianceName } from "@/util/alliance";
import { TransactionQueueType } from "@/util/constants";
import { entityToAddress } from "@/util/common";
import { hashEntities } from "@/util/encode";
import { entityToPlayerName } from "@/util/name";
import { InvitedPlayerItem, JoinRequestPlayerItem, MemberItem } from "./ListItems";
import { GiRank1, GiRank2, GiRank3 } from "react-icons/gi";

export const ManageScreen: React.FC = () => {
  /* ---------------------------------- STATE --------------------------------- */
  const mud = useMud();
  const playerEntity = mud.playerAccount.entity;

  const [friendCode, setFriendCode] = useState("");
  const [activeTabIndex, setActiveTabIndex] = useState<number | undefined>(0);
  const [editMode, setEditMode] = useState(false);

  /* ----------------------------- ALLIANCE/PLAYER ---------------------------- */
  const alliance = components.PlayerAlliance.get(playerEntity);
  const allianceEntity = alliance?.alliance;
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

  if (!allianceEntity) return <></>;
  return (
    <Navigator.Screen
      title="manage"
      className="grid grid-rows-[min-content_1fr_min-content] w-full h-full text-xs pointer-events-auto py-6 px-16 gap-4"
    >
      <div className="relative flex justify-center">
        <div className="text-base text-warning">ALLIANCE [{allianceName}]</div>
        <div className="absolute top-[50%] right-0 transform translate-y-[-50%] opacity-75">
          {players.length}/{maxAllianceMembers?.toString() ?? "?"} member(s)
        </div>
      </div>
      <Tabs className="flex flex-col gap-4 w-full h-full" onChange={setActiveTabIndex}>
        <div className="relative flex justify-center w-full">
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
          <IconHints playerRole={playerRole} />
        </div>

        <Tabs.Pane index={0} className="w-full h-full p-0" fragment>
          <AutoSizer>
            {({ height, width }: { height: number; width: number }) => (
              <List height={height - 50} width={width} itemCount={players.length} itemSize={30} className="scrollbar">
                {({ index, style }) => (
                  <MemberItem
                    key={index}
                    index={index}
                    playerRole={playerRole}
                    player={{
                      entity: players[index].entity,
                      name: players[index].name,
                      role: (players[index].role as EAllianceRole) ?? EAllianceRole.Member,
                    }}
                    editMode={editMode}
                    style={style}
                  />
                )}
              </List>
            )}
          </AutoSizer>
        </Tabs.Pane>
        <Tabs.Pane index={1} className="w-full h-full p-0" fragment>
          <div className="grid grid-rows-2 gap-8 h-full py-2">
            <div className="flex flex-col gap-2">
              <span className="opacity-75">REQUEST(S) TO JOIN ({joinRequestPlayers.length})</span>
              {joinRequestPlayers.length > 0 ? (
                <AutoSizer>
                  {({ height, width }: { height: number; width: number }) => (
                    <List
                      height={height - 50}
                      width={width}
                      itemCount={joinRequestPlayers.length}
                      itemSize={30}
                      className="scrollbar"
                    >
                      {({ index, style }) => (
                        <JoinRequestPlayerItem
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
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="opacity-50">NO REQUESTS</span>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <span className="opacity-75">INVITATION(S) SENT ({invitedPlayers.length})</span>
              {invitedPlayers.length > 0 ? (
                <AutoSizer>
                  {({ height, width }: { height: number; width: number }) => (
                    <List
                      height={height - 50}
                      width={width}
                      itemCount={invitedPlayers.length}
                      itemSize={30}
                      className="scrollbar"
                    >
                      {({ index, style }) => (
                        <InvitedPlayerItem
                          key={index}
                          index={index}
                          playerEntity={invitedPlayers[index]}
                          style={style}
                        />
                      )}
                    </List>
                  )}
                </AutoSizer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="opacity-50">NO INVITATIONS</span>
                </div>
              )}
            </div>
          </div>
        </Tabs.Pane>
        <Tabs.Pane index={2} className="w-full h-full p-0" fragment>
          {/* currently empty as it will contain editing the description + invite mode once implemented */}
          <></>
        </Tabs.Pane>
      </Tabs>

      {playerRole < EAllianceRole.CanInvite && activeTabIndex === 0 ? (
        // show edit button on 'members' tab for officers
        <div className="relative flex justify-center w-full">
          <Navigator.NavButton size="sm" to="search" className="absolute left-0">
            <FaArrowLeft />
          </Navigator.NavButton>
          <Button variant="primary" onClick={() => setEditMode(!editMode)} className="btn-sm border-2 border-secondary">
            {editMode ? "BACK" : "EDIT"}
          </Button>
        </div>
      ) : activeTabIndex === 2 ? (
        // otherwise, if it's the settings tab, show leave button
        <div className="flex flex-col items-center gap-4">
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
            <Navigator.NavButton size="sm" to="search" className="absolute left-0">
              <FaArrowLeft />
            </Navigator.NavButton>
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
        </div>
      ) : (
        // in any other case, show invite input
        <div className="relative flex justify-end items-center gap-8">
          <Navigator.NavButton size="sm" to="search" className="absolute left-0">
            <FaArrowLeft />
          </Navigator.NavButton>
          <span>INVITE WITH FRIEND CODE:</span>
          <TextInput
            placeholder="ENTER FRIEND CODE"
            onChange={(e) => setFriendCode(e.target.value)}
            className="w-48 uppercase h-6 text-xs"
          />
          <TransactionQueueMask queueItemId={hashEntities(TransactionQueueType.Invite, playerEntity)}>
            <Button
              variant="primary"
              onClick={() => invite(mud, padHex(friendCode as Hex, { size: 32 }) as Entity)}
              className="btn-sm border-2 border-secondary"
              disabled={!friendCode}
            >
              SEND
            </Button>
          </TransactionQueueMask>
        </div>
      )}
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
          {playerRole <= EAllianceRole.CanKick ? (
            <>
              <span className="border-t border-secondary opacity-50 my-1" />
              <span>ACTIONS</span>
              {playerRole <= EAllianceRole.CanGrantRole ? (
                <>
                  <span className="flex gap-2">
                    <FaAngleDoubleUp size={16} className="text-success" /> Promote
                  </span>
                  <span className="flex gap-2">
                    <FaAngleDoubleDown size={16} className="text-warning" /> Demote
                  </span>
                </>
              ) : null}
              <span className="flex gap-2">
                <FaDoorOpen size={16} className="text-error" /> Kick
              </span>
            </>
          ) : null}
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
