import { useState } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as List } from "react-window";
import { toast } from "react-toastify";
import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { Hex, padHex } from "viem";
import { FaCopy, FaExclamationTriangle } from "react-icons/fa";
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
      <Tabs className="flex flex-col gap-4 w-full h-full overflow-hidden" onChange={setActiveTabIndex}>
        <Join className="border border-secondary/25 self-center">
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

        <Tabs.Pane index={0} className="w-full h-full p-0" fragment>
          <AutoSizer>
            {({ height, width }: { height: number; width: number }) => (
              <List height={height} width={width} itemCount={players.length} itemSize={30} className="scrollbar">
                {({ index, style }) => (
                  <MemberItem
                    key={index}
                    index={index}
                    playerRole={playerRole}
                    player={players[index]}
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
                      height={height}
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
                      height={height}
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
        <Button
          variant="primary"
          onClick={() => setEditMode(!editMode)}
          className="btn-sm border-2 border-secondary justify-self-center"
        >
          {editMode ? "BACK" : "EDIT"}
        </Button>
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
          <Button
            tooltip={inviteOnly ? "You will need to request to join again" : undefined}
            tooltipDirection="top"
            variant="error"
            onClick={() => (playerRole === EAllianceRole.Owner ? confirmLeaveAlliance(mud) : leaveAlliance(mud))}
            className="btn-sm justify-self-center"
          >
            LEAVE
          </Button>
        </div>
      ) : (
        // in any other case, show invite input
        <div className="flex justify-end items-center gap-8">
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
              className="btn-xs border-2 border-secondary"
            >
              SEND
            </Button>
          </TransactionQueueMask>
        </div>
      )}
    </Navigator.Screen>
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
