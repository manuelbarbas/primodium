import { components } from "src/network/components";
import { formatResourceCount } from "src/util/number";
import { SecondaryCard } from "../core/Card";
import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { singletonEntity } from "@latticexyz/store-sync/recs";

export const Score: React.FC<{ player: Entity }> = ({ player }) => {
  const leaderboardPlayers = components.Leaderboard.use()?.players;
  const leaderboardScores = components.Leaderboard.use()?.scores;

  const [rank, score] = useMemo(() => {
    const _rank = (leaderboardPlayers ?? []).indexOf(player);

    if (_rank === -1) {
      return [(leaderboardPlayers ?? []).length + 1, 0];
    }

    return [_rank + 1, leaderboardScores ? leaderboardScores[_rank] : 0];
  }, [leaderboardPlayers, leaderboardScores, player]);

  const data = components.Leaderboard.use();

  if (!data) return null;

  return (
    <SecondaryCard className="flex-row w-full gap-1 border-x-0 border-b-0 border-t-1">
      <p className="flex items-center px-1 bg-error border border-rose-400 font-bold">#{rank}</p>
      <div className="flex grow items-center gap-1 px-2 py-1 bg-neutral justify-end font-bold border border-secondary/50">
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
