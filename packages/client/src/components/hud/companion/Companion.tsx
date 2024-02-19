import { AudioKeys, KeybindActions, Scenes } from "@game/constants";
import { Button, IconButton } from "../../core/Button";
import { Card, SecondaryCard } from "../../core/Card";
import { usePrimodium } from "src/hooks/usePrimodium";
import { Modal } from "../../core/Modal";
import { useEffect, useRef, useState } from "react";
import { useWidgets } from "../../../hooks/providers/WidgetProvider";
import { Settings } from "../modals/settings/Settings";
import { MenuButtons } from "../MenuButtons";
import { MapButton } from "../MapButton";

export const WidgetButton: React.FC<{
  imageUri: string;
  tooltipText: string;
  visible: boolean;
  className?: string;
  text?: string;
  onOpen: () => void;
  onClose: () => void;
}> = ({ imageUri, tooltipText, visible, onClose, onOpen, className, text }) => {
  return (
    <IconButton
      imageUri={imageUri}
      tooltipText={tooltipText}
      tooltipDirection="bottom"
      text={text}
      clickSound={!visible ? AudioKeys.DataPoint : AudioKeys.Sequence3}
      onClick={() => {
        if (!visible) onOpen();
        else onClose();
      }}
      className={`border btn-md btn-neutral border-secondary/50 bg-opacity-25 rounded-tl-lg  drop-shadow-hard ${
        visible ? "border-warning bg-warning/25" : "bg-secondary/25"
      } ${className}`}
    />
  );
};

export const WidgetControls = () => {
  const { widgets } = useWidgets();

  return (
    <div className="flex flex-col items-center w-full space-y-2 z-10">
      <p className="text-sm text-warning text-center bg-neutral/50 w-full font-bold">{`WIDGETS`}</p>
      <div className="flex">
        <div className="border border-r-0 border-secondary w-2 self-stretch m-2" />
        <div className="grid grid-cols-5 gap-2">
          {widgets
            .filter((widget) => widget.name !== "blueprints")
            .map((widget) => {
              return (
                <WidgetButton
                  key={widget.name}
                  imageUri={widget.image}
                  tooltipText={widget.name}
                  visible={widget.visible}
                  onOpen={widget.open}
                  onClose={widget.close}
                />
              );
            })}
        </div>
        <div className="border border-l-0 border-secondary w-2 self-stretch m-2" />
      </div>
    </div>
  );
};

const BlueprintsButton = () => {
  const { useWidget } = useWidgets();
  const widget = useWidget("blueprints");

  if (!widget) return null;

  return (
    <WidgetButton
      className={`grow !rounded-none ${!widget.visible ? "!bg-info/75" : ""}`}
      text={widget.name}
      imageUri={widget.image}
      tooltipText={widget.name}
      visible={widget.visible}
      onOpen={widget.open}
      onClose={widget.close}
    />
  );
};

export const Actions = () => {
  return (
    <div className="w-full">
      <div className="w-full flex items-center">
        <BlueprintsButton />
        <Modal title="settings">
          <Modal.IconButton
            className="btn-md btn-base-100 bg-opacity-50"
            imageUri="/img/icons/settingsicon.png"
            tooltipDirection="right"
            tooltipText="settings"
          />
          <Modal.Content className="w-132 h-120">
            <Settings />
          </Modal.Content>
        </Modal>
      </div>
    </div>
  );
};

export const PrimeOS = () => {
  return (
    <>
      <Card className="p-2 border border-accent/25 -ml-8 drop-shadow-hard z-10">
        <div className="absolute top-0 -translate-y-full pb-2 right-0">
          <MapButton />
        </div>
        <SecondaryCard className="flex flex-col items-center gap-3 border-2 border-accent/50 !p-0 drop-shadow-hard">
          <WidgetControls />
          <Actions />
        </SecondaryCard>

        <p className="absolute -bottom-4 right-0">
          <span className="opacity-50">{"///"}</span>PRIME<span className="text-accent">OS</span>
        </p>
      </Card>
      <div className="pl-2">
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

  useEffect(() => {
    const listener = addListener(KeybindActions.SpacerockMenu, () => {
      setMinimized((prev) => !prev);
    });

    return () => {
      listener.dispose();
    };
  }, [addListener]);

  return (
    <div className="w-full">
      <div className={`relative flex items-center ${minimized ? "translate-y-1/2" : ""}`}>
        {!minimized && <div className="absolute bg-black inset-0 blur-3xl opacity-50" />}
        {/* <SecondaryCard className="uppercase drop-shadow-hard absolute w-fit min-w-64 origin-bottom-left -top-4 text-accent">
          this is a tip from prime
        </SecondaryCard> */}

        <div className={`relative z-20`}>
          <img
            src="/img/jarvis.png"
            className="drop-shadow-hard pixel-images h-44 m-4 pointer-events-auto"
            onClick={() => setMinimized((prev) => !prev)}
          />
          <div className="absolute w-fit bottom-2 right-1/2 translate-x-1/2">
            <Button className="uppercase drop-shadow-hard text-xs bg-error !bg-opacity-100 btn-xs flex items-center">
              {"<"} HIDE
              <p className="absolute top-0 right-2 translate-x-full -translate-y-1/2 flex text-xs kbd kbd-xs">
                {[keybinds[KeybindActions.SpacerockMenu]?.entries().next().value[0]] ?? "?"}
              </p>
            </Button>
          </div>
        </div>

        {!minimized && <PrimeOS />}

        {minimized && (
          <p className="mb-5">
            PRESS{" "}
            <span className="kbd kbd-xs">
              {[keybinds[KeybindActions.SpacerockMenu]?.entries().next().value[0]] ?? "?"}
            </span>{" "}
            TO OPEN <span className="text-accent">PRIME</span>
          </p>
        )}
      </div>
    </div>
  );
};
