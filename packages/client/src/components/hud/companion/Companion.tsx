import { AudioKeys, KeyNames, KeybindActions, Scenes } from "@game/constants";
import { useAnimate } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaEyeSlash, FaUndo } from "react-icons/fa";
import { usePersistentStore } from "src/game/stores/PersistentStore";
import { usePrimodium } from "src/hooks/usePrimodium";
import { useWidgets } from "../../../hooks/providers/WidgetProvider";
import { Button, IconButton } from "../../core/Button";
import { Card, SecondaryCard } from "../../core/Card";
import { MapButton } from "../MapButton";
import { MenuButtons } from "../MenuButtons";

export const WidgetButton: React.FC<{
  imageUri: string;
  tooltipText: string;
  visible: boolean;
  className?: string;
  text?: string;
  onOpen: () => void;
  onClose: () => void;
  onDoubleClick?: () => void;
  disable?: boolean;
  hotkey?: KeybindActions;
  active: boolean;
}> = ({ hotkey, imageUri, tooltipText, visible, onClose, onOpen, className, text, disable = false, active }) => {
  const primodium = usePrimodium();
  const [hideHotkeys] = usePersistentStore((state) => [state.hideHotkeys]);
  const {
    hooks: { useKeybinds },
  } = useRef(primodium.api(Scenes.UI)).current;
  const keybinds = useKeybinds();

  const keybindId = hotkey ? keybinds[hotkey]?.entries().next().value[0] : "";

  return (
    <div className="relative">
      {!hideHotkeys && hotkey && (
        <p className="absolute top-1 z-30 right-4 translate-x-full -translate-y-1/2 flex text-xs kbd kbd-xs">
          {KeyNames[keybindId] ?? keybindId ?? "?"}
        </p>
      )}
      <IconButton
        imageUri={imageUri}
        tooltipText={tooltipText}
        tooltipDirection="top"
        text={text}
        clickSound={!visible ? AudioKeys.DataPoint : AudioKeys.Sequence3}
        onClick={() => {
          if (!visible) onOpen();
          else onClose();
        }}
        disabled={disable || !active}
        className={`border btn-md btn-neutral border-secondary/50 bg-opacity-25 rounded-tl-lg text-lg hover:z-20 hover:drop-shadow-hard transition-all ${
          visible ? "border-warning bg-warning/25" : "bg-secondary/25"
        } ${!active ? "!bg-error/50 !border-error" : ""} ${className}`}
      />
    </div>
  );
};

export const WidgetControls = () => {
  const { widgets } = useWidgets();

  return (
    <div className="flex flex-col items-center w-full space-y-2 z-10">
      <div className="flex justify-center items-center text-center bg-neutral/50 w-full p-1">
        <p className="text-sm text-warning font-bold">{`WIDGETS`}</p>
      </div>

      <div className="flex">
        <div className="border border-r-0 border-secondary w-2 self-stretch m-2" />
        <div className="grid grid-cols-6 gap-2">
          {widgets.map((widget) => {
            return (
              <WidgetButton
                key={widget.name}
                imageUri={widget.image}
                tooltipText={widget.name}
                visible={widget.visible}
                hotkey={widget.hotkey}
                onOpen={widget.open}
                onClose={widget.close}
                onDoubleClick={widget.reset}
                active={widget.active}
              />
            );
          })}
          <WidgetButton
            imageUri="/img/icons/specialicon.png"
            tooltipText="custom (COMING SOON)"
            visible={false}
            onOpen={() => {}}
            onClose={() => {}}
            disable
            active
          />
        </div>
        <div className="border border-l-0 border-secondary w-2 self-stretch m-2" />
      </div>
    </div>
  );
};

