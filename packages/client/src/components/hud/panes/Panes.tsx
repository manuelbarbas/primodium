import { singletonEntity } from "@latticexyz/store-sync/recs";
import { Divider } from "src/components/core/Divider";
import { useSettingsStore } from "src/game/stores/SettingsStore";
import { components } from "src/network/components";
import { Account } from "src/network/components/clientComponents";
import { Join } from "../../core/Join";
import { Tabs } from "../../core/Tabs";
import { Leaderboard } from "./Leaderboard";
import { Objectives } from "./Objectives";

export const Panes: React.FC = () => {
  const playerAstroid = components.Home.use()?.asteroid;
  const player = Account.use(undefined, {
    value: singletonEntity,
  }).value;
  const [newPlayer, setNewPlayer] = useSettingsStore((state) => [state.newPlayer, state.setNewPlayer]);

  return (
    <Tabs
      className="flex gap-2 h-[25rem] pointer-events-auto"
      defaultIndex={newPlayer ? 4 : -1}
      onChange={() => setNewPlayer(false)}
    >
      {/* <Tabs.Pane index={0} className="w-96">
        <Outgoingfleets user={player ?? SingletonID} />
      </Tabs.Pane>
      <Tabs.Pane index={1} className="w-96">
        <Reinforcementfleets user={player ?? SingletonID} />
      </Tabs.Pane>
      <Tabs.Pane index={2} className="w-96">
        <HostileFleets spacerock={playerAstroid ?? SingletonID} />
      </Tabs.Pane>
      <Tabs.Pane index={3} className="w-96">
        <BattleReports />
      </Tabs.Pane>*/}
      <Tabs.Pane index={4} className="w-96">
        <Objectives />
      </Tabs.Pane>
      {/*<Tabs.Pane index={5} className="w-96">
        <OwnedMotherlodes />
    </Tabs.Pane> */}
      <Tabs.Pane index={6} className="w-96">
        <Leaderboard />
      </Tabs.Pane>
      {/* <Tabs.Pane index={7} className="w-96">
        <Settings />
      </Tabs.Pane> */}
      <div className="flex flex-col gap-2">
        {/* <div>
          <Join direction="vertical" className="z-10 border-secondary">
            <Tabs.IconButton
              index={0}
              imageUri="/img/icons/outgoingicon.png"
              text="Outgoing Fleets"
              hideText
              tooltipText="Outgoing Fleets"
              tooltipDirection="left"
            />
            <Tabs.IconButton
              index={1}
              imageUri="/img/icons/reinforcementicon.png"
              text="Reinforcements"
              hideText
              tooltipText="Reinforcements"
              tooltipDirection="left"
            />
            <Tabs.IconButton
              index={2}
              imageUri="/img/icons/attackicon.png"
              hideText
              text="Attacking Fleets"
              tooltipText="Attacking Fleets"
              tooltipDirection="left"
            />
            <Tabs.IconButton
              index={3}
              imageUri="/img/icons/reportsicon.png"
              hideText
              text="Battle Reports"
              tooltipDirection="left"
              tooltipText="Battle Reports"
            />
          </Join>
        </div> */}

        <Divider />
        <Join direction="vertical" className="z-10 border-secondary">
          {/* <Tabs.IconButton
            index={4}
            imageUri="/img/icons/objectiveicon.png"
            hideText
            text="Objectives"
            tooltipText="Objectives"
            tooltipDirection="left"
          />
          <Tabs.IconButton
            index={5}
            imageUri="/img/icons/asteroidicon.png"
            text="Owned Asteroids"
            hideText
            tooltipDirection="left"
            tooltipText="Owned Motherlodes"
          /> */}
          <Tabs.IconButton
            index={6}
            imageUri="/img/icons/leaderboardicon.png"
            hideText
            text="Leaderboard"
            tooltipText="Leaderboard"
            tooltipDirection="left"
          />
          {/* <Tabs.IconButton
            index={7}
            imageUri="/img/icons/settingsicon.png"
            hideText
            text="Settings"
            tooltipText="Settings"
            tooltipDirection="left"
          /> */}
        </Join>
      </div>
    </Tabs>
  );
};
