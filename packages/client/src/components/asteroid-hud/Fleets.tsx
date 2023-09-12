import { Tabs } from "../core/Tabs";

export const Fleets: React.FC = () => {
  return (
    <Tabs>
      <Tabs.Button index={0}>Outgoing</Tabs.Button>
      <Tabs.Button index={1}>Reinforcements</Tabs.Button>
      <Tabs.Pane index={0}>Fadad</Tabs.Pane>
    </Tabs>
  );
};
