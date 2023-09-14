import { Account } from "src/network/components/clientComponents";
import { Join } from "../../core/Join";
import { Tabs } from "../../core/Tabs";
import { Outgoingfleets } from "./OutgoingFleets";
import { SingletonID } from "@latticexyz/network";
import { Reinforcementfleets } from "./ReinforcementFleet";

export const Fleets: React.FC = () => {
  const player = Account.use()?.value;

  return (
    <Tabs className="flex" defaultIndex={undefined}>
      <Tabs.Pane index={0}>
        <Outgoingfleets user={player ?? SingletonID} />
      </Tabs.Pane>
      <Tabs.Pane index={1}>
        <Reinforcementfleets user={player ?? SingletonID} />
      </Tabs.Pane>
      <Join direction="vertical">
        <Tabs.IconButton
          index={0}
          imageUri="/img/icons/transporticon.png"
          text="Outgoing Fleets"
          hideText
          tooltipDirection="left"
          tooltipText="Outgoing Fleets"
        />
        <Tabs.IconButton
          index={1}
          imageUri="/img/icons/attackaircraft.png"
          text="Reinforcements"
          hideText
          tooltipDirection="left"
          tooltipText="Reinforcements"
        />
        <Tabs.IconButton
          index={2}
          imageUri="/img/spacerocks/motherlodes/motherlode_titanium_large.png"
          text="Owned Asteroids"
          hideText
          tooltipDirection="left"
          tooltipText="Owned Asteroids"
        />
      </Join>
    </Tabs>
  );
};
