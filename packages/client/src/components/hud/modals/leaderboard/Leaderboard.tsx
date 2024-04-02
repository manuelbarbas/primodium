import { useState } from "react";
import { Join } from "src/components/core/Join";
import { Tabs } from "src/components/core/Tabs";
import { AllianceLeaderboards } from "./AllianceLeaderboard";
import { PlayerLeaderboards } from "./PlayerLeaderboards";

export const Leaderboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Grand");
  return (
    <Tabs className="flex flex-col items-center gap-2 w-full h-full">
      <Join className="border border-secondary/25">
        <Tabs.Button showActive index={0} className="btn-sm">
          Alliances
        </Tabs.Button>
        <Tabs.Button showActive index={1} className="btn-sm">
          Players
        </Tabs.Button>
      </Join>

      <Tabs.Pane index={0} className="w-full h-full p-0 border-none">
        <AllianceLeaderboards activeTab={activeTab} setActiveTab={setActiveTab} />
      </Tabs.Pane>
      <Tabs.Pane index={1} className="w-full h-full p-0 border-none">
        <PlayerLeaderboards activeTab={activeTab} setActiveTab={setActiveTab} />
      </Tabs.Pane>
    </Tabs>
  );
};
