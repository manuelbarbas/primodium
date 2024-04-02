import { Button } from "src/components/core/Button";
import { EntityType } from "src/util/constants";

import { GrandLeaderboard } from "./GrandLeaderboard";
import { SubLeaderboard } from "./SubLeaderboard";

export const AllianceLeaderboards = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) => {
  const tabs = [
    {
      name: "Grand",
      leaderboard: <GrandLeaderboard key={"grand"} leaderboard={EntityType.AllianceGrandLeaderboard} alliance />,
    },
    {
      name: "Conquest",
      leaderboard: <SubLeaderboard key={"conquest"} leaderboard={EntityType.AllianceConquestLeaderboard} alliance />,
    },
    {
      name: "Extraction",
      leaderboard: (
        <SubLeaderboard key={"extraction"} leaderboard={EntityType.AllianceExtractionLeaderboard} alliance />
      ),
    },
  ];

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
