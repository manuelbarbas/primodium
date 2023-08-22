import { motion } from "framer-motion";
import { FaTrash } from "react-icons/fa";
import { Fleet } from "src/network/components/clientComponents";
import { getBlockTypeName } from "src/util/common";
import { BackgroundImage } from "src/util/constants";

export const FleetPane: React.FC<{
  setShowHangar: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ setShowHangar }) => {
  const fleet = Fleet.use(undefined, {
    count: [],
    units: [],
  });

  return (
    <motion.div
      initial={{ translateY: -100, opacity: 0 }}
      animate={{ translateY: 0, opacity: 1 }}
      exit={{ translateY: 100, opacity: 0, transition: { duration: 0.1 } }}
      layout
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
      }}
      className="relative flex justify-center items-center bg-slate-900/90 pixel-images border border-cyan-400 p-2 rounded-md ring ring-cyan-700"
    >
      <div className="absolute top-0 right-1/2 -translate-y-full translate-x-1/2">
        <p className="px-2 border border-cyan-400 font-bold mb-2 bg-slate-700 rounded-md bg-gradient-to-b from-transparent to-slate-900/30 ">
          Fleet
        </p>
      </div>
      {!fleet.units && (
        <button
          className="border border-cyan-400 hover:bg-cyan-600 ring-cyan-600 bg-slate-800 active:ring transition-all w-fit px-4 py-2 mx-10 my-5"
          onClick={() => setShowHangar(true)}
        >
          ADD UNITS FROM HANGAR
        </button>
      )}

      {fleet.units && fleet.units.length !== 0 && (
        <div className="flex flex-wrap gap-2 items-center justify-center">
          {fleet.units.map((unit, index) => {
            return (
              <button
                key={index}
                className="relative flex flex-col items-center group hover:scale-110 transition-transform hover:z-50"
                onClick={() => Fleet.removeUnit(unit)}
              >
                <img
                  src={
                    BackgroundImage.get(unit)?.at(0) ??
                    "/img/icons/debugicon.png"
                  }
                  className="border border-cyan-400 w-[64px] h-[64px] group-hover:opacity-50 rounded-md"
                />
                <FaTrash className="absolute bottom-1/2 left-1/2 -translate-x-1/2 translate-y-1/2 opacity-0 group-hover:opacity-100" />
                <p className="opacity-0 absolute -bottom-4 text-xs bg-pink-900 group-hover:opacity-100 whitespace-nowrap transition-opacity">
                  {getBlockTypeName(unit)}
                </p>
                <p className="absolute bottom-1 right-1 font-bold text-[.6rem] bg-slate-900 border-cyan-400/30">
                  {Fleet.getUnitCount(unit)}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};
