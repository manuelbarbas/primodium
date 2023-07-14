import { useGameStore } from "../store/GameStore";
import InfoBox from "./InfoBox";
import NotificationBox from "./NotificationBox";
import SideMenu from "./SideMenu";
import ResourceBox from "./resource-box/ResourceBox";
import TooltipBox from "./tooltip-box/TooltipBox";

function GameUI() {
  const [showUI] = useGameStore((state) => [state.showUI]);
  return (
    <div className="screen-container">
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

export default GameUI;
