import InfoBox from "../components/InfoBox";
import ResourceBox from "../components/resource-box/ResourceBox";
import SideMenu from "../components/SideMenu";
import TooltipBox from "../components/TooltipBox";
import ErrorBox from "../components/ErrorBox";
import { useGameStore } from "../store/GameStore";

import LeafletMap from "./LeafletMap";

export default function Home() {
  const [showUI] = useGameStore((state) => [state.showUI]);
  return (
    <div className="screen-container">
      <div className="leaflet-container">
        <LeafletMap />
      </div>
      <div className={`${showUI ? "" : "hidden pointer-events-none"}`}>
        <InfoBox />
        <ErrorBox />
        <ResourceBox />
        <TooltipBox />
        <SideMenu />
      </div>
    </div>
  );
}
