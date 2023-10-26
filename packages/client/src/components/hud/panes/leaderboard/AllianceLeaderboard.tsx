import { ComponentValue, Entity } from "@latticexyz/recs";
import { getAddress } from "ethers/lib/utils.js";
import { useEffect, useMemo, useState } from "react";
import { FixedSizeList as List } from "react-window";
import { FaEnvelope, FaUserPlus } from "react-icons/fa";
import { Button } from "src/components/core/Button";
import { SecondaryCard } from "src/components/core/Card";
import { entityToAddress, shortenAddress } from "src/util/common";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { Tooltip } from "src/components/core/Tooltip";

export const AllianceLeaderboard = () => {
  const mud = useMud();
  const address = mud.network.address;
  const data = components.Leaderboard.use();

  if (!data || !address) return null;

  return (
    <div className="flex flex-col items-center w-full text-xs pointer-events-auto">
      <List height={285} width="100%" itemCount={data.players.length} itemSize={47} className="scrollbar">
        {({ index, style }) => {
          const player = data.players[index];
          const score = data.scores[index];
          return (
            <div style={style} className="pr-2">
              <LeaderboardItem key={index} player={player} index={index} score={score} />
            </div>
          );
        }}
      </List>
      <hr className="w-full border-t border-cyan-800 my-2" />
      <PlayerInfo data={data} />
    </div>
  );
};

const LeaderboardItem = ({ player, index, score }: { player: Entity; index: number; score: number }) => {
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
      return shortenAddress(entityToAddress(fetchedExternalWallet.address));
    } else {
      return shortenAddress(entityToAddress(player));
    }
  }, [fetchedExternalWallet, player]);

  return (
    <SecondaryCard className="grid grid-cols-6 w-full border rounded-md border-cyan-800 p-2 bg-slate-800 bg-gradient-to-br from-transparent to-bg-slate-900/30 items-center">
      <div>{index + 1}.</div>
      <div className="col-span-5 flex justify-between items-center">
        <div>{playerDisplay}</div>
        <div className="flex items-center gap-1">
          <p className="font-bold rounded-md bg-cyan-700 px-2 ">{score.toLocaleString()}</p>
          <Tooltip text="Join" direction="left">
            <Button
              className="btn-xs flex border border-secondary"
              onClick={async () => {
                console.log("join");
              }}
            >
              <FaUserPlus />
            </Button>
          </Tooltip>
        </div>
      </div>
    </SecondaryCard>
  );
};

const PlayerInfo = ({ data }: { data: ComponentValue<typeof components.Leaderboard.schema> }) => {
  const playerEntity = useMud().network.playerEntity;

  const allianceEntity = components.PlayerAlliance.use(playerEntity)?.alliance as Entity | undefined;
  // const alliance = components.Alliance.use(allianceEntity);

  if (!allianceEntity) {
    return (
      <SecondaryCard className="w-full overflow-y-auto border border-slate-700 rounded-md p-2 bg-slate-800">
        {
          <div className="grid grid-cols-6 w-full items-center gap-2">
            <Button className="btn-xs btn-secondary col-span-5">+ Create Alliance</Button>
            <Button className="btn-xs flex">
              <FaEnvelope /> <b>0</b>
            </Button>
          </div>
        }
      </SecondaryCard>
    );
  }

  return (
    <SecondaryCard className="w-full overflow-y-auto border border-slate-700 rounded-md p-2 bg-slate-800">
      {
        <div className="grid grid-cols-6 w-full items-center">
          <div>{data.playerRank}.</div>
          <div className="col-span-5 flex justify-between">
            <p className="bg-rose-800 px-2 rounded-md flex items-center">You</p>
            <Button className="btn-xs btn-secondary">+ Create Alliance</Button>
            <p className="font-bold rounded-md bg-cyan-700 px-2 flex items-center">
              {data.scores.length >= data.playerRank ? data.scores[data.playerRank - 1].toLocaleString() : 0}
            </p>
          </div>
        </div>
      }
    </SecondaryCard>
  );
};
