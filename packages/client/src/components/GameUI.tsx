import InfoBox from "./InfoBox";
import ResourceBox from "./resource-box/ResourceBox";
import SideMenu from "./SideMenu";
import TooltipBox from "./TooltipBox";
import NotificationBox from "./NotificationBox";
import { useGameStore } from "../store/GameStore";

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
        <div className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center pointer-events-none text-white">
          +
        </div>
      </div>
    </div>
  );
}

export default GameUI;
