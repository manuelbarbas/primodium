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
        name: "Grand",
        leaderboard: (
          <GrandLeaderboard
            key={"grand"}
            leaderboard={alliance ? EntityType.AllianceGrandLeaderboard : EntityType.PlayerGrandLeaderboard}
          />
        ),
      },
      {
        name: "Primodium",
        leaderboard: (
          <SubLeaderboard
            key={"Primodium"}
            leaderboard={alliance ? EntityType.AlliancePrimodiumLeaderboard : EntityType.PlayerPrimodiumLeaderboard}
          />
        ),
      },
      {
        name: "Wormhole",
        leaderboard: (
          <SubLeaderboard
            key={"wormhole"}
            leaderboard={alliance ? EntityType.AllianceWormholeLeaderboard : EntityType.PlayerWormholeLeaderboard}
          />
        ),
      },
    ],
    [alliance]
  );

  return (
    <div className="w-full h-full flex justify-center flex-col">
      <div className="flex space-x-1 justify-center p-1">
        {tabs.map((tab) => (
          <Button selected={activeTab === tab.name} key={tab.name} onClick={() => setActiveTab(tab.name)}>
            {tab.name}
          </Button>
        ))}
      </div>
      {tabs.map((tab) => (tab.name === activeTab ? tab.leaderboard : null))}
    </div>
  );
};
