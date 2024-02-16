import { KeybindActions } from "@game/constants";
import { Button, IconButton } from "../core/Button";
import { SecondaryCard } from "../core/Card";
import { usePrimodium } from "src/hooks/usePrimodium";

export const Jarvis = () => {
  const {
    hooks: { useKeybinds },
  } = usePrimodium().api();
  const keybinds = useKeybinds();

  return (
    <div className="w-screen drop-shadow-hard">
      <div className="absolute bottom-0">
        <div className="w-full">
          <SecondaryCard className="uppercase font-pixel drop-shadow-hard absolute w-fit min-w-64 origin-bottom-left -top-4 text-accent">
            this is a tip from jarvis
          </SecondaryCard>
          <div className="relative flex items-center">
            <div className="relative">
              <img src="/img/jarvis.png" className="drop-shadow-hard pixel-images h-44 m-4" />
              <div className="absolute w-fit bottom-2 right-1/2 translate-x-1/2">
                <Button className="uppercase font-pixel drop-shadow-hard text-xs bg-error btn-xs flex items-center">
                  {"<"} HIDE{" "}
                  <p className="absolute top-0 right-2 translate-x-full -translate-y-1/2 flex text-xs kbd kbd-xs">
                    {[keybinds[KeybindActions.SpacerockMenu]?.entries().next().value[0]] ?? "?"}
                  </p>
                </Button>
              </div>
            </div>

            <div className="flex items-center">
              <div className="flex flex-col items-center">
                <p className="text-sm font-pixel text-warning text-center mb-1 bg-neutral/50 w-fit px-10">{`WIDGETS`}</p>
                <div className="flex">
                  <div className="border border-r-0 border-secondary w-2 self-stretch m-2" />
                  <div className="flex flex-col space-y-2">
                    <IconButton
                      imageUri="img/icons/blueprinticon.png"
                      text="blueprints"
                      className="font-pixel border btn-sm btn-secondary border-neutral-200"
                    />
                    <IconButton
                      imageUri="img/icons/minersicon.png"
                      text="resources"
                      className="font-pixel border btn-sm btn-secondary border-neutral-200"
                    />
                    <IconButton
                      imageUri="img/icons/debugicon.png"
                      text="hangar"
                      className="font-pixel border btn-sm btn-secondary border-neutral-200"
                    />
                  </div>
                  <div className="border border-l-0 border-secondary w-2 self-stretch m-2" />
                </div>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-sm font-pixel text-accent text-center mb-1 bg-neutral/50 w-fit px-10">{`GAME INFO`}</p>
                <div className="flex">
                  <div className="border border-r-0 border-secondary w-2 self-stretch m-2" />
                  <div className="flex flex-col space-y-2">
                    {/* <Profile /> */}

                    <IconButton
                      imageUri="img/icons/leaderboardicon.png"
                      text="LEADERBOARD"
                      className="font-pixel border-secondary btn-sm"
                    />
                    <IconButton
                      imageUri="img/icons/reportsicon.png"
                      text="Battle Reports"
                      className="font-pixel border border-secondary btn-sm"
                    />
                    <IconButton
                      imageUri="/img/unit/trident_marine.png"
                      text="Upgrade Units"
                      className="font-pixel border border-secondary btn-sm"
                    />
                  </div>

                  <div className="border border-l-0 border-secondary w-2 self-stretch m-2" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
