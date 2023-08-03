import { primodium } from "@game/api";
import { AsteroidMap, KeybindActions } from "@game/constants";
import { Key } from "@latticexyz/phaserx";
import { motion } from "framer-motion";
import { isMobile } from "react-device-detect";
import { Action, KeyImages } from "src/util/constants";
import HotbarItem from "./HotbarItem";
import { useHotbarContent } from "./useHotbarContent";
import { wrap } from "src/util/common";

const HotbarBody: React.FC<{
  activeBar: number;
  setActiveBar: (activeBar: number) => void;
}> = ({ activeBar, setActiveBar }) => {
  const hotbarContent = useHotbarContent();
  const {
    hooks: { useKeybinds },
  } = primodium.api(AsteroidMap.KEY)!;
  const keybinds = useKeybinds();
  const prevKey = keybinds[KeybindActions.PrevHotbar]?.entries().next()
    .value[0] as Key;
  const nextKey = keybinds[KeybindActions.NextHotbar]?.entries().next()
    .value[0] as Key;

  const prevKeyImage = KeyImages.get(prevKey);
  const nextKeyImage = KeyImages.get(nextKey);
  return (
    <motion.div className="flex items-center space-x-2">
      {prevKeyImage && hotbarContent.length > 1 && (
        <div
          className="relative cursor-pointer crt scale-x-[-1] w-8"
          onClick={() =>
            setActiveBar(wrap(activeBar - 1, hotbarContent.length))
          }
        >
          <img
            src="/img/buttons/chevron.png"
            className="pixel-images w-8 border border-cyan-400 "
          />
          {!isMobile && (
            <img
              src={prevKeyImage}
              className="absolute w-8 h-8 pixel-images scale-x-[-1] "
            />
          )}
        </div>
      )}
      <div
        className={`flex space-x-3 relative bg-slate-900/90 border-2 p-3 border-cyan-600 crt`}
      >
        {hotbarContent[activeBar].items.map((item, index) => {
          return (
            <HotbarItem
              key={index}
              index={index}
              blockType={item.blockType}
              action={item.action ?? Action.PlaceBuilding}
            />
          );
        })}
      </div>
      {nextKeyImage && hotbarContent.length > 1 && (
        <div
          className="relative cursor-pointer crt w-8"
          onClick={() =>
            setActiveBar(wrap(activeBar + 1, hotbarContent.length))
          }
        >
          <img
            src="/img/buttons/chevron.png"
            className="pixel-images w-8 border border-cyan-600"
          />
          {!isMobile && (
            <img src={nextKeyImage} className="absolute w-8 h-8 pixel-images" />
          )}
        </div>
      )}
    </motion.div>
  );
};

export default HotbarBody;
