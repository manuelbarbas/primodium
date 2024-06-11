import { useState } from "react";
import { Join } from "src/components/core/Join";
import { Tabs } from "src/components/core/Tabs";
import { Leaderboards } from "./Leaderboards";
import { Keys } from "@/util/constants";
import { useSyncStatus } from "@/hooks/useSyncStatus";
import { LoadingScreen } from "./LoadingScreen";
import { ErrorScreen } from "./ErrorScreen";

export const LeaderboardScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Final");
  const { loading, error } = useSyncStatus(Keys.SECONDARY);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen />;
  return (
    <Tabs className="flex flex-col items-center gap-2 w-full h-full">
      <Join className="border border-secondary/25">
        <Tabs.Button index={0} variant="neutral" size="content">
          Alliances
        </Tabs.Button>
        <Tabs.Button index={1} variant="neutral" size="content">
          Players
        </Tabs.Button>
      </Join>

      <Tabs.Pane index={0} className="w-full h-full p-0 border-none">
        <Leaderboards alliance activeTab={activeTab} setActiveTab={setActiveTab} />
      </Tabs.Pane>
      <Tabs.Pane index={1} className="w-full h-full p-0 border-none">
        <Leaderboards activeTab={activeTab} setActiveTab={setActiveTab} />
      </Tabs.Pane>
    </Tabs>
  );
};
