import { motion } from "framer-motion";
import { BuildingInfo } from "./BuildingInfo";
import { TerrainInfo } from "./TerrainInfo";
import { useGameStore } from "src/store/GameStore";
import { BlueprintInfo } from "./BlueprintInfo";
import {
  SelectedAction,
  SelectedBuilding,
  SelectedTile,
} from "src/network/components/clientComponents";
import { useComponentValue } from "src/hooks/useComponentValue";

export const TileInfo: React.FC = () => {
  const crtEffect = useGameStore((state) => state.crtEffect);
  const selectedTile = useComponentValue(SelectedTile);
  const selectedBuilding = useComponentValue(SelectedBuilding)?.value;
  const selectedAction = useComponentValue(SelectedAction)?.value;

  return (
    <div>
      {
        <div className=" z-[1000] viewport-container fixed top-2 right-1/2 translate-x-1/2 text-white drop-shadow-xl font-mono select-none">
          <div
            style={
              crtEffect
                ? {
                    transform: "perspective(500px) rotateX(10deg)",
                    filter: "drop-shadow(2px 2px 0 rgb(20 184 166 / 0.4))",
                  }
                : {}
            }
          >
            <motion.div
              className="flex flex-col items-center space-y-2"
              initial={{ opacity: 0, scale: 0, y: -200 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0, y: -200 }}
            >
              {selectedBuilding && !selectedAction && (
                <BuildingInfo building={selectedBuilding} />
              )}

              {selectedBuilding && selectedAction && (
                <BlueprintInfo buildingType={selectedBuilding} />
              )}

              {!selectedBuilding && selectedTile && (
                <TerrainInfo coord={selectedTile} />
              )}
            </motion.div>
          </div>
        </div>
      }
    </div>
  );
};
