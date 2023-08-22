import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

const units = [
  {
    name: "Drone",
    count: 1,
    attack: 1,
    defense: 1,
    mining: 1,
    cargo: 1,
    population: 1,
  },
  {
    name: "Hammer",
    count: 1,
    attack: 1,
    defense: 1,
    mining: 1,
    cargo: 1,
    population: 1,
  },
  {
    name: "Anvil",
    count: 1,
    attack: 1,
    defense: 1,
    mining: 1,
    cargo: 1,
    population: 1,
  },
];

export const UnitBreakdown = () => {
  const [showUnitBreakdown, setShowUnitBreakdown] = useState(false);

  function toggleShowUnitBreakdown() {
    setShowUnitBreakdown((prevShowUnitBreakdown) => !prevShowUnitBreakdown);
  }

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
              {units.map((unit, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-slate-800/70" : ""}
                >
                  <td>{unit.name}</td>
                  <td>{unit.count}</td>
                  <td>{unit.attack}</td>
                  <td>{unit.defense}</td>
                  <td>{unit.mining}</td>
                  <td>{unit.cargo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
      <motion.button
        layout
        className="flex gap-1 items-center absolute -bottom-5 right-0 text-xs bg-slate-900/90"
        onClick={() => toggleShowUnitBreakdown()}
      >
        {!showUnitBreakdown ? "+ show unit breakdown" : "- hide unit breakdown"}
      </motion.button>
    </AnimatePresence>
  );
};
