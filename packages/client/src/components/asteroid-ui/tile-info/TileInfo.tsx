import { motion } from "framer-motion";
import { SelectedAction, SelectedBuilding, SelectedTile } from "src/network/components/clientComponents";
import { BlueprintInfo } from "./BlueprintInfo";
import { BuildingInfo } from "./BuildingInfo";
import { TerrainInfo } from "./TerrainInfo";

export const TileInfo: React.FC = () => {
  const selectedTile = SelectedTile.use();
  const selectedBuilding = SelectedBuilding.use()?.value;
  const selectedAction = SelectedAction.use()?.value;

  return (
    <div>
      {
        <div className=" text-white font-mono select-none">
          <motion.div
            className="lg:fixed lg:top-0 lg:right-1/2 lg:translate-x-1/2 flex justify-center w-56 md:w-80 space-y-2 mt-8"
            initial={{ opacity: 0, scale: 0, y: -200 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: -200 }}
          >
            {selectedBuilding && !selectedAction && <BuildingInfo building={selectedBuilding} />}

            {selectedBuilding && selectedAction && <BlueprintInfo buildingType={selectedBuilding} />}

            {!selectedBuilding && selectedTile && <TerrainInfo coord={selectedTile} />}
          </motion.div>
        </div>
      }
    </div>
  );
};
