import { ComponentValue, Entity } from "@latticexyz/recs";
import { useState } from "react";
import { FixedSizeList as List } from "react-window";
import {
  FaArrowDown,
  FaArrowUp,
  FaCog,
  FaEnvelope,
  FaUserMinus,
  FaUserPlus,
  FaInfoCircle,
  FaArrowLeft,
  FaCheck,
  FaTimes,
  FaCopy,
} from "react-icons/fa";
import { Button } from "src/components/core/Button";
import { SecondaryCard } from "src/components/core/Card";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { Tooltip } from "src/components/core/Tooltip";
import { Navigator } from "src/components/core/Navigator";
import { TextInput } from "src/components/core/TextInput";
import { Checkbox } from "src/components/core/Checkbox";
import {
  createAlliance,
  joinAlliance,
  kickPlayer,
  leaveAlliance,
  grantRole,
  requestToJoin,
  rejectJoinRequest,
  acceptJoinRequest,
  invite,
} from "src/util/web3/contractCalls/alliance";
import { GiRank1, GiRank2, GiRank3 } from "react-icons/gi";
import { hexToString, Hex, padHex, isAddress } from "viem";
import { entityToAddress } from "src/util/common";
import { Join } from "src/components/core/Join";
import { EAllianceInviteMode, EAllianceRole } from "contracts/config/enums";
import { singletonEntity } from "@latticexyz/store-sync/recs";

const ALLIANCE_TAG_SIZE = 6;

export const AllianceLeaderboard = () => {
  return (
    <Navigator initialScreen="score" className="border-none p-0! h-full">
      <ScoreScreen />
      <CreateScreen />
      <InvitesScreen />
      <SendInviteScreen />
      <ManageScreen />
    </Navigator>
  );
};

export const ScoreScreen = () => {
  const data = components.AllianceLeaderboard.use();

  return (
    <Navigator.Screen title="score" className="flex flex-col items-center w-full h-full text-xs pointer-events-auto">
      {data && (
        <List height={285} width="100%" itemCount={data.alliances.length} itemSize={47} className="scrollbar">
          {({ index, style }) => {
            const alliance = data.alliances[index];
            const score = data.scores[index];
            const allianceName = (components.Alliance.get(alliance)?.name ?? "") as Hex;
            return (
              <div style={style} className="pr-2">
                <LeaderboardItem
                  key={index}
                  alliance={allianceName}
                  index={index}
                  score={Number(score)}
                  entity={alliance}
                />
              </div>
            );
          }}
        </List>
      )}
      {!data && (
        <SecondaryCard className="w-full flex-grow items-center justify-center font-bold opacity-50">
          NO ALLIANCES
        </SecondaryCard>
      )}
      <hr className="w-full border-t border-cyan-800 my-2" />
      <InfoRow data={data} />
    </Navigator.Screen>
  );
};

export const CreateScreen = () => {
  const [inviteOnly, setInviteOnly] = useState(true);
  const [allianceTag, setAllianceTag] = useState("");
  const network = useMud().network;

  return (
    <Navigator.Screen
      title="create"
      className="flex flex-col items-center w-full text-xs pointer-events-auto h-full my-5"
    >
      <div className="flex items-center gap-2">
        <b className="text-2xl">[</b>
        <TextInput
          placeholder=""
          bottomLeftLabel={`MAX ${ALLIANCE_TAG_SIZE} CHAR.`}
          topLeftLabel="ENTER ALLIANCE TAG"
          maxLength={ALLIANCE_TAG_SIZE}
          onChange={(e) => {
            setAllianceTag(e.target.value);
          }}
          className="text-center font-bold uppercase"
        />
        <b className="text-2xl">]</b>
      </div>

      <Checkbox label="INVITE ONLY" className="checkbox-error" defaultChecked onChange={setInviteOnly} />

      <div className="flex gap-1 mt-auto">
        <Navigator.BackButton
          disabled={!allianceTag}
          className="btn-primary btn-sm"
          onClick={() => {
            createAlliance(allianceTag, inviteOnly, network);
          }}
        >
          Create
        </Navigator.BackButton>
        <Navigator.BackButton>Back</Navigator.BackButton>
      </div>
    </Navigator.Screen>
  );
};

