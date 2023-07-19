import { primodium } from "@game/api";
import { motion } from "framer-motion";
import BuildingInfo from "./BuildingInfo";
import TerrainInfo from "./TerrainInfo";
import { world } from "src/network/world";

export const TileInfo: React.FC = () => {
  const selectedTile = primodium.hooks.useSelectedTile();
  const selectedBuilding = primodium.hooks.useSelectedBuilding();

  return (
    <div>
      {(selectedTile || selectedBuilding) && (
        <div className=" z-[1000] viewport-container fixed top-2 right-1/2 translate-x-1/2 text-white drop-shadow-xl font-mono select-none">
          <div
            style={{
              transform: "perspective(500px) rotateX(10deg)",
              filter: "drop-shadow(2px 2px 0 rgb(20 184 166 / 0.4))",
            }}
          >
            <motion.div
              className="flex flex-col items-center space-y-2"
              initial={{ opacity: 0, scale: 0, y: -200 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0, y: -200 }}
            >
              {selectedBuilding && (
                <BuildingInfo
                  building={world.entityToIndex.get(selectedBuilding)!}
                />
              )}
              {!selectedBuilding && selectedTile && (
                <TerrainInfo coord={selectedTile} />
              )}
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};
