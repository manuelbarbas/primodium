import { Join } from "../core/Join";
import { Tabs } from "../core/Tabs";

export const Fleets: React.FC = () => {
  return (
    <Tabs>
      <Join className="border border-primary">
        <Tabs.IconButton
          index={0}
          imageUri="/img/icons/transporticon.png"
          text="Outgoing Fleets"
        />
        <Tabs.IconButton
          index={1}
          imageUri="/img/icons/attackaircraft.png"
          text="Reinforcements"
        />
      </Join>
      <Tabs.Pane index={0}>Fadad</Tabs.Pane>
    </Tabs>
  );
};