export const ManageScreen: React.FC = () => {
  const network = useMud().network;
  const playerEntity = network.playerEntity;
  const data = components.AllianceLeaderboard.use();
  const allianceEntity = data?.alliances[data?.playerAllianceRank - 1];
  const playerRole = components.PlayerAlliance.get(playerEntity)?.role ?? EAllianceRole.Member;
  const playerEntities = components.PlayerAlliance.useAllWith({
    alliance: allianceEntity,
  });

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
              className="card compact dropdown-content z-[1] shadow bg-base-100 rounded-box w-56 p-1 m-1 border border-secondary"
            >
              <span className="flex">
                <GiRank1 size={18} className="text-yellow-500" />: Invite Members
              </span>
              <span className="flex">
                <GiRank2 size={18} className="text-yellow-500" />: Kick Members
              </span>
              <span className="flex">
                <GiRank3 size={18} className="text-yellow-500" />: Promote/Demote Members
              </span>
            </div>
          </div>
        </div>

        <Join direction="vertical" className="overflow-auto w-full h-64 scrollbar">
          {players.map((player) => {
            const role = player?.role ?? EAllianceRole.Member;
            const entity = player.entity;

            return (
              <SecondaryCard key={player.entity} className="border-b rounded-none flex-row justify-between">
                {role === EAllianceRole.Owner && (
                  <div className="flex items-center gap-1 font-bold text-warning">
                    <GiRank3 size={18} className="text-yellow-500" />
                    {entityToAddress(entity, true)} (Owner)
                  </div>
                )}
                {role === EAllianceRole.CanGrantRole && (
                  <div className="flex items-center gap-1 font-bold">
                    <GiRank3 size={18} className="text-yellow-500" />
                    {entityToAddress(entity, true)}
                  </div>
                )}
                {role === EAllianceRole.CanKick && (
                  <div className="flex items-center gap-1 font-bold">
                    <GiRank2 size={18} className="text-yellow-500" />
                    {entityToAddress(entity, true)}
                  </div>
                )}
                {role === EAllianceRole.CanInvite && (
                  <div className="flex items-center gap-1 font-bold">
                    <GiRank1 size={18} className="text-yellow-500" />
                    {entityToAddress(entity, true)}
                  </div>
                )}
                {role === EAllianceRole.Member && (
                  <div className="flex items-center gap-1 font-bold">{entityToAddress(entity, true)}</div>
                )}
                <div className="flex gap-1">
                  {/* only kick if not current player, has the ability to kick, and current player is higher than member */}
                  {entity !== playerEntity && playerRole <= EAllianceRole.CanKick && role > playerRole && (
                    <Tooltip text="Kick" direction="left">
                      <Button className="btn-xs !rounded-box border-error" onClick={() => kickPlayer(entity, network)}>
                        <FaUserMinus className="rounded-none" size={10} />
                      </Button>
                    </Tooltip>
                  )}
                  {/* only promote if not current player, has the ability to promote, and current player is higher than member */}
                  {entity !== playerEntity && playerRole <= EAllianceRole.CanGrantRole && role > playerRole && (
                    <Tooltip text="Demote" direction="left">
                      <Button
                        className="btn-xs !rounded-box border-warning"
                        onClick={() => grantRole(entity, Math.min(role + 1, EAllianceRole.Member), network)}
                      >
                        <FaArrowDown />
                      </Button>
                    </Tooltip>
                  )}
                  {/* only promote if not current player, has the ability to promote, and current player is higher than member */}
                  {entity !== playerEntity && playerRole <= EAllianceRole.CanGrantRole && role > playerRole && (
                    <Tooltip text="Promote" direction="left">
                      <Button
                        className="btn-xs !rounded-box border-success"
                        onClick={() => grantRole(entity, Math.max(role - 1, EAllianceRole.CanGrantRole), network)}
                      >
                        <FaArrowUp />
                      </Button>
                    </Tooltip>
                  )}
                </div>
              </SecondaryCard>
            );
          })}
        </Join>
        <p className="p-1 opacity-50 text-right">{players.length} member(s)</p>
      </div>

      <div className="flex gap-1">
        <Navigator.BackButton className="btn-error border-none" onClick={() => leaveAlliance(network)}>
          LEAVE ALLIANCE
        </Navigator.BackButton>
        <Navigator.BackButton>
          <FaArrowLeft />
        </Navigator.BackButton>
      </div>
    </Navigator.Screen>
  );
};

