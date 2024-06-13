import { AccountDisplay } from "src/components/shared/AccountDisplay";
import { entityToAddress, isPlayer } from "@primodiumxyz/core";
import { useCore } from "@primodiumxyz/core/react";

export const Statistics = () => {
  const { tables } = useCore();
  const data = tables.Leaderboard.use();
  if (!data) return null;

  return (
    <div>
      <p>score,primodium_account,external_wallet</p>
      {data.players.map((_, index: number) => {
        const player = data.players[index];
        const score = data.points[index];
        if (isPlayer(player)) {
          return (
            <p key={index}>
              {`${score},${entityToAddress(player)},`}

              <AccountDisplay player={player} />
            </p>
          );
        } else {
          return <></>;
        }
      })}
    </div>
  );
};
