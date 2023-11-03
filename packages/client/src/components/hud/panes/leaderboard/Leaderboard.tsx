import { Tabs } from "src/components/core/Tabs";
import { Join } from "src/components/core/Join";
import { PlayerLeaderboard } from "./PlayerLeaderboard";
import { AllianceLeaderboard } from "./AllianceLeaderboard";

export const Leaderboard: React.FC = () => {
  return (
    <Tabs className="flex flex-col items-center gap-2 w-full h-full">
      <Join>
        <Tabs.Button index={0} className="btn-sm">
          Players
        </Tabs.Button>
        <Tabs.Button index={1} className="btn-sm">
          Alliances
        </Tabs.Button>
      </Join>

      <Tabs.Pane index={0} className="w-full h-full p-0 border-none">
        <PlayerLeaderboard />
      </Tabs.Pane>
      <Tabs.Pane index={1} className="w-full h-full p-0 border-none">
        <AllianceLeaderboard />
      </Tabs.Pane>
    </Tabs>
  );
};
