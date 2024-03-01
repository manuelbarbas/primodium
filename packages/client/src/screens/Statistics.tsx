import { AccountDisplay } from "src/components/shared/AccountDisplay";
import { components } from "src/network/components";
import { entityToAddress, isPlayer } from "src/util/common";

export const Statistics = () => {
  const data = components.Leaderboard.use();
  if (!data) return null;

  return (
    <div>
      <p>score,primodium_account,external_wallet</p>
      {data.players.map((_, index: number) => {
        const player = data.players[index];
        const score = data.scores[index];
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
