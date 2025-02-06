import { useMemo } from "react";

import { InterfaceIcons, ResourceImages } from "@primodiumxyz/assets";
import { EntityType } from "@primodiumxyz/core";
import { Button } from "@/components/core/Button";

import { GrandLeaderboard } from "./GrandLeaderboard";
import { SubLeaderboard } from "./SubLeaderboard";

export const Leaderboards = ({
  activeTab,
  setActiveTab,
  alliance = false,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  alliance?: boolean;
}) => {
  const tabs = useMemo(
    () => [
      {
        name: "Final",
        icon: InterfaceIcons.Leaderboard,
        leaderboard: <GrandLeaderboard key={"final"} alliance={alliance} />,
      },

      {
        name: "Wormhole",
        icon: InterfaceIcons.Wormhole,
        leaderboard: (
          <SubLeaderboard
            key={"wormhole"}
            icon={InterfaceIcons.Wormhole}
            leaderboard={alliance ? EntityType.AllianceWormholeLeaderboard : EntityType.PlayerWormholeLeaderboard}
            alliance={alliance}
          />
        ),
      },
      {
        name: "Primodium",
        icon: ResourceImages.Primodium,
        leaderboard: (
          <SubLeaderboard
            key={"primodium"}
            icon={ResourceImages.Primodium}
            leaderboard={alliance ? EntityType.AllianceShardLeaderboard : EntityType.PlayerShardLeaderboard}
            alliance={alliance}
          />
        ),
      },
    ],
    [alliance],
  );

  return (
    <div className="w-full h-full flex justify-center flex-col bg-transparent p-2">
      <div className="flex space-x-1 justify-center p-1 relative">
        {tabs.map((tab) => (
          <Button
            size="content"
            variant="primary"
            selected={activeTab === tab.name}
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
          >
            <img src={tab.icon} className="w-6" />
            {tab.name}
          </Button>
        ))}
      </div>
      {tabs.map((tab) => (tab.name === activeTab ? tab.leaderboard : null))}
    </div>
  );
};
