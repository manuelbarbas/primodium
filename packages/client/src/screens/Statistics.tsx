import { components } from "src/network/components";
import { FixedSizeList as List } from "react-window";
import { LinkedAddressDisplay } from "src/components/hud/LinkedAddressDisplay";
import { entityToAddress } from "src/util/common";

export const Statistics = () => {
  const data = components.Leaderboard.use();
  console.log(data);

  if (!data) return null;

  return (
    <div>
      <p>score,primodium_account,external_wallet</p>
      <List height={285} width="100%" itemCount={data.players.length} itemSize={47} className="scrollbar">
        {({ index }) => {
          const player = data.players[index];
          const score = data.scores[index];
          return (
            <p>
              {`${score},${entityToAddress(player)},`}
              <LinkedAddressDisplay entity={player} shorten={false} displayReadable={false} />
            </p>
          );
        }}
      </List>
    </div>
  );
};
