import { primodium } from "@game/api";
import { KeybindActions } from "@game/constants";
import {
  EntityID,
  getComponentValue,
  removeComponent,
  setComponent,
} from "@latticexyz/recs";
import { motion } from "framer-motion";
import React from "react";
import { useMud } from "src/context/MudContext";
import { Key } from "src/engine/lib/core/createInput";
import { singletonIndex, world } from "src/network/world";
import { calcDims, convertToCoords } from "src/util/building";
import { Action, BackgroundImage, KeyImages } from "src/util/constants";
const HotbarItem: React.FC<{
  blockType: EntityID;
  name: string;
  keybind: KeybindActions;
}> = ({ blockType: buildingType, name, keybind }) => {
  const network = useMud();
  const {
    components: { RawBlueprint },
  } = network;
  const selectedBuildingEntity = primodium.hooks.useSelectedBuilding();
  const selectedBuilding = selectedBuildingEntity
    ? world.entities[selectedBuildingEntity]
    : undefined;
  const keybinds = primodium.hooks.useKeybinds();

  const key = keybinds[keybind]?.entries().next().value[0] as Key;
  const keyImage = KeyImages.get(key);

  const buildingTypeEntity = world.entityToIndex.get(buildingType);
  if (!buildingTypeEntity) return null;
  const blueprint = getComponentValue(RawBlueprint, buildingTypeEntity)?.value;

  const dimensions = blueprint
    ? calcDims(buildingTypeEntity, convertToCoords(blueprint))
    : undefined;

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        opacity: { duration: 0.5 },
      }}
    >
      <div className="relative flex flex-col text-sm items-center cursor-pointer">
        <img
          src={BackgroundImage.get(buildingType)}
          onClick={() => {
            if (selectedBuilding === buildingType) {
              primodium.components.selectedBuilding(network).remove();
              removeComponent(
                network.offChainComponents.SelectedAction,
                singletonIndex
              );
              return;
            }

            primodium.components.selectedBuilding(network).set(buildingType);
            setComponent(
              network.offChainComponents.SelectedAction,
              singletonIndex,
              {
                value: Action.PlaceBuilding,
              }
            );
          }}
          className={`w-16 h-16 pixel-images ring-2 ring-gray-600 ${
            selectedBuilding === buildingType
              ? " border-4 border-yellow-500 border-b-yellow-700 border-t-yellow-300 scale-110 transistion-all duration-100"
              : ""
          }`}
        />
        {selectedBuilding === buildingType && (
          <motion.p
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{
              opacity: { duration: 3 },
            }}
            className="absolute flex items-center -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-900 px-1"
          >
            {name}
          </motion.p>
        )}
        {keyImage && (
          <img
            src={keyImage}
            className={`absolute -top-3 -left-3 w-8 h-8 pixel-images ${
              selectedBuilding === buildingType ? "opacity-50" : ""
            }`}
          />
        )}
        {dimensions && (
          <div className="absolute bottom-0 right-0 text-xs bg-black bg-opacity-50">
            {dimensions.width}x{dimensions.height}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default HotbarItem;
