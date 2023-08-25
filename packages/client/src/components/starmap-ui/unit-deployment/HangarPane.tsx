import { motion } from "framer-motion";
import { BackgroundImage } from "src/util/constants";
import { getBlockTypeName } from "src/util/common";
import { useEffect, useMemo, useState } from "react";
import { FaEye, FaInfoCircle } from "react-icons/fa";
import { UnitPane } from "./UnitPane";
import { Fleet, Hangar } from "src/network/components/clientComponents";
import { EntityID } from "@latticexyz/recs";

export const HangarPane: React.FC<{
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ show, setShow }) => {
  const [selectedUnit, setSelectedUnit] = useState<EntityID>();
  useEffect(() => {
    if (show) {
      setSelectedUnit(undefined);
    }
  }, [show]);

  const hangar = Hangar.use();
  const fleet = Fleet.use();
  if (!hangar) return null;

  const selectedCount = useMemo(() => {
    if (!selectedUnit) return 0;
    return hangar.counts[hangar.units.indexOf(selectedUnit)];
  }, [selectedUnit, hangar]);

  const totalUnits =
    hangar.counts.reduce((a, b) => a + b, 0) -
    (fleet?.count ? fleet.count.reduce((a, b) => a + b, 0) : 0);
  const availableUnits = hangar.units.map((unit, i) => ({
    type: unit,
    count: hangar.counts[i],
  }));

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
      className="relative flex flex-col justify-between items-center"
    >
      <motion.button
        layout="position"
        className="border border-cyan-400 px-4 py-2 bg-slate-900 hover:bg-cyan-600 hover:scale-105 font-bold flex items-center gap-2 transition-all"
        onClick={() => setShow(show ? false : true)}
      >
        <img src="/img/icons/debugicon.png" className="w-[24px] h-[24px]" />
        <div className="flex flex-col justify-end">
          <p>{!show ? "View Hangar" : "Your Hangar"}</p>
          {!show && <p className="text-xs opacity-50">{totalUnits} unit(s)</p>}
        </div>
      </motion.button>

      {show && (
        <div className="bg-slate-900/90 pixel-images border border-cyan-400 p-3 w-80">
          {selectedUnit === undefined && (
            <div className="flex flex-col items-center space-y-3">
              <div className="flex flex-wrap gap-2 items-center justify-center">
                {availableUnits.map((unit, index) => {
                  return (
                    <button
                      key={index}
                      className="relative flex flex-col items-center group hover:scale-110 transition-transform hover:z-50"
                      onClick={() => setSelectedUnit(unit.type)}
                    >
                      <img
                        src={
                          BackgroundImage.get(unit.type)?.at(0) ??
                          "/img/icons/debugicon.png"
                        }
                        className="border border-cyan-400 w-[64px] h-[64px] group-hover:opacity-50 rounded-xl"
                      />
                      <FaEye className="absolute bottom-1/2 left-1/2 -translate-x-1/2 translate-y-1/2 opacity-0 group-hover:opacity-100" />
                      <p className="opacity-0 absolute -bottom-4 text-xs bg-pink-900 group-hover:opacity-100 whitespace-nowrap transition-opacity">
                        {getBlockTypeName(unit.type)}
                      </p>
                      <p className="absolute bottom-1 right-1 font-bold text-[.6rem] bg-slate-900 border-cyan-400/30">
                        {unit.count - Fleet.getUnitCount(unit.type)}
                      </p>
                    </button>
                  );
                })}
              </div>
              <hr className="border-t border-cyan-600 w-full" />
              <p className="opacity-50 text-xs italic mb-2 flex gap-2 z-10">
                <FaInfoCircle size={16} /> Click on one of the ships to add it
                to your fleet.
              </p>
            </div>
          )}

          {selectedUnit && (
            <UnitPane
              unit={selectedUnit}
              setSelectedUnit={setSelectedUnit}
              maximum={selectedCount}
            />
          )}
        </div>
      )}
    </motion.div>
  );
};
