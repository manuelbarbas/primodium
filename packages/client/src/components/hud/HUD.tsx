import { KeyNames, KeybindActions } from "@game/constants";
import { Entity, hasComponent } from "@latticexyz/recs";
import { FaArrowRight, FaCircle } from "react-icons/fa";
import { useSettingsStore } from "src/game/stores/SettingsStore";
import { useMud } from "src/hooks";
import { usePrimodium } from "src/hooks/usePrimodium";
import { components } from "src/network/components";
import { getBuildingName } from "src/util/building";
import { formatNumber } from "src/util/common";
import { Action } from "src/util/constants";
import { getSpaceRockName } from "src/util/spacerock";
import { Card } from "../core/Card";
import { HUD } from "../core/HUD";
import { IconLabel } from "../core/IconLabel";
import { Modal } from "../core/Modal";
import { Tabs } from "../core/Tabs";
import { BrandingLabel } from "../shared/BrandingLabel";
import { Blueprints } from "./Blueprints";
import { CurrentObjective } from "./CurrentObjective";
import { Minimap } from "./Minimap";
import { Profile } from "./Profile";
import { Score } from "./Score";
import { SelectAction } from "./SelectAction";
import { BuildingMenu } from "./building-menu/BuildingMenu";
import { Chat as _Chat } from "./chat/Chat";
import { Leaderboard } from "./modals/leaderboard/Leaderboard";
import { Settings } from "./modals/settings/Settings";
import { ReinforcementFleets } from "./panes/FriendlyFleets";
import { OwnedAsteroids } from "./panes/OwnedAsteroids";
import { BattleReports } from "./panes/battle-reports/BattleReports";
import { HostileFleets } from "./panes/hostile-fleets/HostileFleets";
import { SpacerockMenu } from "./spacerock-menu/SpacerockMenu";

export const GameHUD = () => {
  const {
    playerAccount: { entity: playerEntity },
  } = useMud();

  const activeRock = components.ActiveRock.use()?.value;
  const ownedBy = components.OwnedBy.use(activeRock ?? undefined)?.value;
  const isSpectating = ownedBy !== playerEntity;
  const uiScale = useSettingsStore((state) => state.uiScale);

  const mapOpen = components.MapOpen.use(undefined, {
    value: false,
  }).value;

  return (
    <div className="screen-container font-mono">
      <HUD scale={uiScale}>
        <HUD.CursorFollower>
          <HoverInfo />
        </HUD.CursorFollower>
        <HUD.TopMiddle>
          <TopActions isSpectating={isSpectating} />
        </HUD.TopMiddle>

        {!isSpectating && (
          <HUD.TopLeft>
            <Profile />
          </HUD.TopLeft>
        )}

        {!isSpectating && (
          <HUD.TopRight>
            {
              <div className="flex flex-col">
                <CurrentObjective />
                {mapOpen && <Minimap />}
              </div>
            }
          </HUD.TopRight>
        )}

        {!isSpectating && <HUD.Right>{mapOpen ? <Asteroids /> : <BuildingSelection />}</HUD.Right>}
        {isSpectating && (
          <HUD.TopRight>
            <p className="text-accent text-2xl font-bold p-5 flex gap-2 items-center">
              <FaCircle size={12} className="animate-pulse text-error" />
              LIVE
            </p>
          </HUD.TopRight>
        )}

        <HUD.Left>
          <Chat />
        </HUD.Left>

        <HUD.BottomMiddle>
          <SpacerockMenu />
        </HUD.BottomMiddle>
      </HUD>

      <HUD>
        <HUD.BottomRight>
          <BrandingLabel />
        </HUD.BottomRight>
      </HUD>
    </div>
  );
};

