import { EntityID } from "@latticexyz/recs";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Hangar } from "src/network/components/clientComponents";
import { BlockIdToKey } from "src/util/constants";
import { getUnitStats } from "src/util/trainUnits";

export const UnitBreakdown: React.FC<{ asteroid: EntityID }> = ({
  asteroid,
}) => {
  const [showUnitBreakdown, setShowUnitBreakdown] = useState(false);

  function toggleShowUnitBreakdown() {
    setShowUnitBreakdown((prevShowUnitBreakdown) => !prevShowUnitBreakdown);
  }
  const rawUnits = Hangar.use(asteroid);

  const units = rawUnits?.units.map((unit, i) => ({
    type: unit,
    count: rawUnits.counts[i],
  }));
  return (
    <AnimatePresence>
      {showUnitBreakdown && (
        <motion.div
          key="unit-breakdown"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          exit={{ scaleY: 0 }}
          className=" bg-gray-900 z-[999] w-full border border-cyan-600 text-xs min-h-[5rem]"
        >
          <table className="min-w-full">
            <thead className="border-b border-cyan-400">
              <tr className="font-bold text-center [&>*]:border-l [&>*]:border-cyan-400">
                <th>Name</th>
                <th>Count</th>
                <th>Attack</th>
                <th>Defense</th>
                <th>Mining</th>
                <th>Cargo</th>
              </tr>
            </thead>
            <tbody className="text-center">
              {units?.map((unit, index) => {
                const name = BlockIdToKey[unit.type];
                const stats = getUnitStats(unit.type);
                return (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-slate-800/70" : ""}
                  >
                    <td>{name}</td>
                    <td>{unit.count}</td>
                    <td>{stats.ATK}</td>
                    <td>{stats.DEF}</td>
                    <td>{stats.MIN}</td>
                    <td>{stats.CRG}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>
      )}
      <motion.button
        layout
        className="flex gap-1 items-center absolute -bottom-5 right-0 text-xs bg-slate-900/90"
        disabled={!units}
        onClick={() => toggleShowUnitBreakdown()}
      >
        {!units
          ? "no units"
          : !showUnitBreakdown
          ? "+ show unit breakdown"
          : "- hide unit breakdown"}
      </motion.button>
    </AnimatePresence>
  );
};
