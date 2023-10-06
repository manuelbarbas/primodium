import { EntityID } from "@latticexyz/recs";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Send } from "src/network/components/clientComponents";
import { getBlockTypeName } from "src/util/common";
import { BackgroundImage } from "src/util/constants";
import { getUnitStats } from "src/util/trainUnits";

export const UnitPane: React.FC<{
  unit: EntityID;
  maximum: number;
  setSelectedUnit: React.Dispatch<React.SetStateAction<EntityID | undefined>>;
  setShowHangar: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ unit, maximum, setSelectedUnit, setShowHangar }) => {
  const [count, setCount] = useState<number | "">(Send.getUnitCount(unit));
  const fleet = Send.use();
  useEffect(() => {
    setCount(Send.getUnitCount(unit));
  }, [fleet]);
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
        <img src={BackgroundImage.get(unit)?.at(0) ?? "img/icons/debugicon.png"} className="w-[32px] h-[32px]" />
        <p className="bg-pink-900 px-2">{getBlockTypeName(unit)}</p>
      </div>

      <p className="opacity-50 text-xs italic mt-2 flex gap-2 z-10">A small description of the unit.</p>

      <div className="grid grid-cols-6 gap-2 border-y py-2 my-2 border-cyan-400/30">
        {Object.entries(getUnitStats(unit)).map(([name, value]) => (
          <div key={name} className="flex flex-col items-center">
            <p className="text-xs opacity-50">{name}</p>
            <p>{value}</p>
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
        className="bg-cyan-600 px-2 border-cyan-400 mt-4 font-bold rounded-md"
        onClick={() => {
          if (count === "" || count === 0) return;

          Send.setUnitCount(unit, count);
          setShowHangar(false);
        }}
      >
        Add to Fleet
      </button>
      <button
        className="bg-slate-900 border border-cyan-400 px-2 m-2 rounded-md"
        onClick={() => setSelectedUnit(undefined)}
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
