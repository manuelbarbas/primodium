import InfoBox from "../components/InfoBox";
import ResourceBox from "../components/resource-box/ResourceBox";
import SideMenu from "../components/SideMenu";
import TooltipBox from "../components/TooltipBox";

import LeafletMap from "./LeafletMap";

export default function Home() {
  return (
    <>
      <div className="leaflet-container">
        <LeafletMap />
      </div>
      <InfoBox />
      <ResourceBox />
      <TooltipBox />
      <SideMenu />
    </>
  );
}
