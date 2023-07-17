import { useEffect } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { primodium } from "@game/api";
import { KeybindActions } from "@game/constants";
import { useMud } from "src/context/MudContext";
import { useGameStore } from "../../store/GameStore";

import ResourceBox from "../resource-box/ResourceBox";
import SideMenu1 from "../SideMenu";

import TooltipBox from "../TooltipBox";
import NotificationBox from "../NotificationBox";

import { Inventory } from "./Inventory";
import { Hotbar } from "./Hotbar";
import { TileInfo } from "./TileInfo";
import { BrandingLabel } from "./BrandingLabel";
import { Camera } from "./Camera";
import { InfoBox } from "./InfoBox";

function GameUI() {
  const [showUI, toggleShowUI] = useGameStore((state) => [
    state.showUI,
    state.toggleShowUI,
  ]);

  const network = useMud();
  const gameReady = primodium.hooks.useGameReady(network);

  useEffect(() => {
    if (!gameReady) return;

    const listener = primodium.input.addListener(
      KeybindActions.ToggleUI,
      toggleShowUI
    );

    return () => {
      listener.dispose();
    };
  }, [gameReady]);

  return (
    <div>
      {gameReady && (
        <div className="screen-container">
          {/* Vignette */}
          <div className="fixed top-0 bottom-0 screen-container vignette pointer-events-none opacity-20 mix-blend-overlay" />
          {/* <BrandingLabel /> */}
          <Camera />
          <AnimatePresence>
            {showUI && (
              <motion.div>
                <Hotbar />
                <TileInfo />
                <InfoBox />
                <NotificationBox />
                {/* <ResourceBox /> */}
                {/* <TooltipBox /> */}

                {/* <SideMenu1 /> */}
                <Inventory />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default GameUI;
