import { FinalLeaderboardData } from "@/util/leaderboard/getFinalLeaderboardData";
import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { FaCog, FaEnvelope } from "react-icons/fa";
import { SecondaryCard } from "src/components/core/Card";
import { Navigator } from "src/components/core/Navigator";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { GrandLeaderboardItem } from "../leaderboard/GrandLeaderboard";

export const InfoRow = ({ data }: { data?: FinalLeaderboardData }) => {
  const rank = data?.rank;
  if (!data || rank == 0) return <SoloPlayerInfo />;

  return <PlayerInfo {...data} />;
};

const PlayerInfo = ({
  shardRank,
  wormholeRank,
  rank,
  finalScore,
  player: alliance,
}: {
  shardRank?: number;
  wormholeRank?: number;
  rank: number;
  finalScore: number;
  player: Entity;
}) => {
  const {
    playerAccount: { entity: playerEntity },
  } = useMud();
  const invites = components.PlayerInvite.useAllWith({ target: playerEntity }) ?? [];
  const playerAlliance = components.PlayerAlliance.use(playerEntity)?.alliance as Entity | undefined;
  const joinRequests = components.AllianceRequest.useAllWith({ alliance: playerAlliance ?? singletonEntity }) ?? [];

  return (
    <SecondaryCard className="w-full border border-slate-700 p-2 bg-slate-800">
      {
        <div className="grid grid-cols-6 w-full items-center gap-2">
          <GrandLeaderboardItem
            alliance
            rank={rank}
            finalScore={finalScore}
            player={alliance}
            shardRank={shardRank}
            wormholeRank={wormholeRank}
            className="col-span-4 h-full"
            hideRanks
          />
          <Navigator.NavButton to="manage" className="flex bg-secondary btn-sm">
            <FaCog />
          </Navigator.NavButton>
          <Navigator.NavButton to="invites" className="flex bg-secondary btn-sm">
            <FaEnvelope /> <b>{joinRequests.length ?? invites.length}</b>
          </Navigator.NavButton>
        </div>
      }
    </SecondaryCard>
  );
};

const SoloPlayerInfo = () => {
  const {
    playerAccount: { entity: playerEntity },
  } = useMud();
  const invites = components.PlayerInvite.useAllWith({ target: playerEntity }) ?? [];

  return (
    <SecondaryCard className="w-full border border-slate-700 p-2 bg-slate-800">
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
