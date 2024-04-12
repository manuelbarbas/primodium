import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { useMemo } from "react";
import { components } from "src/network/components";
import { formatResourceCount } from "src/util/number";
import { SecondaryCard } from "../core/Card";

export const Score: React.FC<{ player: Entity; leaderboard: Entity }> = ({ player, leaderboard }) => {
  const leaderboardPlayers = components.Leaderboard.use(leaderboard)?.players;
  const leaderboardScores = components.Leaderboard.use(leaderboard)?.scores;

  const [rank, score] = useMemo(() => {
    const _rank = (leaderboardPlayers ?? []).indexOf(player);

    if (_rank === -1) {
      return [(leaderboardPlayers ?? []).length + 1, 0];
    }

    return [_rank + 1, leaderboardScores ? leaderboardScores[_rank] : 0];
  }, [leaderboardPlayers, leaderboardScores, player]);

  const data = components.Leaderboard.use(leaderboard);

  if (!data) return null;

  return (
    <SecondaryCard className="flex-row w-full gap-1 border-x-0 border-b-0 border-t-1 text-sm">
      <p className="flex items-center px-1 bg-error border border-rose-400 font-bold">#{rank}</p>
      <div className="flex grow items-center gap-1 px-2 py-1 bg-neutral justify-end font-bold font-mono border border-secondary/50">
        <span>
          {formatResourceCount(singletonEntity, BigInt(score), {
            short: true,
            showZero: true,
            fractionDigits: 2,
          })}
        </span>
        <p className="text-xs opacity-50"> PTS </p>
      </div>
    </SecondaryCard>
  );
};
