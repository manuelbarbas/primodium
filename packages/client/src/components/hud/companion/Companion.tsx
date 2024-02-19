import { AudioKeys, KeybindActions, Scenes } from "@game/constants";
import { Button, IconButton } from "../../core/Button";
import { Card, SecondaryCard } from "../../core/Card";
import { usePrimodium } from "src/hooks/usePrimodium";
import { UpgradeUnit } from "../building-menu/screens/UpgradeUnit";
import { Modal } from "../../core/Modal";
import { useEffect, useRef, useState } from "react";
import { useWidget } from "../../../hooks/providers/WidgetProvider";

export const WidgetButton: React.FC<{
  imageUri: string;
  tooltipText: string;
  visible: boolean;
  onOpen: () => void;
  onClose: () => void;
}> = ({ imageUri, tooltipText, visible, onClose, onOpen }) => {
  return (
    <IconButton
      imageUri={imageUri}
      tooltipText={tooltipText}
      tooltipDirection="bottom"
      clickSound={AudioKeys.DataPoint}
      onClick={() => {
        if (!visible) onOpen();
        else onClose();
      }}
      className={`border btn-md btn-neutral border-secondary/50 bg-opacity-25 rounded-tl-xl ${
        visible ? "border-warning" : ""
      }`}
    />
  );
};

export const WidgetControls = () => {
  const { widgets } = useWidget();

  return (
    <div className="flex flex-col items-center w-full space-y-2 z-10">
      <p className="text-sm text-warning text-center bg-neutral/50 w-full font-bold">{`WIDGETS`}</p>
      <div className="flex">
        <div className="border border-r-0 border-secondary w-2 self-stretch m-2" />
        <div className="grid grid-cols-5 gap-2">
          {widgets.map((widget) => {
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

export const Actions = () => {
  return (
    <div className="w-full">
      <div className="w-full flex items-center">
        <IconButton
          imageUri="img/icons/blueprinticon.png"
          text="BUILD"
          className="btn-md grow btn-info bg-opacity-75"
        />
        <Modal title="upgrade units">
          <Modal.IconButton
            className="btn-md btn-base-100 bg-opacity-50"
            imageUri="/img/unit/trident_marine.png"
            tooltipDirection="right"
            tooltipText="upgrade units"
          />
          <Modal.Content>
            <UpgradeUnit />
          </Modal.Content>
        </Modal>
      </div>
    </div>
  );
};

export const PrimeOS = () => {
  return (
    <Card className="p-2 border border-accent/25 -ml-8 drop-shadow-hard">
      <SecondaryCard className="flex flex-col items-center gap-3 border-2 border-accent/50 !p-0 drop-shadow-hard">
        <WidgetControls />
        <Actions />
      </SecondaryCard>
      <p className="absolute -bottom-4 right-0">
        <span className="opacity-50">{"///"}</span>PRIME<span className="text-accent">OS</span>
      </p>
    </Card>
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
    <div className="w-132">
      <div className={`relative flex items-center ${minimized ? "translate-y-1/2" : ""}`}>
        {/* <SecondaryCard className="uppercase drop-shadow-hard absolute w-fit min-w-64 origin-bottom-left -top-4 text-accent">
          this is a tip from prime
        </SecondaryCard> */}
        <div className={`relative z-10`}>
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
