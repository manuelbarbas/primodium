import { Tabs } from "../core/Tabs";

export const PlayerInfo: React.FC = () => {
  return (
    <Tabs>
      <Tabs.Button index={0}>Objectives</Tabs.Button>
      <Tabs.Button index={1}>Attacking Fleets</Tabs.Button>
      <Tabs.Button index={2}>Battle Reports</Tabs.Button>
      <Tabs.Pane index={0}>Fadad</Tabs.Pane>
    </Tabs>
  );
};
