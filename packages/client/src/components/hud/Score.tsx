import { Account, Leaderboard as _Leaderboard } from "src/network/components/clientComponents";
import { Card } from "../core/Card";

export const Score = () => {
  const address = Account.use()?.value;
  const data = _Leaderboard.use();
  if (!data || !address) return null;

  return (
    <Card className="flex gap-1 text-sm flex-grow items-center justify-between w-fit">
      <div className="flex items-center gap-2">
        <p className="bg-error px-2 rounded-md font-bold">
          <span>RANK #{data.playerRank}</span>
        </p>
        <span>{data.scores.length >= data.playerRank ? data.scores[data.playerRank - 1].toLocaleString() : 0}</span>
        <p className="text-xs opacity-50"> POINTS </p>
      </div>
    </Card>
  );
};
