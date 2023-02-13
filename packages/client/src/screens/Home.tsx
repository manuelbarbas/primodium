import { useEffect, useContext } from "react";
import InfoBox from "../components/InfoBox";
import ResourceBox from "../components/ResourceBox";
import SideMenu from "../components/SideMenu";
// import TooltipBox from "../components/TooltipBox";

import LeafletMap from "./LeafletMap";

import { MudRouterProps } from "../util/types";
import { SelectedTileContext } from "../context/SelectedTileContext";

export default function Home({ world, systems, components }: MudRouterProps) {
  const { selectedTile } = useContext(SelectedTileContext);

  useEffect(() => {
    console.log("Here is the map from home, tile changed.");
    console.log(selectedTile);
  }, [selectedTile]);

  return (
    <>
      <div className="leaflet-container">
        <LeafletMap world={world} systems={systems} components={components} />
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
