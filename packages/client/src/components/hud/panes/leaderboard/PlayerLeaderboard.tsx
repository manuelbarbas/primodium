import { Entity } from "@latticexyz/recs";
import { useEffect, useMemo, useState } from "react";
import { FixedSizeList as List } from "react-window";

import { primodium } from "@game/api";
import { Scenes } from "@game/constants";
import { FaCrosshairs, FaEnvelope } from "react-icons/fa";
import { Button } from "src/components/core/Button";
import { SecondaryCard } from "src/components/core/Card";
import { getLinkedAddress } from "src/util/web2/getLinkedAddress";
import { linkAddress } from "src/util/web2/linkAddress";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { getAllianceName } from "src/util/alliance";
import { EAllianceRole } from "contracts/config/enums";
import { invite } from "src/util/web3/contractCalls/alliance";
import { TransactionQueueMask } from "src/components/shared/TransactionQueueMask";
import { hashEntities } from "src/util/encode";
import { TransactionQueueType } from "src/util/constants";
import { Hex } from "viem";
import { LinkedAddressDisplay } from "../../LinkedAddressDisplay";

export const PlayerLeaderboard = () => {
  const network = useMud().network;
  const address = network.address;
  const data = components.Leaderboard.use();
  const [linkedAddress, setLinkedAddress] = useState<Hex | null>(null);
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
    <div className="flex flex-col items-center w-full h-full text-xs pointer-events-auto">
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
      <SecondaryCard className="w-full overflow-y-auto border border-slate-700 rounded-md p-2 bg-slate-800">
        {address && (
          <div className="grid grid-cols-6 w-full items-center">
            <div>{data.playerRank}.</div>
            <div className="col-span-5 flex justify-between">
              <p className="bg-rose-800 px-2 rounded-md flex items-center">You</p>
              <Button className="btn-xs btn-secondary" onClick={() => linkAddress(network)}>
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

const LeaderboardItem = ({ player, index, score }: { player: Entity; index: number; score: number }) => {
  const network = useMud().network;
  const playerEntity = network.playerEntity;
  const role = components.PlayerAlliance.use(playerEntity)?.role ?? EAllianceRole.Member;
  const alliance = components.PlayerAlliance.use(playerEntity)?.alliance as Entity | undefined;
  const playerAlliance = components.PlayerAlliance.use(player)?.alliance as Entity | undefined;

  const playerAllianceDisplay = useMemo(() => {
    if (playerAlliance) return getAllianceName(playerAlliance, true);
    else return undefined;
  }, [playerAlliance]);

  return (
    <SecondaryCard
      className={`grid grid-cols-7 w-full border rounded-md border-cyan-800 p-2 bg-slate-800 bg-gradient-to-br from-transparent to-bg-slate-900/30 items-center h-10 ${
        player === playerEntity ? "border-success" : ""
      }`}
    >
      <div>{index + 1}.</div>
      <div className="col-span-6 flex justify-between items-center">
        <div className="flex gap-1">
          {playerAllianceDisplay && <b className="text-accent">[{playerAllianceDisplay}]</b>}
          <LinkedAddressDisplay entity={player} />
        </div>
        <div className="flex items-center gap-1">
          <p className="font-bold rounded-md bg-cyan-700 px-2 ">{score.toLocaleString()}</p>
          <Button
            className="btn-xs flex border border-secondary"
            onClick={async () => {
              const mapOpen = components.MapOpen.get(undefined, {
                value: false,
              }).value;

              if (!mapOpen) {
                const { transitionToScene } = primodium.api().scene;

                await transitionToScene(Scenes.Asteroid, Scenes.Starmap);
                components.MapOpen.set({ value: true });
              }

              const { pan, zoomTo } = primodium.api(Scenes.Starmap).camera;
              const asteroid = components.Home.get(player)?.asteroid as Entity;

              components.Send.setDestination(asteroid);
              pan(components.Send.getDestinationCoord() ?? { x: 0, y: 0 });
              zoomTo(1);
            }}
          >
            <FaCrosshairs />
          </Button>
          {role <= EAllianceRole.CanInvite && player !== playerEntity && playerAlliance !== alliance && (
            <TransactionQueueMask queueItemId={hashEntities(TransactionQueueType.Invite, player)}>
              <Button
                className="btn-xs flex border border-secondary"
                tooltip="Invite"
                tooltipDirection="left"
                onClick={async () => {
                  invite(player, network);
                }}
              >
                <FaEnvelope />
              </Button>
            </TransactionQueueMask>
          )}
        </div>
      </div>
    </SecondaryCard>
  );
};
