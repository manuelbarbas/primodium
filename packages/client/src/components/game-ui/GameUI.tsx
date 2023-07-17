import { primodium } from "@game/api";
import { KeybindActions } from "@game/constants";
import { useEffect } from "react";
import { useGameStore } from "../../store/GameStore";
import InfoBox from "../InfoBox";
import NotificationBox from "../NotificationBox";
import SideMenu from "../SideMenu";
import ResourceBox from "../resource-box/ResourceBox";
import TooltipBox from "../tooltip-box/TooltipBox";
import { Hotbar } from "./Hotbar";
import { TileInfo } from "./tile-info/TileInfo";

function GameUI() {
  const [showUI, toggleShowUI, isReady] = useGameStore((state) => [
    state.showUI,
    state.toggleShowUI,
    state.isReady,
  ]);

  useEffect(() => {
    if (!isReady) return;

    const listener = primodium.input.addListener(
      KeybindActions.ToggleUI,
      toggleShowUI
    );

    return () => {
      listener.dispose();
    };
  }, [isReady]);

  return (
    <div className="screen-container">
      <div className={`${showUI ? "" : "hidden pointer-events-none"}`}>
        <Hotbar />
        <TileInfo />
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
