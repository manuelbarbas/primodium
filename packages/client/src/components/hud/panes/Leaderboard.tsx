import { EntityID } from "@latticexyz/recs";
import { getAddress } from "ethers/lib/utils.js";
import { useEffect, useMemo, useState } from "react";
import { FixedSizeList as List } from "react-window";

import { primodium } from "@game/api";
import { Scenes } from "@game/constants";
import { FaCrosshairs } from "react-icons/fa";
import { Button } from "src/components/core/Button";
import { SecondaryCard } from "src/components/core/Card";
import { Position } from "src/network/components/chainComponents";
import { Account, MapOpen, Send, Leaderboard as _Leaderboard } from "src/network/components/clientComponents";
import { useGameStore } from "src/store/GameStore";
import { shortenAddress } from "src/util/common";
import { getLinkedAddress } from "src/util/web2/getLinkedAddress";
import { linkAddress } from "src/util/web2/linkAddress";

export const Leaderboard = () => {
  const address = Account.use()?.value;
  const transactionLoading = useGameStore((state) => state.transactionLoading);
  const data = _Leaderboard.use();
  const [linkedAddress, setLinkedAddress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLinkedAddress = async () => {
      try {
        const result = await getLinkedAddress();
        setLinkedAddress(result.address);
      } catch (error) {
        console.error("Failed to get linked address:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLinkedAddress();
  }, []);

  if (!data || !address) return null;

  return (
    <div className="flex flex-col items-center w-full text-xs pointer-events-auto scrollbar">
      <List height={323} width="100%" itemCount={data.players.length} itemSize={35}>
        {({ index, style }) => {
          const player = data.players[index];
          const score = data.scores[index];
          return (
            <div style={style}>
              <LeaderboardItem key={index} player={player} index={index} score={score} />
            </div>
          );
        }}
      </List>
      <hr className="w-full border-t border-cyan-800 my-2" />
      <SecondaryCard className="w-full overflow-y-auto border border-slate-700 rounded-md p-2 bg-slate-800">
        {address && (
          <div className="grid grid-cols-6 w-full items-center">
            <div>{data.playerRank}.</div>
            <div className="col-span-5 flex justify-between">
              <p className="bg-rose-800 px-2 rounded-md flex items-center">You</p>
              <Button disabled={transactionLoading} className="btn-xs btn-secondary" onClick={linkAddress}>
                {loading ? "..." : linkedAddress ? "Wallet Linked" : "Link Wallet"}
              </Button>
              <p className="font-bold rounded-md bg-cyan-700 px-2 flex items-center">
                {data.scores.length >= data.playerRank ? data.scores[data.playerRank - 1].toLocaleString() : 0}
              </p>
            </div>
          </div>
        )}
      </SecondaryCard>
    </div>
  );
};

const LeaderboardItem = ({ player, index, score }: { player: EntityID; index: number; score: number }) => {
  const [fetchedExternalWallet, setFetchedExternalWallet] = useState<{
    address: string | null;
    ensName: string | null;
  }>({ address: player, ensName: null });

  useEffect(() => {
    const fetchLocalLinkedAddress = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_ACCOUNT_LINK_VERCEL_URL}/linked-address/local-to-external/${getAddress(player)}`
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
    <SecondaryCard className="grid grid-cols-6 w-full border rounded-md border-cyan-800 p-2 bg-slate-800 bg-gradient-to-br from-transparent to-bg-slate-900/30">
      <div>{index + 1}.</div>
      <div className="col-span-5 flex justify-between">
        <div>{playerDisplay}</div>
        <div className="flex items-center gap-1">
          <p className="font-bold rounded-md bg-cyan-700 px-2 ">{score.toLocaleString()}</p>
          <Button
            className="btn-xs flex border border-secondary"
            onClick={async () => {
              const mapOpen = MapOpen.get(undefined, {
                value: false,
              }).value;

              if (!mapOpen) {
                const { transitionToScene } = primodium.api().scene;

                await transitionToScene(Scenes.Asteroid, Scenes.Starmap);
                MapOpen.set({ value: true });
              }

              const { pan, zoomTo } = primodium.api(Scenes.Starmap).camera;
              const asteroid = Position.get(player)?.parent;

              Send.setDestination(asteroid);
              pan(Send.getDestinationCoord() ?? { x: 0, y: 0 });
              zoomTo(1);
            }}
          >
            <FaCrosshairs />
          </Button>
        </div>
      </div>
    </SecondaryCard>
  );
};
