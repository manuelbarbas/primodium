import { useState } from "react";
import { AddressDisplay } from "src/components/hud/AddressDisplay";
import { components } from "src/network/components";
import { entityToAddress } from "src/util/common";
import { formatEther } from "viem";

export const PlayerBalances = ({ className }: { className?: string }) => {
  const players = components.WETHBalance.useAll().map((player) => ({
    entity: player,
    balance: components.WETHBalance.get(player)?.value ?? 0n,
  }));
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredPlayers = players.filter((player) => player.entity.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className={className + " overflow-auto"}>
      <div className="flex justify-between items-center font-medium p-2 bg-primary rounded-md">
        <div className="flex gap-10 items-center">
          <p>Address</p>
          <input
            type="text"
            className="p-1 text-sm bg-neutral rounded-md w-full disabled:opacity-50"
            placeholder="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <p>Balance (WETH)</p>
      </div>
      {filteredPlayers.map((player, i) => {
        return (
          <div
            key={`balance-${player.entity}`}
            className={`flex justify-between p-2 whitespace-nowrap border-b border-secondary ${
              i % 2 ? "bg-base-100" : ""
            }`}
          >
            <AddressDisplay address={entityToAddress(player.entity)} notShort />
            <p>{formatEther(player.balance)}</p>
          </div>
        );
      })}
    </div>
  );
};
