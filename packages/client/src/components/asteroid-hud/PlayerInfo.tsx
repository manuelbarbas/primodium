import { Join } from "../core/Join";
import { Tabs } from "../core/Tabs";

export const PlayerInfo: React.FC = () => {
  return (
    <Tabs>
      <Join>
        <Tabs.IconButton
          index={0}
          imageUri="/img/icons/debugicon.png"
          text="Objectives"
        />
        <Tabs.IconButton
          index={1}
          imageUri="/img/icons/attackaircraft.png"
          text="Attacking Fleets"
        />
        <Tabs.IconButton
          index={2}
          imageUri="/img/icons/weaponryicon.png"
          text="Battle Reports"
        />
        <Tabs.IconButton
          index={3}
          imageUri="/img/icons/settingsicon.png"
          text="Leaderboard"
        />
        <Tabs.IconButton
          index={4}
          imageUri="/img/icons/settingsicon.png"
          text="Settings"
        />
      </Join>
      <Tabs.Pane index={0}>Fadad</Tabs.Pane>
    </Tabs>
  );
};
