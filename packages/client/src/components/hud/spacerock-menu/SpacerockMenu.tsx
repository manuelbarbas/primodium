import { singletonEntity } from "@latticexyz/store-sync/recs";
import { ERock } from "contracts/config/enums";
import { useEffect } from "react";
import { Button } from "src/components/core/Button";
import { Navigator } from "src/components/core/Navigator";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { getSpaceRockInfo } from "src/util/spacerock";
import { Asteroid } from "./screens/Asteroid";
import { Motherlode } from "./screens/Motherlode";
import { SendFleet } from "./screens/SendFleet";
import { SpacerockInfo } from "./screens/SpaceRockInfo";
import { StationedUnits } from "./screens/StationedUnits";
import { UnitSelection } from "./screens/UnitSelection";
import { Card } from "src/components/core/Card";
import { Resources } from "./widgets/resources/Resources";

export const SpacerockMenu: React.FC = () => {
  // const playerEntity = useMud().network.playerEntity;
  // const selectedSpacerock = components.Send.use()?.destination;

  // useEffect(() => {
  //   const resetSendOnEscape = (event: KeyboardEvent) => {
  //     if (event.key === "Escape") {
  //       components.Send.reset(playerEntity);
  //     }
  //   };

  //   document.addEventListener("keydown", resetSendOnEscape);

  //   return () => {
  //     document.removeEventListener("keydown", resetSendOnEscape);
  //   };
  // }, []);

  // const spaceRockInfo = getSpaceRockInfo(selectedSpacerock ?? singletonEntity);
  // if (!selectedSpacerock) return null;

  // const RenderScreen = () => {
  //   switch (spaceRockInfo.type) {
  //     case ERock.Asteroid:
  //       return <Asteroid data={spaceRockInfo} />;
  //     case ERock.Motherlode:
  //       return <Motherlode data={spaceRockInfo} />;
  //     default:
  //       return <></>;
  //   }
  // };

  return (
    <div className="w-screen px-2 flex justify-center">
      <div className="w-fit">
        <Card className="w-full border-b-0 rounded-x-none rounded-b-none">
          <Resources />
        </Card>
      </div>
    </div>
  );
};