export const InvitesScreen: React.FC = () => {
  const network = useMud().network;
  const playerEntity = network.playerEntity;
  const playerAlliance = components.PlayerAlliance.get(playerEntity)?.alliance as Entity | undefined;

  const invites = components.PlayerInvite.useAllWith({ target: playerEntity }) ?? [];
  const joinRequests = components.AllianceRequest.useAllWith({ alliance: playerAlliance ?? singletonEntity }) ?? [];

  return (
    <Navigator.Screen
      title="invites"
      className="flex flex-col items-center w-full text-xs pointer-events-auto h-full overflow-hidden"
    >
      <div className="grid grid-cols-2 w-full gap-2 mb-2">
        <div className="w-full flex flex-col flex-grow">
          <div className="flex justify-between items-center">
            <p className="font-bold p-1 opacity-75">INVITES</p>
          </div>

          <Join direction="vertical" className="overflow-auto w-full h-56 scrollbar">
            {invites.map((entity) => {
              const playerInvite = components.PlayerInvite.get(entity);
              const alliance = components.Alliance.get(playerInvite?.alliance);

              if (!playerInvite?.alliance || !alliance?.name) return <></>;

              const name = hexToString(alliance.name as Hex, { size: 32 });

              return (
                <SecondaryCard key={entity} className="border-b rounded-none flex-row justify-between items-center">
                  {name}
                  <div className="flex gap-1">
                    {/* only kick if not current player, has the ability to kick, and current player is higher than member */}

                    <Tooltip text="Decline" direction="left">
                      <Button className="btn-xs !rounded-box border-error" onClick={() => console.log("decline")}>
                        <FaTimes className="rounded-none" size={10} />
                      </Button>
                    </Tooltip>
                    <Tooltip text="Accept" direction="left">
                      <Button
                        className="btn-xs !rounded-box border-success"
                        onClick={() => joinAlliance(playerInvite.alliance, network)}
                      >
                        <FaCheck className="rounded-none" size={10} />
                      </Button>
                    </Tooltip>
                  </div>
                </SecondaryCard>
              );
            })}
          </Join>
          <p className="p-1 opacity-50 text-right">{invites.length} invites(s)</p>
        </div>
        <div className="w-full flex flex-col flex-grow">
          <div className="flex justify-between items-center">
            <p className="font-bold p-1 opacity-75">REQUESTS</p>
          </div>

          <Join direction="vertical" className="overflow-auto w-full h-56 scrollbar">
            {joinRequests.map((entity) => {
              const request = components.AllianceRequest.get(entity);
              const role = components.PlayerAlliance.get(playerEntity)?.role ?? EAllianceRole.Member;

              if (!request?.player) return <></>;

              return (
                <SecondaryCard key={entity} className="border-b rounded-none flex-row justify-between items-center">
                  {entityToAddress(request.player ?? singletonEntity, true)}
                  {role <= EAllianceRole.CanInvite && (
                    <div className="flex gap-1">
                      {/* only kick if not current player, has the ability to kick, and current player is higher than member */}
                      <Tooltip text="Decline" direction="left">
                        <Button
                          className="btn-xs !rounded-box border-error"
                          onClick={() => acceptJoinRequest(request.player, network)}
                        >
                          <FaTimes className="rounded-none" size={10} />
                        </Button>
                      </Tooltip>
                      <Tooltip text="Accept" direction="left">
                        <Button
                          className="btn-xs !rounded-box border-success"
                          onClick={() => rejectJoinRequest(request.player, network)}
                        >
                          <FaCheck className="rounded-none" size={10} />
                        </Button>
                      </Tooltip>
                    </div>
                  )}
                </SecondaryCard>
              );
            })}
          </Join>
          <p className="p-1 opacity-50 text-right">{joinRequests.length} requests(s)</p>
        </div>
      </div>

      <div className="flex gap-1">
        <Navigator.NavButton to="send" className="btn-secondary btn-sm border-none">
          SEND INVITE
        </Navigator.NavButton>
        <Navigator.BackButton>
          <FaArrowLeft />
        </Navigator.BackButton>
      </div>
      <div className="flex gap-1 p-2 opacity-50 items-center">
        WALLET: {entityToAddress(playerEntity, true)}
        <Tooltip text="Click to copy" direction="left">
          <Button className="btn-xs" onClick={() => navigator.clipboard.writeText(entityToAddress(playerEntity))}>
            <FaCopy />
          </Button>
        </Tooltip>
      </div>
    </Navigator.Screen>
  );
};

export const SendInviteScreen = () => {
  const [targetAddress, setTargetAddress] = useState("");
  const network = useMud().network;

  return (
    <Navigator.Screen
      title="send"
      className="flex flex-col items-center w-full text-xs pointer-events-auto h-full my-5"
    >
      <div className="flex items-center gap-2">
        <TextInput
          placeholder="0x..."
          topLeftLabel="ENTER PLAYER ADDRESS"
          maxLength={42}
          onChange={(e) => {
            setTargetAddress(e.target.value);
          }}
          className="text-center font-bold"
        />
      </div>

      <div className="flex gap-1 mt-auto">
        <Navigator.BackButton
          disabled={!targetAddress || !isAddress(targetAddress)}
          className="btn-primary btn-sm"
          onClick={() => {
            invite(padHex(targetAddress as Hex, { size: 32 }) as Entity, network);
          }}
        >
          Invite
        </Navigator.BackButton>
        <Navigator.BackButton>Back</Navigator.BackButton>
      </div>
    </Navigator.Screen>
  );
};

