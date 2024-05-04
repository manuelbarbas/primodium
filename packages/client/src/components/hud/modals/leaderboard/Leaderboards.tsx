import { useMemo } from "react";
import { Button } from "src/components/core/Button";
import { EntityType } from "src/util/constants";
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
        leaderboard: <GrandLeaderboard key={"final"} alliance={alliance} />,
      },

      {
        name: "Wormhole",
        leaderboard: (
          <SubLeaderboard
            key={"wormhole"}
            leaderboard={alliance ? EntityType.AllianceWormholeLeaderboard : EntityType.PlayerWormholeLeaderboard}
            alliance={alliance}
          />
        ),
      },
      {
        name: "Shard",
        leaderboard: (
          <SubLeaderboard
            key={"Primodium"}
            leaderboard={alliance ? EntityType.AllianceShardLeaderboard : EntityType.PlayerShardLeaderboard}
            alliance={alliance}
          />
        ),
      },
    ],
    [alliance]
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
            {tab.name}
          </Button>
        ))}
      </div>
      {tabs.map((tab) => (tab.name === activeTab ? tab.leaderboard : null))}
    </div>
  );
};
