import { motion } from "framer-motion";
import { BackgroundImage, BlockType } from "src/util/constants";
import { getBlockTypeName } from "src/util/common";
import { useEffect, useMemo, useState } from "react";
import { FaInfoCircle } from "react-icons/fa";
import { EntityID } from "@latticexyz/recs";
import { train } from "src/util/web3";
import { useMud } from "src/hooks";

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

const availableUnits = [
  {
    type: BlockType.AnvilLightDrone,
    count: 100,
  },
  {
    type: BlockType.AegisDrone,
    count: 100,
  },
  {
    type: BlockType.MiningVessel,
    count: 100,
  },
  {
    type: BlockType.StingerDrone,
    count: 100,
  },
];

const maximum = 10;

export const UnitTraining: React.FC<{ buildingEntity: EntityID }> = ({
  buildingEntity,
}) => {
  const network = useMud();
  const [show, setShow] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<
    (typeof availableUnits)[0]["type"] | null
  >(null);
  const [count, setCount] = useState(0);
  const totalUnits = useMemo(() => {
    return availableUnits.reduce((acc, unit) => {
      return acc + unit.count;
    }, 0);
  }, [availableUnits]);

  useEffect(() => {
    setSelectedUnit(null);
  }, [show]);

  useEffect(() => {
    setCount(0);
  }, [selectedUnit]);

  return (
    <motion.div
      initial={{ translateY: -100, opacity: 0 }}
      animate={{ translateY: 0, opacity: 1 }}
      exit={{ translateY: 100, opacity: 0, transition: { duration: 0.1 } }}
      layout="position"
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
      }}
      className="relative flex justify-between items-center text-white w-full"
    >
      <motion.button
        layout="position"
        className={`border border-cyan-400 px-4 py-2  hover:bg-cyan-600 hover:scale-105 ${
          show ? "bg-cyan-600 scale-105" : "bg-slate-900"
        } font-bold flex items-center gap-2 transition-all w-full relative`}
        onClick={() => setShow(show ? false : true)}
      >
        <img src="/img/icons/debugicon.png" className="w-[24px] h-[24px]" />
        <div
          className={`flex flex-col justify-end ${
            show ? "background-white" : ""
          }`}
        >
          <p>{!show ? "Train Units" : "Your Units"}</p>
          {!show && <p className="text-xs opacity-50">{totalUnits} unit(s)</p>}
        </div>
      </motion.button>

      {show && (
        <div className="absolute translate-y-1/4 translate-x-full bg-slate-900/90 pixel-images border border-cyan-400 p-3 w-80">
          <div className="flex flex-col items-center space-y-3">
            <div className="flex flex-wrap gap-2 items-center justify-center">
              {availableUnits.map((unit, index) => {
                return (
                  <button
                    key={index}
                    className="relative flex flex-col items-center group hover:scale-110 transition-transform hover:z-50"
                    onClick={() =>
                      selectedUnit == unit.type
                        ? setSelectedUnit(null)
                        : setSelectedUnit(unit.type)
                    }
                  >
                    <img
                      src={
                        BackgroundImage.get(unit.type)?.at(0) ??
                        "/img/icons/debugicon.png"
                      }
                      className={`border border-cyan-400 w-[64px] h-[64px] group-hover:opacity-50 rounded-xl ${
                        selectedUnit == unit.type ? "border-2 border-white" : ""
                      }`}
                    />
                    <p className="opacity-0 absolute -bottom-4 text-xs bg-pink-900 group-hover:opacity-100 whitespace-nowrap transition-opacity">
                      {getBlockTypeName(unit.type)}
                    </p>
                  </button>
                );
              })}
            </div>
            <hr className="border-t border-cyan-600 w-full" />
            {!selectedUnit ? (
              <p className="opacity-50 text-xs italic mb-2 flex gap-2 z-10">
                <FaInfoCircle size={16} /> Click on a ship to train it.
              </p>
            ) : (
              <>
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
                      if (count !== 0) setCount(Math.max(0, count - 1));
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
                        setCount(0);
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
                      setCount(Math.min(maximum, count + 1));
                    }}
                  >
                    +
                  </button>
                </div>

                <button
                  className="bg-cyan-600 px-2 border-cyan-400 mt-4 font-bold"
                  onClick={() => {
                    train(buildingEntity, selectedUnit, count, network);
                  }}
                >
                  Train
                </button>
              </>
            )}
            <p className="opacity-50 text-xs">{maximum - count} ships left</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};
