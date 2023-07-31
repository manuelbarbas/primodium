import { useEffect } from "react";
import { isMobile } from "react-device-detect";
import { AnimatePresence, motion } from "framer-motion";

import { primodium } from "@game/api";
import { KeybindActions } from "@game/constants";

import { useGameStore } from "../../store/GameStore";
import { InfoBox } from "./InfoBox";
import { Camera } from "./Camera";
import Hotbar from "./hotbar/Hotbar";
import { TileInfo } from "./tile-info/TileInfo";
import NotificationBox from "./NotificationBox";
import { BrandingLabel } from "./BrandingLabel";
import { GameReady } from "src/network/components/clientComponents";
import { AiOutlineRotateRight } from "react-icons/ai";
import { useOrientation } from "src/hooks/useOrientation";
import { UserPanel } from "./user-panel/UserPanel";

function GameUI() {
  const [showUI, toggleShowUI] = useGameStore((state) => [
    state.showUI,
    state.toggleShowUI,
  ]);

  const gameReady = GameReady.use();
  const { isPortrait } = useOrientation();

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
          {isMobile && isPortrait && (
            <div className="fixed flex-col top-0 bottom-0 screen-container pointer-events-none bg-gray-700 z-[10000] flex items-center justify-center font-mono font-bold text-white text-lg space-y-4">
              <AiOutlineRotateRight size="64" />
              <p> Please play in landscape </p>
            </div>
          )}
          <div className="fixed top-0 bottom-0 screen-container pointer-events-none vignette opacity-20 mix-blend-overlay" />
          <BrandingLabel />
          <Camera />
          <AnimatePresence>
            {showUI && (
              <motion.div>
                <Hotbar />
                <TileInfo />
                <InfoBox />
                <NotificationBox />
                <UserPanel />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default GameUI;
