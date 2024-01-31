import { components } from "src/network/components";
import { formatNumber } from "src/util/number";
import { SecondaryCard } from "../core/Card";

export const Score = () => {
  const data = components.Leaderboard.use();

  if (!data) return null;

  return (
    <SecondaryCard className="flex flex-row gap-1 text-sm flex-grow justify-between items-center rounded-t-none px-2 py-1.5 w-full border-0">
      <p className="bg-error border border-rose-400 px-2 font-bold">
        <span>#{data.playerRank}</span>
      </p>
      <div className="flex grow items-center gap-1 px-2 bg-neutral justify-end font-bold border border-secondary/50">
        <span>
          {data.scores.length >= data.playerRank
            ? formatNumber(data.scores[data.playerRank - 1], {
                short: true,
                showZero: true,
                fractionDigits: 2,
              })
            : 0}
        </span>
        <p className="text-xs opacity-50"> PTS </p>
      </div>
    </SecondaryCard>
  );
};
