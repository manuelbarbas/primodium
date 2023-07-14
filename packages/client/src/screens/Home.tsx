import InfoBox from "../components/InfoBox";
import NotificationBox from "../components/NotificationBox";
import SideMenu from "../components/SideMenu";
import ResourceBox from "../components/resource-box/ResourceBox";
import { useGameStore } from "../store/GameStore";

import TooltipBox from "src/components/tooltip-box/TooltipBox";
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
        <NotificationBox />
        <ResourceBox />
        <TooltipBox />
        <SideMenu />
      </div>
    </div>
  );
}
