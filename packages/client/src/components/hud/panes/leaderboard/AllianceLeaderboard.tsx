import { ComponentValue, Entity, HasValue } from "@latticexyz/recs";
import { useState } from "react";
import { FixedSizeList as List } from "react-window";
import { FaCog, FaEnvelope, FaUserPlus } from "react-icons/fa";
import { Button } from "src/components/core/Button";
import { SecondaryCard } from "src/components/core/Card";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { Tooltip } from "src/components/core/Tooltip";
import { Navigator } from "src/components/core/Navigator";
import { TextInput } from "src/components/core/TextInput";
import { Checkbox } from "src/components/core/Checkbox";
import { createAlliance, leaveAlliance } from "src/util/web3/contractCalls/alliance";
import { hexToString, Hex } from "viem";
import { useEntityQuery } from "@latticexyz/react";

const ALLIANCE_TAG_SIZE = 6;

export const AllianceLeaderboard = () => {
  return (
    <Navigator initialScreen="score" className="border-none p-0! h-full">
      <ScoreScreen />
      <CreateScreen />
      <InvitesScreen />
      <ManageScreen />
    </Navigator>
  );
};

export const ScoreScreen = () => {
  const data = components.AllianceLeaderboard.use();

  if (!data) return <></>;

  return (
    <Navigator.Screen title="score" className="flex flex-col items-center w-full text-xs pointer-events-auto">
      <List height={285} width="100%" itemCount={data.alliances.length} itemSize={47} className="scrollbar">
        {({ index, style }) => {
          const alliance = data.alliances[index];
          const score = data.scores[index];
          const allianceName = (components.Alliance.get(alliance)?.name ?? "") as Hex;
          return (
            <div style={style} className="pr-2">
              <LeaderboardItem key={index} alliance={allianceName} index={index} score={Number(score)} />
            </div>
          );
        }}
      </List>
      <hr className="w-full border-t border-cyan-800 my-2" />
      <PlayerInfo data={data} />
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
  const data = components.AllianceLeaderboard.use();
  const allianceEntity = data?.alliances[data?.playerAllianceRank - 1];
  const query = useEntityQuery([
    HasValue(components.PlayerAlliance, {
      alliance: allianceEntity,
    }),
  ]);

  if (!data) return <></>;

  return (
    <Navigator.Screen
      title="manage"
      className="flex flex-col items-center w-full text-xs pointer-events-auto h-full my-5"
    >
      <Navigator.BackButton className="btn-error border-none" onClick={() => leaveAlliance(network)}>
        LEAVE ALLIANCE
      </Navigator.BackButton>
    </Navigator.Screen>
  );
};

export const InvitesScreen = () => {
  const data = components.Leaderboard.use();

  if (!data) return <></>;

  return (
    <Navigator.Screen title="invites" className="flex flex-col items-center w-full text-xs pointer-events-auto">
      <TextInput placeholder="Enter Alliance Name" />
      <div>
        <Button>Create</Button>
        <Navigator.BackButton>Back</Navigator.BackButton>
      </div>
    </Navigator.Screen>
  );
};

const LeaderboardItem = ({ alliance, index, score }: { alliance: Hex; index: number; score: number }) => {
  return (
    <SecondaryCard className="grid grid-cols-6 w-full border rounded-md border-cyan-800 p-2 bg-slate-800 bg-gradient-to-br from-transparent to-bg-slate-900/30 items-center">
      <div>{index + 1}.</div>
      <div className="col-span-5 flex justify-between items-center">
        <div>{hexToString(alliance, { size: 32 }).substring(0, 6)}</div>
        <div className="flex items-center gap-1">
          <p className="font-bold rounded-md bg-cyan-700 px-2 ">{score.toLocaleString()}</p>
          <Tooltip text="Join" direction="left">
            <Button
              className="btn-xs flex border border-secondary"
              onClick={async () => {
                console.log("join");
              }}
            >
              <FaUserPlus />
            </Button>
          </Tooltip>
        </div>
      </div>
    </SecondaryCard>
  );
};

const PlayerInfo = ({ data }: { data: ComponentValue<typeof components.AllianceLeaderboard.schema> }) => {
  const playerEntity = useMud().network.playerEntity;

  const score = data.scores[data.playerAllianceRank - 1];
  const rank = data.playerAllianceRank;
  const allianceEntity = data.alliances[data.playerAllianceRank - 1];
  const alliance = components.Alliance.get(allianceEntity);
  const allianceName = (alliance?.name ?? "") as Hex;

  if (!allianceEntity) {
    return (
      <SecondaryCard className="w-full overflow-y-auto border border-slate-700 rounded-md p-2 bg-slate-800">
        {
          <div className="grid grid-cols-6 w-full items-center gap-2">
            <Navigator.NavButton to="create" className="btn-xs btn-secondary col-span-5">
              + Create Alliance
            </Navigator.NavButton>
            <Navigator.NavButton to="invites" className="btn-xs flex">
              <FaEnvelope /> <b>0</b>
            </Navigator.NavButton>
          </div>
        }
      </SecondaryCard>
    );
  }

  return (
    <SecondaryCard className="w-full overflow-y-auto border border-slate-700 rounded-md p-2 bg-slate-800">
      {
        <div className="grid grid-cols-6 w-full items-center gap-2">
          <div className="col-span-4 bg-neutral rounded-box p-1">
            <b className="text-accent">{rank}.</b>{" "}
            <b className="text-error">[{hexToString(allianceName, { size: 32 })}]</b> {score.toLocaleString()}
          </div>
          <Navigator.NavButton to="manage" className="btn-xs flex bg-secondary">
            <FaCog />
          </Navigator.NavButton>
          <Navigator.NavButton to="invites" className="btn-xs flex bg-secondary">
            <FaEnvelope /> <b>0</b>
          </Navigator.NavButton>
        </div>
      }
    </SecondaryCard>
  );
};
