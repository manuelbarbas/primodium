import { SingletonID } from "@latticexyz/network";
import { ActiveAsteroid } from "src/network/components/clientComponents";
import { Join } from "../../core/Join";
import { Tabs } from "../../core/Tabs";
import { BattleReports } from "./battle-reports/BattleReports";
import { HostileFleets } from "./hostile-fleets/HostileFleets";
import { Leaderboard } from "./Leaderboard";
import { Settings } from "./Settings";

export const PlayerInfo: React.FC = () => {
  const playerAstroid = ActiveAsteroid.use()?.value;

  return (
    <Tabs className="flex space-y-0 gap-1" defaultIndex={-1}>
      <Join direction="vertical" className="z-10">
        <Tabs.IconButton
          index={0}
          imageUri="/img/icons/debugicon.png"
          hideText
          text="Objectives"
          tooltipText="Objectives"
        />
        <Tabs.IconButton
          index={1}
          imageUri="/img/icons/attackaircraft.png"
          hideText
          text="Attacking Fleets"
          tooltipText="Attacking Fleets"
        />
        <Tabs.IconButton
          index={2}
          imageUri="/img/icons/weaponryicon.png"
          hideText
          text="Battle Reports"
          tooltipText="Battle Reports"
        />
        <Tabs.IconButton
          index={3}
          imageUri="/img/icons/settingsicon.png"
          hideText
          text="Leaderboard"
          tooltipText="Leaderboard"
        />
        <Tabs.IconButton
          index={4}
          imageUri="/img/icons/settingsicon.png"
          hideText
          text="Settings"
          tooltipText="Settings"
        />
      </Join>
      <Tabs.Pane index={0}>Objectives</Tabs.Pane>
      <Tabs.Pane index={1}>
        <HostileFleets spacerock={playerAstroid ?? SingletonID} />
      </Tabs.Pane>
      <Tabs.Pane index={2}>
        <BattleReports />
      </Tabs.Pane>
      <Tabs.Pane index={3}>
        <Leaderboard />
      </Tabs.Pane>
      <Tabs.Pane index={4}>
        <Settings />
      </Tabs.Pane>
    </Tabs>
  );
};
