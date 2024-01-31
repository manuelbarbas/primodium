import { components } from "src/network/components";
import { Entity } from "@latticexyz/recs";
import { Card, SecondaryCard } from "../core/Card";
import { useMemo } from "react";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { formatNumber } from "src/util/number";
import { TargetHeader } from "./spacerock-menu/TargetHeader";
import { FaEye } from "react-icons/fa";

export const SpectatingDetails = () => {
  const activeRock = components.ActiveRock.use()?.value;
  const ownedBy = (components.OwnedBy.use(activeRock)?.value ?? singletonEntity) as Entity;
  const leaderboardPlayers = components.Leaderboard.use()?.players;
  const leaderboardScores = components.Leaderboard.use()?.scores;

  const [rank, score] = useMemo(() => {
    const _rank = (leaderboardPlayers ?? []).indexOf(ownedBy);

    if (_rank === -1) {
      return [(leaderboardPlayers ?? []).length + 1, 0];
    }

    return [_rank + 1, leaderboardScores ? leaderboardScores[_rank] : 0];
  }, [leaderboardPlayers, leaderboardScores, ownedBy]);

  return (
    <div className="ml-2 flex flex-col gap-2">
      <Card className="items-center justify-center min-w-fit !p-0 border-b-0">
        <div className="flex flex-col items-center">
          <p className="font-bold opacity-50 uppercase text-xs p-2 flex items-center gap-2">
            <FaEye />
            spectating
          </p>

          <SecondaryCard className="flex-row w-full gap-1 border-none">
            <TargetHeader entity={activeRock} showHousing />
          </SecondaryCard>
        </div>

        <SecondaryCard className="flex-row w-full gap-1 border-x-0 border-b-0 border-t-1">
          <p className="bg-error border border-rose-400 px-2 font-bold">
            <span>#{rank}</span>
          </p>
          <div className="flex grow items-center gap-1 px-2 bg-neutral justify-end font-bold border border-secondary/50">
            <span>
              {formatNumber(score, {
                short: true,
                showZero: true,
                fractionDigits: 2,
              })}
            </span>
            <p className="text-xs opacity-50"> PTS </p>
          </div>
        </SecondaryCard>
      </Card>
    </div>
  );
};
