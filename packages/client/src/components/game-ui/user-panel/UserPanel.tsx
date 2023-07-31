import { EntityID } from "@latticexyz/recs";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import ClaimButton from "src/components/action/ClaimButton";
import { GameButton } from "src/components/shared/GameButton";
import { useMainBaseCoord } from "src/hooks";
import { MainBase, Level } from "src/network/components/chainComponents";
import { useGameStore } from "src/store/GameStore";
import { PanelButton } from "./PanelButton";
import { Starmap } from "./panes/starmap/Starmap";
import { FullStarmap } from "./panes/starmap/StarmapModal";
import { AllResourceLabels } from "./panes/inventory/AllResourceLabels";
import { AllPassiveResourceLabels } from "./panes/utilities/AllPassiveResourceLabels";

export const UserPanel = () => {
  const crtEffect = useGameStore((state) => state.crtEffect);
  const [menuIndex, setMenuIndex] = useState<number | null>(null);
  const [showFullStarmap, setShowFullStarmap] = useState<boolean>(false);

  const mainBaseCoord = useMainBaseCoord();
  const mainBase = MainBase.use(undefined, { value: "-1" as EntityID }).value;

  const level = Level.use(mainBase);
  useEffect(() => {
    if (Level === undefined) return;

    setMenuIndex(0);
  }, [level]);

  return (
    <div
      style={{ filter: "drop-shadow(2px 2px 0 rgb(20 184 166 / 0.4))" }}
      className="flex fixed top-8 right-8 items-center font-mono text-white "
    >
      <motion.div
        initial={{ opacity: 0, scale: 0, x: 200 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0, x: 200 }}
      >
        <div className={`${crtEffect ? "skew-x-1 skew-y-1" : ""}`}>
          <motion.div layout="position" className="flex justify-center">
            <PanelButton
              name="Inventory"
              icon="/img/icons/inventoryicon.png"
              active={menuIndex === 0}
              onClick={() => setMenuIndex(menuIndex === 0 ? null : 0)}
            />
            <PanelButton
              name="Utilities"
              icon="/img/icons/utilitiesicon.png"
              active={menuIndex === 1}
              onClick={() => setMenuIndex(menuIndex === 1 ? null : 1)}
            />
            <PanelButton
              name="Star Map"
              icon="/img/icons/utilitiesicon.png"
              active={menuIndex === 2}
              onClick={() => setMenuIndex(menuIndex === 2 ? null : 2)}
            />
          </motion.div>

          {menuIndex === 0 && (
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              exit={{ scale: 0 }}
              className=" bg-gray-900 z-[999] w-full border border-cyan-600 p-2 text-xs min-h-[5rem]"
            >
              <AllResourceLabels />
            </motion.div>
          )}

          {menuIndex === 1 && (
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              exit={{ scale: 0 }}
              className=" bg-gray-900 z-[999] w-full border border-cyan-600 p-2 text-xs min-h-[5rem]"
            >
              <AllPassiveResourceLabels />
            </motion.div>
          )}

          {menuIndex === 2 && (
            <motion.div
              id="starmap"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              exit={{ scale: 0 }}
              className=" bg-gray-900 z-[999] w-96 border border-cyan-600 p-2 text-xs h-56"
            >
              <Starmap gridSize={16} />
              <FullStarmap
                show={showFullStarmap}
                onClose={() => setShowFullStarmap(false)}
              />
            </motion.div>
          )}

          {menuIndex === 0 && (
            <div className="flex justify-center">
              {mainBaseCoord !== undefined && (
                <ClaimButton id="claim-button" coords={mainBaseCoord} />
              )}
            </div>
          )}

          {menuIndex === 2 && (
            <GameButton
              className="m-2"
              color="bg-amber-600"
              onClick={() => setShowFullStarmap(true)}
            >
              <p className="p-1 px-3">View Starmap</p>
            </GameButton>
          )}
        </div>
      </motion.div>
    </div>
  );
};
