import { Button } from "@/components/core/Button";
import { CrownRank } from "@/components/hud/global/modals/leaderboard/RankCrown";
import { Entity } from "@primodiumxyz/reactive-tables";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { useEffect, useMemo, useState } from "react";
import { FaSync } from "react-icons/fa";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as List } from "react-window";
import { SecondaryCard } from "@/components/core/Card";
import { AccountDisplay } from "@/components/shared/AccountDisplay";
import { useCore } from "@primodiumxyz/core/react";
import { EntityType, formatNumber, formatResourceCount, rankToScore } from "@primodiumxyz/core";

type FormattedPlayerData = {
  player: Entity;
  rank: number;
  points: bigint;
};

export const SubLeaderboard = ({
  leaderboard,
  alliance = false,
  icon,
}: {
  leaderboard: Entity;
  alliance?: boolean;
  icon?: string;
}) => {
  const core = useCore();
  const { tables } = core;
  const playerEntity = tables.Account.get()?.value;
  const [data, setData] = useState(tables.Leaderboard.get(leaderboard));
  const [showRefresh, setShowRefresh] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowRefresh(true);
    }, 1000);
    return () => clearInterval(interval);
  });
  const refresh = () => setData(tables.Leaderboard.get(leaderboard));
  const entity = alliance ? (tables.PlayerAlliance.get(playerEntity)?.alliance as Entity) : playerEntity;

  const formattedData = useMemo(() => {
    const ret: { allPlayers: FormattedPlayerData[]; player?: FormattedPlayerData } = {
      allPlayers: [],
    };
    if (!data) return ret;
    data.players.forEach((player, index) => {
      const points = data.points[index];
      const rank =
        index == 0 ? 1 : points == ret.allPlayers[index - 1]?.points ? ret.allPlayers[index - 1].rank : index + 1;
      const retData = {
        player,
        rank,
        points,
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
      {showRefresh && (
        <Button variant="neutral" onClick={refresh} className="absolute top-2 right-2 animate-in fade-in">
          <FaSync />
          Refresh
        </Button>
      )}
      <div className={`grid grid-cols-7 w-full p-2 pr-6 font-bold uppercase items-end`}>
        <div>Rank</div>
        <div className="col-span-3">Name</div>
        <div className="opacity-80 col-span-2">{icon ? <img src={icon} className="w-8" /> : "points"} </div>
        <div className="text-warning flex justify-center">
          <img src={InterfaceIcons.Leaderboard} className="w-8" />
        </div>
      </div>
      <div className="flex flex-col w-full h-full justify-between text-xs pointer-events-auto">
        <AutoSizer>
          {({ height, width }: { height: number; width: number }) => (
            <List
              // Unsure how this offset works but it is required to have even height with GrandLeaderboard.tsx.
              height={height}
              width={width}
              itemCount={formattedData.allPlayers.length}
              itemSize={52}
              className="scrollbar"
            >
              {({ index, style }) => {
                const player = formattedData.allPlayers[index];
                return (
                  <div style={style} className="pr-2">
                    <LeaderboardItem key={index} {...player} special={player.player === entity} alliance={alliance} />
                  </div>
                );
              }}
            </List>
          )}
        </AutoSizer>
      </div>
      {formattedData.player && (
        <div className="w-full self-end pr-4">
          <hr className="w-full border-t border-cyan-800 my-2" />
          <LeaderboardItem {...formattedData.player} special alliance={alliance} />
        </div>
      )}
    </div>
  );
};

const LeaderboardItem = ({
  player,
  rank,
  points,
  alliance = false,
  special = false,
}: {
  player: Entity;
  rank: number;
  points: bigint;
  alliance?: boolean;
  special?: boolean;
}) => {
  const core = useCore();
  const { tables, utils } = core;
  const playerEntity = tables.Account.get()?.value;

  const entity = alliance ? (tables.PlayerAlliance.get(playerEntity)?.alliance as Entity) : playerEntity;

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
      <div className="col-span-3 flex gap-1 justify-between items-center">
        <div className="flex items-center gap-1">
          {alliance ? (
            `[${utils.getAllianceName(player, true)}]`
          ) : (
            <AccountDisplay noColor={!special} player={player} />
          )}
          {player === entity && <p className="text-accent">(You)</p>}
        </div>
      </div>
      <p className="font-bold w-fit px-2 flex justify-center opacity-80 col-span-2">
        {formatResourceCount(EntityType.Iron, points, {
          fractionDigits: 1,
        })}
      </p>
      <div className="font-bold text-warning px-2 w-full flex justify-center">
        {formatNumber(rankToScore(rank), { fractionDigits: 1 })}
      </div>
    </SecondaryCard>
  );
};
