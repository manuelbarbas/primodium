import { primodium } from "@game/api";
import { KeybindActions } from "@game/constants";
import { EntityID } from "@latticexyz/recs";
import { motion } from "framer-motion";
import React from "react";
import { useMud } from "src/context/MudContext";
import { Key } from "src/engine/lib/core/createInput";
import { world } from "src/network/world";
import { BackgroundImage, BlockIdToKey, KeyImages } from "src/util/constants";

const HotbarItem: React.FC<{
  blockType: EntityID;
  keybind: KeybindActions;
}> = ({ blockType, keybind }) => {
  const network = useMud();
  const selectedBuildingEntity = primodium.hooks.useSelectedBuilding();
  const selectedBuilding = !!selectedBuildingEntity
    ? world.entities[selectedBuildingEntity]
    : undefined;
  const keybinds = primodium.hooks.useKeybinds();

  const key = keybinds[keybind]?.entries().next().value[0] as Key;
  const keyImage = KeyImages.get(key);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        opacity: { duration: 0.5 },
      }}
    >
      <div
        className={`relative flex flex-col text-sm items-center cursor-pointer crt ${
          selectedBuilding === blockType ? "scale-110" : ""
        }`}
      >
        <img
          src={BackgroundImage.get(blockType)}
          onClick={() => {
            if (selectedBuilding === blockType) {
              primodium.components.selectedBuilding(network).remove();
              return;
            }

            primodium.components.selectedBuilding(network).set(blockType);
          }}
          className={`w-16 h-16 pixel-images border border-cyan-700 ${
            selectedBuilding === blockType
              ? " ring-4 ring-amber-400 transistion-all duration-100"
              : ""
          }`}
        />
        {selectedBuilding === blockType && (
          <motion.p
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{
              opacity: { duration: 3 },
            }}
            className="absolute flex items-center -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-900 px-1"
          >
            {BlockIdToKey[selectedBuilding]
              .replace(/([A-Z]+)/g, " $1")
              .replace(/([A-Z][a-z])/g, " $1")}
          </motion.p>
        )}
        {keyImage && (
          <img
            src={keyImage}
            className={`absolute -top-2 -left-2 w-8 h-8 pixel-images ${
              selectedBuilding === blockType ? "opacity-30" : ""
            }`}
          />
        )}
      </div>
    </motion.div>
  );
};

export default HotbarItem;
