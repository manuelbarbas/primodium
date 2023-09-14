import {
  Account,
  Leaderboard as _Leaderboard,
} from "src/network/components/clientComponents";
import { Card, SecondaryCard } from "../core/Card";

export const Score = () => {
  const address = Account.use()?.value;
  const data = _Leaderboard.use();
  if (!data || !address) return null;

  return (
    <Card className="flex gap-1">
      <SecondaryCard className="flex gap-1 border border-slate-700 bg-slate-800 text-sm flex-grow items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="bg-error px-2 rounded-md font-bold">
            <span>RANK #{data.playerRank}</span>
          </p>
          <span>
            {data.scores.length >= data.playerRank
              ? data.scores[data.playerRank - 1].toLocaleString()
              : 0}
          </span>
          <p className="text-xs opacity-50"> POINTS </p>
        </div>
      </SecondaryCard>
    </Card>
  );
};