const BuildingSelection = () => {
  const selectedBuilding = components.SelectedBuilding.use()?.value;
  const action = components.SelectedAction.use()?.value;
  const primodium = usePrimodium();
  const {
    hooks: { useKeybinds },
  } = primodium.api();
  const keybinds = useKeybinds();

  return (
    <>
      {(!selectedBuilding || action === Action.PlaceBuilding) && (
        <Tabs className="flex flex-row justify-center items-center gap-0" defaultIndex={-1}>
          <Tabs.Button
            index={0}
            togglable
            keybind={KeybindActions.Blueprint}
            onClick={() => {
              components.SelectedBuilding.remove();
              components.SelectedAction.remove();
            }}
            className="rounded-r-none m-0 border-r-0 btn-md border-warning relative py-4 hover:text-accent group"
          >
            <IconLabel imageUri="img/icons/blueprinticon.png" className="text-2xl scale-125 " />
            <p
              style={{
                writingMode: "vertical-rl",
                textOrientation: "sideways",
              }}
              className=" absolute tracking-widest uppercase font-bold -rotate-180 right-0 bottom-full my-4 mr-2 opacity-75 bg-secondary/25 rounded-box backdrop-blur-md p-2 group-hover:ring-1"
            >
              blueprints
            </p>

            <div className="absolute kbd kbd-xs bottom-0 left-0 -translate-x-1/2 translate-y-1/2">
              {KeyNames[keybinds[KeybindActions.Blueprint]?.entries().next().value[0]] ??
                keybinds[KeybindActions.Blueprint]?.entries().next().value[0]}
            </div>
          </Tabs.Button>

          <Tabs.Pane index={0} className="rounded-r-none border-r-0 z-10 overflow-y-visible relative">
            <Blueprints />
          </Tabs.Pane>
        </Tabs>
      )}
      {selectedBuilding && (!action || action === Action.MoveBuilding) && (
        <Tabs className="flex flex-row justify-center items-center gap-0">
          <Tabs.Button
            index={0}
            togglable
            onClick={() => components.SelectedBuilding.remove()}
            className="rounded-r-none m-0 border-r-0 btn-md border-accent relative hover:text-accent group"
          >
            <FaArrowRight />
          </Tabs.Button>

          <Tabs.Pane index={0} className="rounded-r-none border-r-0 z-10 overflow-y-visible">
            <BuildingMenu />
          </Tabs.Pane>
        </Tabs>
      )}
    </>
  );
};

const Asteroids = () => {
  return (
    <Tabs className="flex flex-row justify-center items-center gap-0" defaultIndex={-1}>
      <Tabs.Button
        index={0}
        togglable
        className="rounded-r-none m-0 border-r-0 btn-md border-warning relative py-4 hover:text-accent group"
      >
        <IconLabel imageUri="img/icons/asteroidicon.png" className="text-2xl" />
        <p
          style={{
            writingMode: "vertical-rl",
            textOrientation: "sideways",
          }}
          className=" absolute tracking-widest uppercase font-bold -rotate-180 right-0 bottom-full my-4 mr-2 opacity-75 bg-secondary/25 rounded-box backdrop-blur-md p-2 group-hover:ring-1"
        >
          asteroids
        </p>
      </Tabs.Button>
      <Tabs.Pane index={0} className="rounded-r-none border-r-0 z-10 h-[400px] w-[350px] overflow-x-hidden">
        <OwnedAsteroids />
      </Tabs.Pane>
    </Tabs>
  );
};

const FleetsPane = () => (
  <Tabs className="flex flex-col items-center gap-2 w-full h-full">
    <div className="flex gap-1 w-full">
      <Tabs.Button index={0} showActive className="flex-1 btn-md hover:text-accent hover:bg-accent">
        Friendly
      </Tabs.Button>
      <Tabs.Button index={1} showActive className="flex-1 btn-md hover:text-accent hover:bg-accent">
        Hostile
      </Tabs.Button>
    </div>
    <Tabs.Pane index={0} className="rounded-r-none z-10 w-full h-full">
      <ReinforcementFleets />
    </Tabs.Pane>

    <Tabs.Pane index={1} className="rounded-r-none z-10 w-full h-full">
      <HostileFleets />
    </Tabs.Pane>
  </Tabs>
);

