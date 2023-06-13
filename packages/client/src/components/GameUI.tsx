import InfoBox from "./InfoBox";
import ResourceBox from "./resource-box/ResourceBox";
import SideMenu from "./SideMenu";
import TooltipBox from "./TooltipBox";
import NotificationBox from "./NotificationBox";
import { useGameStore } from "../store/GameStore";

function GameUI({ children }: { children?: React.ReactNode[] }) {
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
