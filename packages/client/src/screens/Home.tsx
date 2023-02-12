import InfoBox from "../components/InfoBox";
import BuildingBox from "../components/BuildingBox";
import ResourceBox from "../components/ResourceBox";
import TooltipBox from "../components/TooltipBox";

import LeafletMap from "./LeafletMap";

import { MudRouterProps } from "../util/types";

export default function Home({ world, systems, components }: MudRouterProps) {
  return (
    <>
      <div className="leaflet-container">
        <LeafletMap world={world} systems={systems} components={components} />
      </div>
      <InfoBox />
      <ResourceBox />
      <BuildingBox />
      <TooltipBox />
    </>
  );
}
