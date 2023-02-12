import { useState, useEffect } from "react";
import InfoBox from "../components/InfoBox";
import BuildingBox from "../components/BuildingBox";
import ResourceBox from "../components/ResourceBox";
import SideMenu from "../components/SideMenu";
// import TooltipBox from "../components/TooltipBox";

import LeafletMap from "./LeafletMap";

import { MudRouterProps } from "../util/types";
import { DisplayTile } from "../util/constants";

export default function Home({ world, systems, components }: MudRouterProps) {
  // Select tiles
  const [selectedTile, setSelectedTile] = useState({
    x: 0,
    y: 0,
  } as DisplayTile);

  useEffect(() => {
    console.log("Here is the map from home, tile changed.");
    console.log(selectedTile);
  }, [selectedTile]);

  return (
    <>
      <div className="leaflet-container">
        <LeafletMap
          world={world}
          systems={systems}
          components={components}
          selectedTile={selectedTile}
          setSelectedTile={setSelectedTile}
        />
      </div>
      <InfoBox />
      <ResourceBox />
      {/* <BuildingBox
        world={world}
        systems={systems}
        components={components}
        selectedTile={selectedTile}
      /> */}
      <SideMenu />
      {/* <TooltipBox /> */}
    </>
  );
}
