import {
  Account,
  Leaderboard as _Leaderboard,
} from "src/network/components/clientComponents";
import { Card, SecondaryCard } from "../core/Card";

export const Leaderboard = () => {
  const address = Account.use()?.value;
  const data = _Leaderboard.use();
  if (!data || !address) return null;

  return (
    <Card className="flex gap-1">
      <SecondaryCard className="flex gap-1 border border-slate-700 bg-slate-800 text-sm flex-grow items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="bg-error px-2 rounded-md font-bold">
            <span className="opacity-75">RANK #</span>
            {data.playerRank}
          </p>
          <span>
            {data.scores.length >= data.playerRank
              ? data.scores[data.playerRank - 1].toLocaleString()
              : 0}
          </span>
          <p className="text-xs opacity-50"> POINTS </p>
        </div>
        {/* sync utility */}
        {/* {mainbaseCoord && (
          <div className="hover:bg-slate-500 rounded-md transition-all opacity-50 cursor-pointer pointer-events-auto">
            <FaSync
              size={20}
              onClick={() => claimFromMine(mainbaseCoord, network)}
              className={`p-1 ${transactionLoading ? "animate-spin" : ""}`}
            />
          </div>
        )} */}
      </SecondaryCard>
    </Card>
  );
};
