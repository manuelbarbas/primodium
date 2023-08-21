import { motion } from "framer-motion";
import { BuildingInfo } from "./BuildingInfo";
import { TerrainInfo } from "./TerrainInfo";
import { BlueprintInfo } from "./BlueprintInfo";
import {
  SelectedAction,
  SelectedBuilding,
  SelectedTile,
} from "src/network/components/clientComponents";

export const TileInfo: React.FC = () => {
  const selectedTile = SelectedTile.use();
  const selectedBuilding = SelectedBuilding.use()?.value;
  const selectedAction = SelectedAction.use()?.value;

  return (
    <div>
      {
        <div className=" text-white font-mono select-none">
          <motion.div
            className="flex items-center justify-center w-56 md:w-80 space-y-2 mt-5"
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
      }
    </div>
  );
};
