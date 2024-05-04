import { Button } from "@/components/core/Button";
import { CrownRank } from "@/components/hud/modals/leaderboard/RankCrown";
import { Entity } from "@latticexyz/recs";
import { useMemo, useState } from "react";
import { FaSync } from "react-icons/fa";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as List } from "react-window";
import { SecondaryCard } from "src/components/core/Card";
import { AccountDisplay } from "src/components/shared/AccountDisplay";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { getAllianceName } from "src/util/alliance";
import { EntityType } from "src/util/constants";
import { formatNumber, formatResourceCount } from "src/util/number";
import { rankToScore } from "src/util/score";

type FormattedPlayerData = {
  player: Entity;
  rank: number;
  score: bigint;
};

export const SubLeaderboard = ({ leaderboard, alliance = false }: { leaderboard: Entity; alliance?: boolean }) => {
  const { playerAccount } = useMud();
  const [data, setData] = useState(components.Leaderboard.get(leaderboard));

  const refresh = () => setData(components.Leaderboard.get(leaderboard));
  const entity = alliance
    ? (components.PlayerAlliance.get(playerAccount.entity)?.alliance as Entity)
    : playerAccount.entity;

  const formattedData = useMemo(() => {
    const ret: { allPlayers: FormattedPlayerData[]; player?: FormattedPlayerData } = {
      allPlayers: [],
    };
    if (!data) return ret;
    data.players.forEach((player, index) => {
      const score = data.scores[index];
      const rank =
        index == 0 ? 1 : score == ret.allPlayers[index - 1]?.score ? ret.allPlayers[index - 1].rank : index + 1;
      const retData = {
        player,
        rank,
        score,
      };
      ret.allPlayers.push(retData);
      if (player == entity) ret.player = retData;
    });
    return ret;
  }, [data, entity]);
  if (!data)
    return (
      <div className="w-full h-full flex justify-center items-center uppercase font-bold text-sm">No Data Found</div>
    );
  return (
    <div className="flex flex-col w-full h-full text-xs pointer-events-auto">
      <Button variant="neutral" onClick={refresh} className="absolute top-2 right-2">
        <FaSync />
        Refresh
      </Button>
      <div className={`grid grid-cols-7 w-full p-2 pr-6 font-bold uppercase`}>
        <div>Rank</div>
        <div className="col-span-4">Name</div>
        <div className="opacity-80">Points</div>
        <div className="text-warning text-right">Score</div>
      </div>
      <div className="flex flex-col w-full h-full justify-between text-xs pointer-events-auto">
        <AutoSizer>
          {({ height, width }: { height: number; width: number }) => (
            <List
              height={height - 65}
              width={width}
              itemCount={formattedData.allPlayers.length}
              itemSize={52}
              className="scrollbar"
            >
              {({ index, style }) => {
                const player = formattedData.allPlayers[index];
                return (
                  <div style={style} className="pr-2">
                    <LeaderboardItem key={index} {...player} special={player.player === entity} />
                  </div>
                );
              }}
            </List>
          )}
        </AutoSizer>
        {formattedData.player && (
          <div className="w-full self-end pr-4">
            <hr className="w-full border-t border-cyan-800 my-2" />
            <LeaderboardItem {...formattedData.player} special />
          </div>
        )}
      </div>
    </div>
  );
};

const LeaderboardItem = ({
  player,
  rank,
  score,
  alliance = false,
  special = false,
}: {
  player: Entity;
  rank: number;
  score: bigint;
  alliance?: boolean;
  special?: boolean;
}) => {
  const {
    playerAccount: { entity: playerEntity },
  } = useMud();

  const entity = alliance ? (components.PlayerAlliance.get(playerEntity)?.alliance as Entity) : playerEntity;

  const rankSuffix = rank == 1 ? "st" : rank == 2 ? "nd" : rank == 3 ? "rd" : "th";

  return (
    <SecondaryCard
      className={`grid grid-cols-7 w-full items-center h-12 ${special ? "border-success bg-success/20" : ""}`}
    >
      <div className={`grid grid-cols-2 gap-1 items-center`}>
        <p>
          {rank}
          {rankSuffix}
        </p>

        <CrownRank rank={rank} />
      </div>
      <div className="col-span-4 flex gap-1 justify-between items-center">
        <div className="flex items-center gap-1">
          {alliance ? `[${getAllianceName(player, true)}]` : <AccountDisplay noColor={!special} player={player} />}
          {player === entity && <p className="text-accent">(You)</p>}
        </div>
      </div>
      <p className="font-bold w-fit px-2 flex justify-center opacity-80">
        {formatResourceCount(EntityType.Iron, score, {
          notLocale: true,
          fractionDigits: 1,
        }).toLocaleString()}
      </p>
      <div className="font-bold text-warning px-2 w-full text-right">
        {formatNumber(rankToScore(rank), { fractionDigits: 1 })}
      </div>
    </SecondaryCard>
  );
};
