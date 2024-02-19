import { KeybindActions } from "@game/constants";
import { Button, IconButton } from "../core/Button";
import { Card, SecondaryCard } from "../core/Card";
import { usePrimodium } from "src/hooks/usePrimodium";
import { UpgradeUnit } from "./building-menu/screens/UpgradeUnit";
import { Modal } from "../core/Modal";
import { IconLabel } from "../core/IconLabel";

export const Widgets = () => {
  return (
    <div className="flex flex-col items-center w-full space-y-2">
      <p className="text-sm text-warning text-center bg-neutral/50 w-full font-bold">{`ASTEROID APPS`}</p>
      <div className="flex">
        <div className="border border-r-0 border-secondary w-2 self-stretch m-2" />
        <div className="grid grid-cols-4 gap-2">
          <IconButton
            imageUri="img/icons/minersicon.png"
            tooltipText="Resources"
            className=" border btn-md btn-neutral border-secondary/50 bg-opacity-25"
          />
          <IconButton
            imageUri="img/icons/debugicon.png"
            tooltipText="Hangar"
            className=" border btn-md btn-neutral border-secondary/50 bg-opacity-25"
          />
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
          <Modal.Button className="btn-md btn-base-100 bg-opacity-50">
            <IconLabel imageUri="/img/unit/trident_marine.png" tooltipDirection="right" tooltipText="upgrade units" />
          </Modal.Button>
          <Modal.Content>
            <UpgradeUnit />
          </Modal.Content>
        </Modal>
      </div>
    </div>
  );
};

export const Companion = () => {
  const {
    hooks: { useKeybinds },
  } = usePrimodium().api();
  const keybinds = useKeybinds();

  return (
    <div className="w-120">
      {/* <SecondaryCard className="uppercase drop-shadow-hard absolute w-fit min-w-64 origin-bottom-left -top-4 text-accent">
          this is a tip from jarvis
        </SecondaryCard> */}

      <div className="relative flex items-center">
        <div className="relative z-10">
          <img src="/img/jarvis.png" className="drop-shadow-hard pixel-images h-44 m-4" />
          <div className="absolute w-fit bottom-2 right-1/2 translate-x-1/2">
            <Button className="uppercase drop-shadow-hard text-xs bg-error bg-opacity-100 btn-xs flex items-center">
              {"<"} HIDE{" "}
              <p className="absolute top-0 right-2 translate-x-full -translate-y-1/2 flex text-xs kbd kbd-xs">
                {[keybinds[KeybindActions.SpacerockMenu]?.entries().next().value[0]] ?? "?"}
              </p>
            </Button>
          </div>
        </div>

        <Card className="relative p-2 border border-accent/25 -ml-8 drop-shadow-hard">
          <SecondaryCard className="flex flex-col items-center gap-3 border-2 border-accent/50 !p-0 drop-shadow-hard">
            <Widgets />
            <Actions />
          </SecondaryCard>
          <p className="absolute -bottom-4 right-0">
            <span className="opacity-50">{"///"}</span>PRIME<span className="text-accent">OS</span>
          </p>
        </Card>
      </div>
    </div>
  );
};
