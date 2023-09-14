import { useEffect, useMemo, useState } from "react";
import { FixedSizeList as List } from "react-window";
import { EntityID } from "@latticexyz/recs";
import { getAddress } from "ethers/lib/utils.js";

import {
  Account,
  Leaderboard as _Leaderboard,
} from "src/network/components/clientComponents";
import { shortenAddress } from "src/util/common";
import { useGameStore } from "src/store/GameStore";

export const Leaderboard = () => {
  const address = Account.use()?.value;

  const transactionLoading = useGameStore((state) => state.transactionLoading);
  const data = _Leaderboard.use();

  if (!data || !address) return null;

  return (
    <div className="flex flex-col items-center gap-2 text-white w-96 min-w-full">
      <List
        height={384}
        width="100%"
        itemCount={data.players.length}
        itemSize={48}
      >
        {({ index, style }) => {
          const player = data.players[index];
          const score = data.scores[index];
          return (
            <div style={style}>
              <LeaderboardItem
                key={index}
                player={player}
                index={index}
                score={score}
              />
            </div>
          );
        }}
      </List>
      <hr className="w-full border-t border-cyan-800" />
      <div className="w-full overflow-y-auto border border-slate-700 rounded-md p-2 bg-slate-800 text-sm">
        {address && (
          <div className="grid grid-cols-6 w-full">
            <div>{data.playerRank}.</div>
            <div className="col-span-5 flex justify-between">
              <div className="bg-rose-800 px-2 rounded-md">You</div>
              <button
                disabled={transactionLoading}
                className="px-2 rounded-md hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-cyan-700 border-cyan-500"
                onClick={() => "Link"}
              >
                Link Wallet
              </button>
              <div className="font-bold rounded-md bg-cyan-700 px-2">
                {data.scores.length >= data.playerRank
                  ? data.scores[data.playerRank - 1].toLocaleString()
                  : 0}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const LeaderboardItem = ({
  player,
  index,
  score,
}: {
  player: EntityID;
  index: number;
  score: number;
}) => {
  const [fetchedExternalWallet, setFetchedExternalWallet] = useState<{
    address: string | null;
    ensName: string | null;
  }>({ address: player, ensName: null });

  useEffect(() => {
    const fetchLocalLinkedAddress = async () => {
      try {
        const res = await fetch(
          `${
            import.meta.env.VITE_ACCOUNT_LINK_VERCEL_URL
          }/linked-address/local-to-external/${getAddress(player)}`
        );
        const jsonRes = await res.json();
        setFetchedExternalWallet(jsonRes);
      } catch (error) {
        return;
      }
    };
    fetchLocalLinkedAddress();
  }, [player]);

  const playerDisplay: string = useMemo(() => {
    if (fetchedExternalWallet.ensName) {
      return fetchedExternalWallet.ensName;
    } else if (fetchedExternalWallet.address) {
      return shortenAddress(fetchedExternalWallet.address);
    } else {
      return shortenAddress(player);
    }
  }, [fetchedExternalWallet, player]);

  return (
    <div className="grid grid-cols-6 w-full border rounded-md border-cyan-800 p-2 bg-slate-800 bg-gradient-to-br from-transparent to-bg-slate-900/30">
      <div>{index + 1}.</div>
      <div className="col-span-5 flex justify-between">
        <div>{playerDisplay}</div>
        <div className="font-bold rounded-md bg-cyan-700 px-2">
          {score.toLocaleString()}
        </div>
      </div>
    </div>
  );
};
