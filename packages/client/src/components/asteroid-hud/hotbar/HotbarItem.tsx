import { primodium } from "@game/api";
import { KeybindActions } from "@game/constants";
import { isMobile } from "react-device-detect";
import { EntityID } from "@latticexyz/recs";
import { motion } from "framer-motion";
import React, { useEffect, useMemo } from "react";
import { Key } from "engine/types";
import {
  Account,
  SelectedAction,
  SelectedBuilding,
} from "src/network/components/clientComponents";
import { calcDims, convertToCoords } from "src/util/building";
import { getBlockTypeName } from "src/util/common";
import {
  Action,
  BackgroundImage,
  BlockType,
  KeyImages,
} from "src/util/constants";
import {
  hashAndTrimKeyCoord,
  hashAndTrimKeyEntity,
  hashKeyEntity,
} from "src/util/encode";
import { RawBlueprint, Level } from "src/network/components/chainComponents";
import { useMainBaseCoord } from "src/hooks/useMainBase";
import { useHasEnoughResources } from "src/hooks/useHasEnoughResources";

const HotbarItem: React.FC<{
  blockType: EntityID;
  action: Action;
  index: number;
}> = ({ blockType, action, index }) => {
  const player = Account.use()?.value!;
  const selectedBuilding = SelectedBuilding.use()?.value;
  const mainBaseCoord = useMainBaseCoord();
  const {
    hooks: { useKeybinds },
    input: { addListener },
  } = primodium.api()!;
  const keybinds = useKeybinds();
  let dimensions: { width: number; height: number } | undefined;

  const coordEntity = hashAndTrimKeyCoord(BlockType.BuildingKey, {
    x: mainBaseCoord?.x ?? 0,
    y: mainBaseCoord?.y ?? 0,
    parent: mainBaseCoord?.parent ?? ("0" as EntityID),
  });

  const mainBaseLevel = Level.use(coordEntity, {
    value: 0,
  }).value;

  const requiredLevel = Level.use(hashKeyEntity(blockType, 1))?.value;

  const unlocked = mainBaseLevel >= (requiredLevel ?? 0);

  const keybindAction = useMemo(() => {
    if (!keybinds) return;

    if (!KeybindActions[`Hotbar${index}` as keyof typeof KeybindActions])
      return;

    return KeybindActions[`Hotbar${index}` as keyof typeof KeybindActions];
  }, [keybinds]);

  const keyImage = useMemo(() => {
    if (!keybinds || !keybindAction) return;

    return KeyImages.get(
      keybinds[keybindAction]?.entries().next().value[0] as Key
    );
  }, [keybinds, keybindAction]);

  const level = Level.use(hashKeyEntity(blockType, player), {
    value: 1,
  })?.value;
  const buildingLevelEntity = hashAndTrimKeyEntity(blockType, level);

  const hasEnough = useHasEnoughResources(buildingLevelEntity);

  useEffect(() => {
    if (!keybinds || !unlocked || !keybindAction) return;

    const listener = addListener(keybindAction, () => {
      if (selectedBuilding === blockType) {
        SelectedBuilding.remove();
        SelectedAction.remove();
        return;
      }

      SelectedBuilding.set({ value: blockType });
      SelectedAction.set({ value: action });
    });

    return () => {
      listener.dispose();
    };
  }, [keybinds, selectedBuilding, action, blockType, unlocked, keybindAction]);

  if (blockType) {
    const blueprint = RawBlueprint.get(blockType)?.value;

    dimensions = blueprint
      ? calcDims(blockType, convertToCoords(blueprint))
      : undefined;
  }

  const handleSelectBuilding = () => {
    if (selectedBuilding === blockType) {
      SelectedBuilding.remove();
      SelectedAction.remove();
      return;
    }

    SelectedBuilding.set({ value: blockType });
    SelectedAction.set({ value: action });
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
          selectedBuilding === blockType
            ? "scale-110 ring-4 ring-amber-400 transistion-all duration-100 z-50"
            : ""
        } ${hasEnough ? "" : " border-rose-500"}`}
      >
        <img
          src={
            BackgroundImage.get(blockType) !== undefined
              ? BackgroundImage.get(blockType)![0]
              : undefined
          }
          className={`absolute bottom-0 w-14 pixel-images rounded-md`}
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
            {getBlockTypeName(selectedBuilding)}
          </motion.p>
        )}
        {keyImage && !isMobile && (
          <img
            src={keyImage}
            className={`absolute -bottom-2 -left-2 w-7 h-7 pixel-images rounded-md ${
              selectedBuilding === blockType ? "opacity-30" : "opacity-70"
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
