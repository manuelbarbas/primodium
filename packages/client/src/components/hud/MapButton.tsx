import { useCallback, useEffect, useMemo } from "react";

import { Button } from "@/components/core/Button";
import { IconLabel } from "@/components/core/IconLabel";
import { usePersistentStore } from "@game/stores/PersistentStore";
import { useMud } from "@/hooks";
import { usePrimodium } from "@/hooks/usePrimodium";
import { components } from "@/network/components";
import { EntityType, ResourceImage } from "@/util/constants";

export const MapButton = () => {
  const {
    playerAccount: { entity: playerEntity },
  } = useMud();
  const mapOpen = components.MapOpen.use(undefined, {
    value: false,
  }).value;

  const activeRock = components.ActiveRock.use()?.value;
  const ownedBy = components.OwnedBy.use(activeRock)?.value;
  const primodium = usePrimodium();

  const isSpectating = useMemo(() => ownedBy !== playerEntity, [ownedBy, playerEntity]);

  const closeMap = useCallback(async () => {
    primodium.api("STARMAP").util.closeMap();
  }, [primodium]);

  const openMap = useCallback(async () => {
    primodium.api("STARMAP").util.openMap();
  }, [primodium]);

  const [hideHotkeys] = usePersistentStore((state) => [state.hideHotkeys]);
  useEffect(() => {
    const starmapListener = primodium.api("STARMAP").input.addListener("Map", closeMap);

    const asteroidListener = primodium.api("ASTEROID").input.addListener("Map", openMap);

    return () => {
      starmapListener.dispose();
      asteroidListener.dispose();
    };
  }, []);

  return (
    <Button
      className={`relative flex grow w-80 btn-sm !p-3 !px-10 gap-5 filter group hover:scale-110 hover:z-50 star-background-sm hover:border-secondary hover:drop-shadow-hard`}
      clickSound={"Sequence"}
      onClick={!mapOpen ? openMap : closeMap}
    >
      {!mapOpen && !isSpectating && <IconLabel imageUri="/img/icons/starmapicon.png" className="text-xl" />}
      {!mapOpen && isSpectating && <IconLabel imageUri="/img/icons/returnicon.png" className="text-xl" />}
      {mapOpen && <IconLabel imageUri="/img/icons/minersicon.png" className="text-xl" />}
      <p className="uppercase">
        {!mapOpen ? (isSpectating ? "stop spectating" : "open star map") : "Return to building"}
      </p>
      {!hideHotkeys && (
        <p className="absolute top-1 z-10 right-4 translate-x-full -translate-y-1/2 flex text-xs kbd kbd-xs">M</p>
      )}
      {/* button decor */}
      {!mapOpen && (
        <div className="z-40">
          <img
            src={ResourceImage.get(EntityType.ColonyShip)}
            className="pixel-images absolute origin-right -top-10 right-12 opacity-0 scale-x-[-100%] -translate-x-1/2 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 ease-out pointer-events-none"
          />
          <img
            src={ResourceImage.get(EntityType.StingerDrone)}
            className="pixel-images absolute origin-right -bottom-4 right-12 opacity-0 scale-x-[-50%] scale-y-[50%] -translate-x-1/2 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"
          />
        </div>
      )}
      {mapOpen && (
        <div className="z-40">
          <img
            src={ResourceImage.get(EntityType.Iron)}
            className="pixel-images absolute origin-right -top-5 -right-5 opacity-0 -translate-x-1/2 group-hover:translate-x-0 group-hover:scale-[150%] group-hover:opacity-100 transition-all duration-500 pointer-events-none"
          />
          <img
            src={ResourceImage.get(EntityType.Copper)}
            className="pixel-images absolute origin-right -bottom-1 right-8 opacity-0 scale-x-[0] scale-y-[0] -translate-x-1/2 group-hover:translate-x-0 group-hover:scale-y-[100%] group-hover:scale-x-[-100%] group-hover:opacity-100 transition-all duration-300 pointer-events-none"
          />
        </div>
      )}
    </Button>
  );
};
