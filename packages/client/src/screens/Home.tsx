import InfoBox from "../components/InfoBox";
import ResourceBox from "../components/resource-box/ResourceBox";
import SideMenu from "../components/SideMenu";
import TooltipBox from "../components/TooltipBox";
import { Tour } from "../components/tour/Tour";

import LeafletMap from "./LeafletMap";

export default function Home() {
  return (
    <div className="screen-container">
      <Tour />
      <div className="leaflet-container">
        <LeafletMap />
      </div>
      <InfoBox />
      <ResourceBox />
      <TooltipBox />
      <SideMenu />
    </div>
  );
}