export const Actions = () => {
  const { widgets } = useWidgets();

  const closeAll = useCallback(() => {
    widgets.forEach((widget) => widget.close());
  }, [widgets]);

  const resetAll = useCallback(() => {
    widgets.forEach((widget) => widget.reset());
  }, [widgets]);

  const numOpen = useMemo(() => widgets.filter((widget) => widget.visible && widget.active).length, [widgets]);

  const primodium = usePrimodium();
  const {
    hooks: { useKeybinds },
  } = useRef(primodium.api(Scenes.UI)).current;

  const [hideHotkeys] = usePersistentStore((state) => [state.hideHotkeys]);
  const keybinds = useKeybinds();

  return (
    <div className="w-full">
      <div className="w-full flex items-center border-t border-secondary/25">
        <MapButton />
        <Button
          onClick={numOpen == 0 ? resetAll : closeAll}
          className="relative btn-md btn-neutral bg-opacity-25 border-l-secondary/25 border text-lg"
          tooltip={numOpen == 0 ? "reset all" : "close all"}
        >
          {!hideHotkeys && (
            <p className="absolute top-1 z-10 right-4 translate-x-full -translate-y-1/2 flex text-xs kbd kbd-xs">
              {keybinds[KeybindActions.HideAll]?.entries().next().value[0] ?? "?"}
            </p>
          )}
          {numOpen == 0 ? <FaUndo /> : <FaEyeSlash className="text-error" />}
        </Button>
      </div>
    </div>
  );
};

export const WidgetsPane = () => {
  return (
    <>
      <Card className="p-2 border border-accent/25 -ml-12 mb-2 z-10 pointer-events-auto">
        <div className="absolute top-0 -translate-y-full pb-2 right-0"></div>
        <SecondaryCard className="flex flex-col items-center gap-3 border-2 border-accent/50 !p-0">
          <WidgetControls />
          <Actions />
        </SecondaryCard>

        <p className="absolute -bottom-4 -right-3 bg-neutral/75 px-2">
          <span className="opacity-50">{"///"}</span>
          <span className="text-accent">PRIMODIUM</span>
        </p>
      </Card>
      <div className="pl-2 z-0">
        <MenuButtons />
      </div>
    </>
  );
};

export const Companion = () => {
  const primodium = usePrimodium();
  const {
    hooks: { useKeybinds },
    input: { addListener },
  } = useRef(primodium.api(Scenes.UI)).current;
  const keybinds = useKeybinds();
  const [minimized, setMinimized] = useState(false);
  const [scope, animate] = useAnimate();

  useEffect(() => {
    const listener = addListener(KeybindActions.SpacerockMenu, () => {
      setMinimized((prev) => !prev);
    });

    return () => {
      listener.dispose();
    };
  }, [addListener]);

  useEffect(() => {
    if (minimized) {
      animate(scope.current, { translateY: "50%" }, { duration: 0.2 });
    } else animate(scope.current, { translateY: "0%" }, { duration: 0.2 });
  }, [minimized, scope, animate]);

  const [hideHotkeys] = usePersistentStore((state) => [state.hideHotkeys]);
  return (
    <div className="w-full">
      <div ref={scope} className={`relative flex items-center`}>
        {!minimized && <div className="absolute bg-black inset-0 blur-3xl opacity-50" />}
        <div className={`relative z-20 pointer-events-none`}>
          <img
            src="/img/companion/idle.gif"
            className={`pixel-images h-48 mr-4 ${!minimized ? "pointer-events-none" : "pointer-events-auto"}`}
            onClick={() => minimized && setMinimized(false)}
          />
          <div className="absolute w-fit bottom-2 right-1/2 translate-x-1/2">
            <Button
              className="uppercase drop-shadow-hard text-xs bg-error !bg-opacity-100 btn-xs flex items-center"
              onClick={() => setMinimized(true)}
            >
              {"<"} HIDE
              {!hideHotkeys && (
                <p className="absolute top-0 right-2 translate-x-full z-30 -translate-y-1/2 flex text-xs kbd kbd-xs">
                  {[keybinds[KeybindActions.SpacerockMenu]?.entries().next().value[0]] ?? "?"}
                </p>
              )}
            </Button>
          </div>
        </div>

        {!minimized && <WidgetsPane />}

        {minimized && (
          <p className="mb-5 drop-shadow-hard">
            PRESS{" "}
            <span className="kbd kbd-xs">
              {[keybinds[KeybindActions.SpacerockMenu]?.entries().next().value[0]] ?? "?"}
            </span>{" "}
            TO CALL <span className="text-accent">AURA</span>
          </p>
        )}
      </div>
    </div>
  );
};
