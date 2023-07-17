import { primodium } from "@game/api";
import { KeybindActions } from "@game/constants";
import { EntityID } from "@latticexyz/recs";
import { useEffect, useRef, useState } from "react";
import { useMud } from "src/context/MudContext";
import {
  BackgroundImage,
  BlockIdToKey,
  BlockType,
  KeyImages,
} from "src/util/constants";
import { motion, useAnimation } from "framer-motion";
import { Key } from "src/engine/lib/core/createInput";

const config = [
  {
    name: "Main Base",
    icon: "/img/icons/mainbaseicon.png",
    buildings: [
      {
        blockType: BlockType.MainBase,
        keybind: KeybindActions.Hotbar0,
      },
    ],
  },
  {
    name: "Buildings",
    icon: "/img/icons/minersicon.png",
    buildings: [
      {
        blockType: BlockType.IronMine,
        keybind: KeybindActions.Hotbar0,
      },
      {
        blockType: BlockType.CopperMine,
        keybind: KeybindActions.Hotbar1,
      },
      {
        blockType: BlockType.LithiumMine,
        keybind: KeybindActions.Hotbar2,
      },
      {
        blockType: BlockType.Conveyor,
        keybind: KeybindActions.Hotbar3,
      },
    ],
  },
  {
    name: "Factories",
    icon: "/img/icons/factoriesicon.png",
    buildings: [
      {
        blockType: BlockType.StorageUnit,
        keybind: KeybindActions.Hotbar0,
      },
      {
        blockType: BlockType.IronPlateFactory,
        keybind: KeybindActions.Hotbar1,
      },
    ],
  },
  {
    name: "Transport",
    icon: "/img/icons/transporticon.png",
    buildings: [
      {
        blockType: BlockType.Conveyor,
        keybind: KeybindActions.Hotbar0,
      },
    ],
  },
];

if (import.meta.env.VITE_DEV === "true") {
  config.push({
    name: "Debug",
    icon: "/img/icons/debugicon.png",
    buildings: [
      {
        blockType: BlockType.DebugIronMine,
        keybind: KeybindActions.Hotbar0,
      },
      {
        blockType: BlockType.DebugIronPlateFactory,
        keybind: KeybindActions.Hotbar1,
      },
      {
        blockType: BlockType.DebugStorageBuilding,
        keybind: KeybindActions.Hotbar2,
      },
    ],
  });
}