const LeaderboardItem = ({
  alliance,
  index,
  score,
  entity,
}: {
  alliance: Hex;
  index: number;
  score: number;
  entity: Entity;
}) => {
  const network = useMud().network;
  const playerEntity = network.playerEntity;
  const allianceMode = components.Alliance.get(entity)?.inviteMode as EAllianceInviteMode | undefined;
  const playerAlliance = components.PlayerAlliance.get(playerEntity)?.alliance;
  const inviteOnly = allianceMode === EAllianceInviteMode.Closed;

  return (
    <SecondaryCard
      className={`grid grid-cols-6 w-full border rounded-md border-cyan-800 p-2 bg-slate-800 bg-gradient-to-br from-transparent to-bg-slate-900/30 items-center ${
        inviteOnly ? "border-warning" : ""
      }`}
    >
      <div>{index + 1}.</div>
      <div className="col-span-5 flex justify-between items-center">
        <div>{hexToString(alliance, { size: 32 }).substring(0, 6)}</div>
        <div className="flex items-center gap-1">
          <p className="font-bold rounded-md bg-cyan-700 px-2 ">{score.toLocaleString()}</p>
          {playerAlliance !== entity && (
            <Tooltip text={inviteOnly ? "Request to Join" : "Join"} direction="left">
              <Button
                className={`btn-xs flex border ${inviteOnly ? "border-warning" : "border-secondary"}`}
                onClick={() => {
                  inviteOnly ? requestToJoin(entity, network) : joinAlliance(entity, network);
                }}
              >
                <FaUserPlus />
              </Button>
            </Tooltip>
          )}
        </div>
      </div>
    </SecondaryCard>
  );
};

const InfoRow = ({ data }: { data?: ComponentValue<typeof components.AllianceLeaderboard.schema> }) => {
  if (!data) return <SoloPlayerInfo />;

  const score = data.scores[data.playerAllianceRank - 1];
  const rank = data.playerAllianceRank;
  const allianceEntity = data.alliances[data.playerAllianceRank - 1];
  const alliance = components.Alliance.get(allianceEntity);
  const allianceName = (alliance?.name ?? "") as Hex;

  if (!allianceEntity) return <SoloPlayerInfo />;

  return <PlayerInfo rank={rank} allianceName={hexToString(allianceName, { size: 32 })} score={Number(score)} />;
};

const PlayerInfo = ({ rank, allianceName, score }: { rank: number; allianceName: string; score: number }) => {
  const playerEntity = useMud().network.playerEntity;
  const invites = components.PlayerInvite.useAllWith({ target: playerEntity }) ?? [];

  return (
    <SecondaryCard className="w-full overflow-y-auto border border-slate-700 rounded-md p-2 bg-slate-800">
      {
        <div className="grid grid-cols-6 w-full items-center gap-2">
          <div className="col-span-4 bg-neutral rounded-box p-1">
            <b className="text-accent">{rank}.</b> <b className="text-error">[{allianceName}]</b>{" "}
            {score.toLocaleString()}
          </div>
          <Navigator.NavButton to="manage" className="btn-xs flex bg-secondary">
            <FaCog />
          </Navigator.NavButton>
          <Navigator.NavButton to="invites" className="btn-xs flex bg-secondary">
            <FaEnvelope /> <b>{invites.length}</b>
          </Navigator.NavButton>
        </div>
      }
    </SecondaryCard>
  );
};

const SoloPlayerInfo = () => {
  const playerEntity = useMud().network.playerEntity;
  const invites = components.PlayerInvite.useAllWith({ target: playerEntity }) ?? [];

  return (
    <SecondaryCard className="w-full overflow-y-auto border border-slate-700 rounded-md p-2 bg-slate-800">
      {
        <div className="grid grid-cols-6 w-full items-center gap-2">
          <Navigator.NavButton to="create" className="btn-xs btn-secondary col-span-5">
            + Create Alliance
          </Navigator.NavButton>
          <Navigator.NavButton to="invites" className="btn-xs flex">
            <FaEnvelope /> <b>{invites.length}</b>
          </Navigator.NavButton>
        </div>
      }
    </SecondaryCard>
  );
};
