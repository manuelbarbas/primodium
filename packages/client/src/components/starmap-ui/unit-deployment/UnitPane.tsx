import { motion } from "framer-motion";
import { getBlockTypeName } from "src/util/common";
import { useState } from "react";
import { EntityID } from "@latticexyz/recs";
import { Fleet } from "src/network/components/clientComponents";

const unitStats = [
  {
    name: "ATK",
    value: "10",
  },
  {
    name: "DEF",
    value: "10",
  },
  {
    name: "MOVE",
    value: "10/s",
  },
  {
    name: "CAP",
    value: "200",
  },
];

export const UnitPane: React.FC<{
  unit: EntityID;
  maximum: number;
  setSelectedUnit: React.Dispatch<
    React.SetStateAction<{
      type: EntityID;
      count: number;
    } | null>
  >;
}> = ({ unit, maximum, setSelectedUnit }) => {
  const [count, setCount] = useState<number | "">(0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.1 } }}
      layout="position"
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
      }}
      className="relative flex flex-col justify-between items-center"
    >
      <div className="flex gap-2 items-center">
        <img src="img/icons/debugicon.png" className="w-[32px] h-[32px]" />
        <p className="bg-pink-900 px-2">{getBlockTypeName(unit)}</p>
      </div>

      <p className="opacity-50 text-xs italic mt-2 flex gap-2 z-10">
        A small description of the unit.
      </p>

      <div className="grid grid-cols-6 gap-2 border-y py-2 my-2 border-cyan-400/30">
        {unitStats.map((stat) => (
          <div key={stat.name} className="flex flex-col items-center">
            <p className="text-xs opacity-50">{stat.name}</p>
            <p>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-4 mb-2">
        <button
          onClick={() => {
            if (count !== "") setCount(Math.max(0, count - 1));
          }}
        >
          -
        </button>
        <input
          type="number"
          className="bg-transparent text-center w-fit outline-none border-b border-pink-900"
          value={count}
          placeholder="0"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            e.preventDefault();

            const value = parseInt(e.target.value, 10);

            if (isNaN(value)) {
              setCount("");
              return;
            }

            // Check if the input value is a number and within the specified range
            if (value >= 0 && value <= maximum) {
              setCount(value);
              return;
            }

            if (value > maximum) setCount(maximum);
            else setCount(0);

            // Else, we don't update count (this makes it a controlled input that does not accept values outside the range)
          }}
          min={0}
          max={maximum}
        />
        {/* add to count */}
        <button
          onClick={() => {
            if (count !== "") setCount(Math.min(maximum, count + 1));
          }}
        >
          +
        </button>
      </div>
      <p className="opacity-50 text-xs">max. {maximum}</p>

      <button
        className="bg-cyan-600 px-2 border-cyan-400 mt-4 font-bold"
        onClick={() => {
          if (count === "") return;

          Fleet.setUnitCount(unit, count);
        }}
      >
        Add to Fleet
      </button>
      <button
        className="bg-slate-900 border border-cyan-400 px-2 m-2"
        onClick={() => setSelectedUnit(null)}
      >
        Return to Hangar
      </button>

      {/* <p className="opacity-50 text-xs italic mb-2 flex gap-2 z-10">
        <FaInfoCircle size={16} /> Click on one of the ships to add it to your
        fleet.
      </p> */}
    </motion.div>
  );
};
