import { Entity } from "@latticexyz/recs";
// import { Button } from "src/components/core/Button";
import { Navigator } from "src/components/core/Navigator";
// import { TransactionQueueMask } from "src/components/shared/TransactionQueueMask";
// import { components } from "src/network/components";
// import { EMap } from "contracts/config/enums";
// import { useAsteroidInfo } from "@/hooks/useSpaceRock";
// import { entityToRockName } from "@/util/name";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { Card } from "@/components/core/Card";
// import { AsteroidHover } from "@/components/hud/hover/AsteroidHover";
import { components } from "@/network/components";
// import { AsteroidLoading } from "@/components/hud/AsteroidLoading";
// import { ShardAsteroidHover } from "@/components/hud/hover/ShardAsteroidHover";
import { IconLabel } from "@/components/core/IconLabel";
import { Button } from "@/components/core/Button";
import { Mode } from "@/util/constants";
import { singletonEntity } from "@latticexyz/store-sync/recs";

export const AsteroidMenu: React.FC<{ selectedRock: Entity }> = ({ selectedRock }) => {
  // const asteroidData = components.Asteroid.get(selectedRock);

  // const RenderScreen = () => {
  //   switch (asteroidData?.mapId) {
  //     case EMap.:
  //       return <MainBase building={selectedBuilding} />;
  //     case EntityType.WormholeBase:
  //       return <WormholeBase building={selectedBuilding} />;
  //     case EntityType.DroneFactory:
  //     case EntityType.Workshop:
  //       return <UnitFactory building={selectedBuilding} />;
  //     case EntityType.Shipyard:
  //       return <Shipyard building={selectedBuilding} />;
  //     case EntityType.Market:
  //       return <Market building={selectedBuilding} />;
  //     default:
  //       return <Basic building={selectedBuilding} />;
  //   }
  // };

  const InitialScreen = () => {
    const playerEntity = components.Account.use()?.value;
    const ownedBy = components.OwnedBy.use(selectedRock)?.value;
    const selectedAsteroid = components.SelectedRock.use()?.value;

    return (
      <Navigator.Screen title="initial" className="gap-2">
        <Navigator.NavButton to="send" size="md" variant="error">
          <div className="flex flex-start px-1 gap-3 w-full">
            <IconLabel className="text-lg" imageUri={InterfaceIcons.Outgoing} />
            <div className="flex flex-col items-start">
              <p>MOVE</p>
              <p className="block text-xs opacity-75">SEND YOUR FLEETS</p>
            </div>
          </div>
        </Navigator.NavButton>
        <Button size="content" variant="neutral">
          <div className="flex flex-start px-1 gap-3 w-full">
            <IconLabel className="text-lg" imageUri={InterfaceIcons.Command} />
            <div className="flex flex-col items-start">
              <p>MANAGe</p>
              <p className="block text-xs opacity-75">ENGAGE WITH FLEETS IN ORBIT</p>
            </div>
          </div>
        </Button>
        <Button
          size="content"
          variant="neutral"
          onClick={() => {
            components.ActiveRock.set({ value: selectedAsteroid ?? singletonEntity });
            ownedBy === playerEntity
              ? components.SelectedMode.set({ value: Mode.Asteroid })
              : components.SelectedMode.set({ value: Mode.Spectate });
          }}
        >
          <div className="flex flex-start px-1 gap-3 w-full">
            <IconLabel
              className="text-lg"
              imageUri={ownedBy === playerEntity ? InterfaceIcons.Build : InterfaceIcons.Spectate}
            />
            <div className="flex flex-col items-start">
              <p>{ownedBy === playerEntity ? "BUILD" : "SPECTATE"}</p>
              <p className="block text-xs opacity-75">
                {ownedBy === playerEntity ? "RETURN TO ASTEROID" : "MONITOR LIVE ASTEROID ACTIVIY"}
              </p>
            </div>
          </div>
        </Button>
      </Navigator.Screen>
    );
  };

  return (
    <Card noDecor>
      <Navigator initialScreen="initial" className="border-none p-0 relative overflow-visible flex flex-col gap-2">
        {/* Initial Screen */}
        <InitialScreen />
      </Navigator>
    </Card>
  );
};
