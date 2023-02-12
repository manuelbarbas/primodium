import { useCallback, useState, useEffect } from "react";
import InfoBox from "../components/InfoBox";
import BuildingBox from "../components/BuildingBox";
import ResourceBox from "../components/ResourceBox";
import TooltipBox from "../components/TooltipBox";

import LeafletMap from "./LeafletMap";

import { MudRouterProps } from "../util/types";
import { DisplayTile } from "../util/constants";

export default function Home({ world, systems, components }: MudRouterProps) {
  // Home should have the state of which tile is selected and child components associated with it.
  const executeTileAction = useCallback((tile: DisplayTile) => {
    console.log(tile);
  }, []);

  // Selected tile but local only to this component, for debugging purposes.
  const [selectedTile, setSelectedTile] = useState({
    x: null,
    y: null,
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
          executeTileAction={executeTileAction}
        />
      </div>
      <InfoBox />
      <ResourceBox />
      <BuildingBox />
      <TooltipBox />
    </>
  );
}
