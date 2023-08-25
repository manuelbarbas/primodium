import { EntityID } from "@latticexyz/recs";
import { motion } from "framer-motion";
import { FaTrash } from "react-icons/fa";
import Spinner from "src/components/shared/Spinner";
import { useMud } from "src/hooks";
import { OwnedBy } from "src/network/components/chainComponents";
import {
  ActiveAsteroid,
  Fleet,
  SelectedAsteroid,
} from "src/network/components/clientComponents";
import { useGameStore } from "src/store/GameStore";
import { getAsteroidImage } from "src/util/asteroid";
import { getBlockTypeName } from "src/util/common";
import { BackgroundImage } from "src/util/constants";
import { send } from "src/util/web3/send";
import { ESendType } from "src/util/web3/types";
import { sendUnits } from "src/util/web3/units";

export const FleetPane: React.FC<{
  setShowHangar: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ setShowHangar }) => {
  const network = useMud();
  const transactionLoading = useGameStore((state) => state.transactionLoading);
  const fleet = Fleet.use(undefined, {
    count: [],
    units: [],
  });

  const selectedAsteroid = SelectedAsteroid.use();

  const sendFleet = (sendType: ESendType) => {
    const destinationAsteroid = selectedAsteroid?.value;
    const origin = ActiveAsteroid.get()?.value;

    const recipient = OwnedBy.get(destinationAsteroid, {
      value: "0" as EntityID,
    }).value;
    if (destinationAsteroid === undefined) return;

    if (
      origin == undefined ||
      fleet.units === undefined ||
      fleet.units.length === 0
    )
      return;

    const arrivalUnits = fleet.units.map((unit, index) => ({
      unitType: unit,
      count: fleet.count?.at(index) ?? 0,
    }));

    sendUnits(destinationAsteroid, arrivalUnits, sendType, network);
    // send(
    //   arrivalUnits,
    //   sendType,
    //   origin,
    //   destinationAsteroid,
    //   recipient,
    //   network
    // );
  };

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
      <div className="grid grid-cols-3 items-center">
        {fleet.units && fleet.units?.length !== 0 && (
          <div className="relative grid grid-cols-5 col-span-2 gap-2 items-center justify-center border p-3 rounded border-slate-700 bg-slate-800 bg-gradient-t-br from-transparent to-slate-900 min-h-full">
            {fleet.units.map((unit, index) => {
              return (
                <button
                  key={index}
                  className="relative flex flex-col items-center group hover:scale-110 transition-transform hover:z-50"
                  onClick={() => Fleet.removeUnit(unit)}
                >
                  <div className="relative bg-slate-900 w-14 h-14 border border-cyan-400 rounded-md p-2">
                    <img
                      src={
                        BackgroundImage.get(unit)?.at(0) ??
                        "/img/icons/debugicon.png"
                      }
                      className="w-full h-full"
                    />
                    <p className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 font-bold text-xs bg-slate-900 border-cyan-400/30 px-1 rounded-md border group-hover:opacity-0">
                      {Fleet.getUnitCount(unit)}
                    </p>
                  </div>

                  <FaTrash className="absolute bottom-1/2 left-1/2 -translate-x-1/2 translate-y-1/2 opacity-0 group-hover:opacity-100" />
                  <p className="opacity-0 absolute -bottom-5 text-xs bg-pink-900 group-hover:opacity-100 whitespace-nowrap transition-opacity rounded-md px-1">
                    {getBlockTypeName(unit)}
                  </p>
                </button>
              );
            })}
          </div>
        )}

        {(!fleet.units || fleet.units?.length === 0) && (
          <div className="col-span-2 flex items-center justify-center border p-1 rounded border-slate-700 bg-slate-800 bg-gradient-t-br from-transparent to-slate-900 min-h-full">
            <button
              className="border border-orange-500 w-fit px-3 py-2 mx-10 my-3 rounded-md bg-orange-700 bg-gradient-to-br from-transparent to-orange-900/30 text-orange-100 text-sm font-bold"
              onClick={() => setShowHangar(true)}
            >
              ADD UNITS FROM HANGAR
            </button>
          </div>
        )}

        <div className="flex flex-col items-center justify-center ml-2 border rounded-md border-slate-700 bg-slate-800 bg-gradient-t-br from-transparent to-slate-900 min-h-32 h-full">
          {!selectedAsteroid?.value && (
            <b className="p-1 rounded text-center border-slate-700 bg-slate-800 bg-gradient-t-br from-transparent to-slate-900 mt-1 text-slate-400 text-xs">
              NO TARGET SELECTED
            </b>
          )}

          {selectedAsteroid?.value && (
            <div className="flex items-center justify-center p-1 rounded border-slate-700 bg-slate-800 bg-gradient-t-br from-transparent to-slate-900 mt-1 text-red-400 text-xs gap-2">
              <img
                src={getAsteroidImage(selectedAsteroid.value)}
                className="w-[24px] h-[24px] shadow-2xl"
              />
              TARGET LOCKED
            </div>
          )}

          {selectedAsteroid?.value && (
            <div className="flex gap-2 text-xs p-2">
              {(!fleet.units || fleet.units?.length === 0) && (
                <b className="p-1 rounded text-center border-slate-700 bg-slate-800 bg-gradient-t-br from-transparent to-slate-900 mt-1 text-slate-400 text-xs">
                  NO UNITS SELECTED
                </b>
              )}
              {fleet.units && fleet.units.length !== 0 && (
                <>
                  <button
                    className="p-2 border rounded-md border-slate-700 ring ring-slate-900 bg-slate-700 hover:scale-105 transition-all"
                    onClick={() => sendFleet(ESendType.REINFORCE)}
                  >
                    {transactionLoading ? <Spinner /> : "REINFORCE"}
                  </button>
                  <button
                    className="p-2 border rounded-md border-rose-700 ring ring-rose-900 bg-rose-700 hover:scale-105 transition-all"
                    onClick={() => sendFleet(ESendType.INVADE)}
                  >
                    {transactionLoading ? <Spinner /> : "INVADE"}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
