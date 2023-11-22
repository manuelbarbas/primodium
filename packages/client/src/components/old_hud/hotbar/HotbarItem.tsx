import { primodium } from "@game/api";
import { EntitytoSpriteKey, KeybindActions } from "@game/constants";
import { Entity } from "@latticexyz/recs";
import { Key } from "engine/types";
import { motion } from "framer-motion";
import React, { useEffect, useMemo } from "react";
import { isMobile } from "react-device-detect";
import { useMud } from "src/hooks";
import { useHasEnoughResources } from "src/hooks/useHasEnoughResources";
import { components } from "src/network/components";
import { calcDims, convertToCoords } from "src/util/building";
import { getBlockTypeName } from "src/util/common";
import { Action, KeyImages } from "src/util/constants";
import { getRecipe } from "src/util/resource";
import { Hex } from "viem";

const HotbarItem: React.FC<{
  building: Entity;
  action: Action;
  index: number;
}> = ({ building, action, index }) => {
  const {
    network: { playerEntity },
  } = useMud();

  const { getSpriteBase64 } = primodium.api().sprite;
  const selectedBuilding = components.SelectedBuilding.use()?.value;
  // const main
  const {
    hooks: { useKeybinds },
    input: { addListener },
  } = primodium.api()!;
  const keybinds = useKeybinds();
  const playerMainbase = components.Home.get(playerEntity)?.mainBase as Entity | undefined;
  const playerLevel = components.Level.get(playerMainbase)?.value ?? 1n;
  const requiredLevel = components.P_RequiredBaseLevel.getWithKeys({ prototype: building as Hex, level: 1n })?.value;
  const unlocked = playerLevel >= (requiredLevel ?? 0n);

  const hasEnough = useHasEnoughResources(getRecipe(building, 1n), playerEntity);

  const keybindAction = useMemo(() => {
    if (!keybinds) return;

    if (!KeybindActions[`Hotbar${index}` as keyof typeof KeybindActions]) return;

    return KeybindActions[`Hotbar${index}` as keyof typeof KeybindActions];
  }, [keybinds, index]);

  const keyImage = useMemo(() => {
    if (!keybinds || !keybindAction) return;

    return KeyImages.get(keybinds[keybindAction]?.entries().next().value[0] as Key);
  }, [keybinds, keybindAction]);

  useEffect(() => {
    if (!keybinds || !unlocked || !keybindAction) return;

    const listener = addListener(keybindAction, () => {
      if (selectedBuilding === building) {
        components.SelectedBuilding.remove();
        components.SelectedAction.remove();
        return;
      }

      components.SelectedBuilding.set({ value: building });
      components.SelectedAction.set({ value: action });
    });

    return () => {
      listener.dispose();
    };
  }, [keybinds, selectedBuilding, action, building, unlocked, keybindAction, addListener]);

  let dimensions: { width: number; height: number } | undefined;
  if (building) {
    const blueprint = components.P_Blueprint.get(building)?.value;

    dimensions = blueprint ? calcDims(building, convertToCoords(blueprint)) : undefined;
  }

  const handleSelectBuilding = () => {
    if (selectedBuilding === building) {
      components.SelectedBuilding.remove();
      components.SelectedAction.remove();
      return;
    }

    components.SelectedBuilding.set({ value: building });
    components.SelectedAction.set({ value: action });
  };

  if (!unlocked) return null;

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
        onClick={handleSelectBuilding}
        className={`relative flex flex-col text-sm items-center cursor-pointer w-16 h-12 border rounded border-cyan-400 pointer-events-auto ${
          selectedBuilding === building ? "scale-110 ring-4 ring-amber-400 transistion-all duration-100 z-50" : ""
        } ${hasEnough ? "" : " border-rose-500"}`}
      >
        <img
          src={EntitytoSpriteKey[building] !== undefined ? getSpriteBase64(EntitytoSpriteKey[building][0]) : undefined}
          className={`absolute bottom-0 w-14 pixel-images rounded-md`}
        />
        {selectedBuilding === building && (
          <motion.p
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{
              opacity: { duration: 3 },
            }}
            className="absolute flex items-center -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-900 px-1"
          >
            {getBlockTypeName(selectedBuilding)}
          </motion.p>
        )}
        {keyImage && !isMobile && (
          <img
            src={keyImage}
            className={`absolute -bottom-2 -left-2 w-7 h-7 pixel-images rounded-md ${
              selectedBuilding === building ? "opacity-30" : "opacity-70"
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