export const Hotbar = () => {
  const network = useMud();
  const gameReady = primodium.hooks.useGameReady(network);
  const keybinds = primodium.hooks.useKeybinds();
  const [activeBar, setActiveBar] = useState(0);
  const activeBarRef = useRef(0);

  activeBarRef.current = activeBar;
  const prevKey = keybinds[KeybindActions.PrevHotbar]?.entries().next()
    .value[0] as Key;
  const nextKey = keybinds[KeybindActions.NextHotbar]?.entries().next()
    .value[0] as Key;
  const prevKeyImage = KeyImages.get(prevKey);
  const nextKeyImage = KeyImages.get(nextKey);

  useEffect(() => {
    if (!gameReady) return;

    const hotkeyListener = (index: number) => {
      if (index > config[activeBarRef.current].buildings.length - 1) return;

      const building = config[activeBarRef.current].buildings[index].blockType;

      const selectedBuilding = primodium.components
        .selectedBuilding(network)
        .get();

      if (selectedBuilding === building) {
        primodium.components.selectedBuilding(network).remove();
        return;
      }

      primodium.components
        .selectedBuilding(network)
        .set(config[activeBarRef.current].buildings[index].blockType);
    };

    let hotkeys: { dispose: () => void }[] = [];
    for (let i = 0; i < 10; i++) {
      const hotkey = primodium.input.addListener(
        KeybindActions[`Hotbar${i}` as keyof typeof KeybindActions],
        () => hotkeyListener(i)
      );

      hotkeys.push(hotkey);
    }

    const nextHotbar = primodium.input.addListener(
      KeybindActions.NextHotbar,
      () => {
        setActiveBar(wrap(activeBarRef.current + 1, config.length));
        primodium.components.selectedBuilding(network).remove();
      }
    );

    const prevHotbar = primodium.input.addListener(
      KeybindActions.PrevHotbar,
      () => {
        setActiveBar(wrap(activeBarRef.current - 1, config.length));
        primodium.components.selectedBuilding(network).remove();
      }
    );

    return () => {
      hotkeys.forEach((hotkey) => hotkey.dispose());
      nextHotbar.dispose();
      prevHotbar.dispose();
    };
  }, [gameReady, keybinds]);

  return (
    <div>
      {
        <div className=" z-[1000] viewport-container fixed bottom-0 left-1/2 -translate-x-1/2 flex justify-center text-white drop-shadow-xl font-mono select-none">
          <div
            style={{
              filter: "drop-shadow(2px 2px 0 rgb(20 184 166 / 0.4))",
              transform: "perspective(500px) rotateX(-10deg)",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0, y: 200 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0, y: 200 }}
              className="flex flex-col items-center"
            >
              <Hotbar.Label
                icon={config[activeBar].icon}
                name={config[activeBar].name}
              />
              <motion.div className="flex items-center space-x-2">
                {prevKeyImage && (
                  <div
                    className="relative cursor-pointer crt scale-x-[-1] "
                    onClick={() =>
                      setActiveBar(
                        wrap(activeBarRef.current - 1, config.length)
                      )
                    }
                  >
                    <img
                      src="/img/buttons/chevron.png"
                      className="pixel-images w-8 border border-cyan-400 "
                    />
                    <img
                      src={prevKeyImage}
                      className="absolute w-8 h-8 pixel-images scale-x-[-1] "
                    />
                  </div>
                )}
                <div
                  className={`flex space-x-3 relative bg-slate-900/90 border-2 p-3 border-cyan-600 crt`}
                >
                  {config[activeBar].buildings.map((tile, index) => {
                    return (
                      <Hotbar.Item
                        key={index}
                        blockType={tile.blockType}
                        keybind={tile.keybind}
                      />
                    );
                  })}
                </div>
                {nextKeyImage && (
                  <div
                    className="relative cursor-pointer crt"
                    onClick={() =>
                      setActiveBar(
                        wrap(activeBarRef.current + 1, config.length)
                      )
                    }
                  >
                    <img
                      src="/img/buttons/chevron.png"
                      className="pixel-images w-8 border border-cyan-600"
                    />
                    <img
                      src={nextKeyImage}
                      className="absolute w-8 h-8 pixel-images"
                    />
                  </div>
                )}
              </motion.div>

              <Hotbar.Pagination
                index={activeBar}
                className="mt-2"
                onClick={() =>
                  setActiveBar(wrap(activeBarRef.current + 1, config.length))
                }
              />
            </motion.div>
          </div>
        </div>
      }
    </div>
  );
};

Hotbar.Label = ({
  icon,
  name,
  onClick,
}: {
  icon: string;
  name: string;
  onClick?: () => void;
}) => {
  const controls = useAnimation();

  useEffect(() => {
    async function animateImage() {
      await controls.start({ scale: 2, transition: { duration: 0.2 } });
      controls.start({ scale: 1.5, transition: { duration: 0.2 } });
    }
    animateImage();
  }, [icon]);

  return (
    <div
      className="relative flex flex-col items-center mb-2 cursor-pointer"
      onClick={onClick}
    >
      <motion.img
        animate={controls}
        src={icon}
        className={`relative w-5 h-5 pixel-images z-20`}
      />

      <div className="relative px-2 border border-cyan-600">
        <p className="relative font-bold px-2 z-30 shadow-2xl">{name}</p>
        <span className="absolute inset-0 bg-slate-900/90 z-10crt"></span>
      </div>
    </div>
  );
};

Hotbar.Pagination = ({
  index,
  className,
  onClick,
}: {
  index: number;
  className?: string;
  onClick?: () => void;
}) => {
  return (
    <div
      className={`flex h-full space-x-2 hover:bg-gray-900/50 cursor-pointer p-2 crt ${className}`}
      onClick={onClick}
    >
      {config.map((_, i) => {
        return (
          <div
            key={i}
            className={`w-2 h-2 transition-transform  ${
              i === index
                ? "scale-125 bg-cyan-600 border border-cyan-400"
                : "bg-slate-900/90 scale-100"
            }`}
          />
        );
      })}
    </div>
  );
};

Hotbar.Item = ({
  blockType,
  keybind,
}: {
  blockType: EntityID;
  keybind: KeybindActions;
}) => {
  const network = useMud();
  const selectedBuilding = primodium.hooks.useSelectedBuilding(network);
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

const wrap = (index: number, length: number) => {
  return ((index % length) + length) % length;
};