const TopActions: React.FC<{ isSpectating: boolean }> = ({ isSpectating }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="flex z-10">
        {
          <span className="flex flex-col gap-1 mt-1">
            <Modal title="leaderboard">
              <Modal.Button className="rounded-r-none border border-secondary btn-sm">
                <IconLabel
                  imageUri="/img/icons/leaderboardicon.png"
                  tooltipText="leaderboard"
                  tooltipDirection="left"
                />
              </Modal.Button>
              <Modal.Content className="w-[40rem] h-[50rem]">
                <Leaderboard />
              </Modal.Content>
            </Modal>
            <Modal title="battles">
              <Modal.Button className="rounded-r-none border border-secondary btn-sm">
                <IconLabel imageUri="/img/icons/reportsicon.png" tooltipText="battles" tooltipDirection="left" />
              </Modal.Button>
              <Modal.Content className="w-[30rem] h-[50rem]">
                <BattleReports />
              </Modal.Content>
            </Modal>
          </span>
        }
        <SelectAction isSpectating={isSpectating} />
        <span className="flex flex-col gap-1 mt-1">
          <Modal title="Fleets">
            <Modal.Button className="rounded-l-none border border-secondary btn-sm">
              <IconLabel imageUri="/img/icons/outgoingicon.png" tooltipText="Fleets" tooltipDirection="right" />
            </Modal.Button>
            <Modal.Content className="w-[50rem] h-[50rem]">
              <FleetsPane />
            </Modal.Content>
          </Modal>
          <Modal title="settings">
            <Modal.Button className="rounded-l-none border border-secondary btn-sm">
              <IconLabel imageUri="/img/icons/settingsicon.png" tooltipText="settings" tooltipDirection="right" />
            </Modal.Button>
            <Modal.Content className="w-132 h-96">
              <Settings />
            </Modal.Content>
          </Modal>
        </span>
      </div>
      {!isSpectating && <Score />}
    </div>
  );
};

const Chat = () => {
  const primodium = usePrimodium();
  const {
    hooks: { useKeybinds },
  } = primodium.api()!;
  const keybinds = useKeybinds();

  return (
    <Tabs className="flex flex-row justify-center items-center gap-0" defaultIndex={-1}>
      <Tabs.Pane index={0} className="rounded-l-none border-l-0 z-10">
        <_Chat />
      </Tabs.Pane>
      <Tabs.Button
        index={0}
        togglable
        keybind={KeybindActions.Chat}
        className="rounded-l-none m-0 border-l-0 btn-md border-secondary relative py-4 hover:text-accent group"
      >
        <IconLabel imageUri="img/icons/chaticon.png" className="text-2xl" />
        <p
          style={{
            writingMode: "vertical-rl",
            textOrientation: "sideways",
          }}
          className=" absolute tracking-widest uppercase font-bold -rotate-180 left-0 bottom-full my-4 ml-2 opacity-75 bg-secondary/25 rounded-box backdrop-blur-md p-2 group-hover:ring-1"
        >
          chat
        </p>
        <div className="absolute kbd kbd-xs bottom-0 right-0 translate-x-1/2 translate-y-1/2">
          {KeyNames[keybinds[KeybindActions.Chat]?.entries().next().value[0]] ??
            keybinds[KeybindActions.Chat]?.entries().next().value[0]}
        </div>
      </Tabs.Button>
    </Tabs>
  );
};

const HoverInfo = () => {
  const BuildingInfo: React.FC<{ entity: Entity }> = ({ entity }) => {
    const buildingName = getBuildingName(entity);

    return (
      <Card className="ml-5 uppercase font-bold text-xs relative">
        <div className="absolute top-0 left-0 w-full h-full topographic-background-sm opacity-50" />
        <p className="z-10">{buildingName}</p>
      </Card>
    );
  };

  const RockInfo: React.FC<{ entity: Entity }> = ({ entity }) => {
    const rockName = getSpaceRockName(entity);

    return (
      <Card className="ml-5 uppercase font-bold text-xs relative">
        <div className="absolute top-0 left-0 w-full h-full topographic-background-sm opacity-50" />
        <p className="z-10">{rockName}</p>
      </Card>
    );
  };

  const ArrivalInfo: React.FC<{ entity: Entity }> = ({ entity }) => {
    const arrival = components.Arrival.getWithId(entity);
    const now = components.Time.use()?.value ?? 0n;

    if (!arrival) return <></>;

    return (
      <Card className="ml-5 uppercase font-bold text-xs relative">
        <div className="absolute top-0 left-0 w-full h-full topographic-background-sm opacity-50" />
        <p className="z-10">
          <b className="text-accent">{formatNumber(arrival.arrivalTime - now)}</b> sec remaining
        </p>
      </Card>
    );
  };

  const hoverEntity = components.HoverEntity.use()?.value;

  if (!hoverEntity) return <></>;

  if (hasComponent(components.BuildingType, hoverEntity)) return <BuildingInfo entity={hoverEntity} />;

  if (hasComponent(components.Asteroid, hoverEntity)) return <RockInfo entity={hoverEntity} />;

  if (hasComponent(components.Arrival, hoverEntity)) return <ArrivalInfo entity={hoverEntity} />;

  return <></>;
};
