import { EntityID } from "@latticexyz/recs";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useAccount } from "src/hooks";
import { MainBase, Level } from "src/network/components/chainComponents";
import { useGameStore } from "src/store/GameStore";
import { PanelButton } from "./PanelButton";
import { UserFleets } from "src/components/asteroid-ui/user-panel/panes/fleets/UserFleets";

export const UserPanel = () => {
  const crtEffect = useGameStore((state) => state.crtEffect);
  const { address } = useAccount();
  const [menuIndex, setMenuIndex] = useState<number | null>(2);

  const mainBase = MainBase.use(address, { value: "-1" as EntityID }).value;

  const level = Level.use(mainBase);

  useEffect(() => {
    if (Level === undefined) return;

    setMenuIndex(0);
  }, [level]);

  return (
    <div className="flex absolute top-0 right-0 items-center font-mono text-white pointer-events-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0, x: 200 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0, x: 200 }}
      >
        <div className={`${crtEffect ? "skew-x-1 skew-y-1" : ""} w-80`}>
          <motion.div layout="position" className="flex justify-end gap-2 mb-2">
            <PanelButton
              name="Fleets"
              icon="/img/icons/attackaircraft.png"
              active={menuIndex === 0}
              onClick={() => setMenuIndex(menuIndex === 0 ? null : 0)}
            />
          </motion.div>

          {menuIndex === 0 && (
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              exit={{ scale: 0 }}
              className="bg-gray-900 z-[999] w-full border rounded-md border-cyan-600 ring ring-cyan-900 p-2 text-xs"
            >
              <UserFleets user={address} />
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
