import { primodium } from "@game/api";
import { motion } from "framer-motion";

export const InfoBox = () => {
  const minimized = false;
  const mainBaseCoord = primodium.hooks.useMainBase();

  return (
    <div className="flex fixed top-8 left-8 items-center font-mono text-white crt ">
      <motion.div
        initial={{ opacity: 0, scale: 0, x: -200 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0, x: -200 }}
      >
        <div className="-skew-1-x -skew-y-1">
          {!minimized && (
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              exit={{ scale: 0 }}
              className=" bg-gray-900 z-[999]"
            >
              <div className="text-sm px-2 border border-cyan-600 border-b-cyan-300">
                Base Information
              </div>
              <div className="text-sm px-2 border border-t-0 border-cyan-600 p-2">
                {mainBaseCoord && (
                  <p>
                    Location: [{mainBaseCoord.x}, {mainBaseCoord.y}]
                  </p>
                )}
                <div>
                  <p>
                    {" "}
                    Buildings: 5/<b>10</b>
                  </p>
                  <div className="flex items-center bottom-0 left-1/2 -translate-x-1/2 w-full h-2 ring-2 ring-slate-900/90 crt">
                    <div
                      className="h-full bg-cyan-600"
                      style={{ width: `${(5 / 10) * 100}%` }}
                    />
                    <div
                      className="h-full bg-gray-900"
                      style={{ width: `${(1 - 5 / 10) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
