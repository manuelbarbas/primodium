import { useEffect, useMemo, useState } from "react";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { Card } from "../core/Card";
import { formatNumber } from "src/util/common";

export const Score = () => {
  const address = useMud().network.address;
  const data = components.Leaderboard.use();

  if (!data || !address) return null;

  return (
    <Card className="flex gap-1 text-sm flex-grow items-center justify-between w-fit rounded-t-none">
      <div className="flex gap-2 items-center">
        <p className="bg-error px-2 rounded-md font-bold">
          <span>#{data.playerRank}</span>
        </p>
        <div className="flex items-center gap-1">
          <span>
            {data.scores.length >= data.playerRank
              ? formatNumber(data.scores[data.playerRank - 1], {
                  short: true,
                  fractionDigits: 2,
                })
              : 0}
          </span>
          <p className="text-xs opacity-50"> PTS </p>
        </div>
      </div>
    </Card>
  );
};
