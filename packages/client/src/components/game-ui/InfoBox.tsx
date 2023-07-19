import { useState } from "react";
import { motion } from "framer-motion";
import { useMud } from "src/context/MudContext";
import { useComponentValue } from "src/hooks/useComponentValue";
import { useAccount } from "src/hooks/useAccount";
import { BlockType } from "src/util/constants";
import { EntityID } from "@latticexyz/recs";
import { encodeCoordEntityAndTrim } from "src/util/encode";
import { useMainBase } from "src/hooks/useMainBase";
import { useGameStore } from "src/store/GameStore";

export const InfoBox = () => {
  const { components, world, singletonIndex } = useMud();
  const crtEffect = useGameStore((state) => state.crtEffect);
  const { address } = useAccount();
  const [minimized] = useState<boolean>(false);
  const mainBaseCoord = useMainBase();

  const mainBaseLevel = useComponentValue(
    components.BuildingLevel,
    world.entityToIndex.get(
      encodeCoordEntityAndTrim(
        { x: mainBaseCoord?.x ?? 0, y: mainBaseCoord?.y ?? 0 },
        BlockType.BuildingKey
      )
    )
  );

  const buildLimit = useComponentValue(
    components.BuildingLimit,
    world.entityToIndex.get(mainBaseLevel?.value as unknown as EntityID)
  );

  const playerBuildingCount = useComponentValue(
    components.BuildingLimit,
    address
      ? world.entityToIndex.get(address.toString().toLowerCase() as EntityID)
      : singletonIndex
  );
  const buildLimitNumber = parseInt(buildLimit?.value.toString() ?? "0");
  const playerBuildingCountNumber = parseInt(
    playerBuildingCount?.value.toString() ?? "0"
  );

  return (
    <div
      style={{ filter: "drop-shadow(2px 2px 0 rgb(20 184 166 / 0.4))" }}
      className="flex fixed top-8 left-8 items-center font-mono text-white crt "
    >
      <motion.div
        initial={{ opacity: 0, scale: 0, x: -200 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0, x: -200 }}
      >
        <div className={`${crtEffect ? "skew-x-1 skew-y-1" : ""}`}>
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
                    Buildings: {playerBuildingCountNumber}/
                    <b>{buildLimitNumber}</b>
                  </p>
                  <div className="flex items-center bottom-0 left-1/2 -translate-x-1/2 w-full h-2 ring-2 ring-slate-900/90 crt">
                    <div
                      className="h-full bg-cyan-600"
                      style={{
                        width: `${
                          (playerBuildingCountNumber / buildLimitNumber) * 100
                        }%`,
                      }}
                    />
                    <div
                      className="h-full bg-gray-900"
                      style={{
                        width: `${
                          (1 - playerBuildingCountNumber / buildLimitNumber) *
                          100
                        }%`,
                      }}
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
