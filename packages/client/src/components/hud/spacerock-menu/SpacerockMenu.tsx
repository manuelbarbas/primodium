import { useEffect } from "react";
import { Button } from "src/components/core/Button";
import { Navigator } from "src/components/core/Navigator";
import { Send } from "src/network/components/clientComponents";
import { getSpaceRockInfo } from "src/util/spacerock";
import { ESpaceRockType } from "src/util/web3/types";
import { Asteroid } from "./screens/Asteroid";
import { Motherlode } from "./screens/Motherlode";
import { SpacerockInfo } from "./screens/SpaceRockInfo";
import { SendFleet } from "./screens/SendFleet";
import { UnitSelection } from "./screens/UnitSelection";

export const SpacerockMenu: React.FC = () => {
  const selectedSpacerock = Send.useDestination()?.entity;

  useEffect(() => {
    const resetSendOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        Send.reset();
      }
    };

    document.addEventListener("keydown", resetSendOnEscape);

    return () => {
      document.removeEventListener("keydown", resetSendOnEscape);
    };
  }, []);

  if (!selectedSpacerock) return null;

  const spaceRockInfo = getSpaceRockInfo(selectedSpacerock);

  const renderScreen = () => {
    switch (spaceRockInfo.type) {
      case ESpaceRockType.Asteroid:
        return <Asteroid data={spaceRockInfo} />;
      case ESpaceRockType.Motherlode:
        return <Motherlode data={spaceRockInfo} />;
      default:
        return <></>;
    }
  };

  return (
    <Navigator initialScreen={selectedSpacerock} className="w-120">
      {/* <Navigator.Breadcrumbs /> */}

      {/* Initial Screen */}
      {renderScreen()}

      {/* Sub Screens */}
      <SpacerockInfo data={spaceRockInfo} />
      <SendFleet />
      <UnitSelection />
      {/* <Demolish building={selectedBuilding} />
      <BuildingInfo building={selectedBuilding} />
      <BuildQueue building={selectedBuilding} />
      <BuildDrone building={selectedBuilding} />
      <UpgradeDrones /> */}

      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2">
        <Button
          className="btn-square btn-sm font-bold border border-secondary"
          onClick={() => Send.reset()}
        >
          x
        </Button>
      </div>
    </Navigator>
  );
};
