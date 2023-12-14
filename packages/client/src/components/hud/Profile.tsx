import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { formatEther } from "viem";
import { useMud } from "src/hooks";
import { Button } from "../core/Button";
import { useAccount } from "src/hooks/useAccount";
import { AccountDisplay } from "../shared/AccountDisplay";
import { FaLink } from "react-icons/fa";
import { components } from "src/network/components";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { Entity } from "@latticexyz/recs";
import { IconLabel } from "../core/IconLabel";
import { getSpaceRockImage } from "src/util/spacerock";
import { useFleetMoves } from "src/hooks/useFleetMoves";
import { EntityType, ResourceImage } from "src/util/constants";
import { getBuildingImage } from "src/util/building";
import { convertObjToParams, convertParamsToObj } from "src/util/params";

export const Profile = () => {
  const { network } = useMud();
  const playerEntity = network.playerEntity;
  const { linkedAddress, loading, wETHBalance } = useAccount(playerEntity);
  const mainBase = components.Home.use(playerEntity)?.mainBase;
  const asteroid = components.Home.use(playerEntity)?.asteroid;
  const mainbaseLevel = components.Level.use((mainBase ?? singletonEntity) as Entity)?.value ?? 1n;
  const fleetMoves = useFleetMoves();
  const mapOpen = components.MapOpen.use()?.value ?? false;
  const buildingImage = getBuildingImage((mainBase ?? singletonEntity) as Entity);

  const { search } = useLocation();
  const params = useMemo(() => convertParamsToObj(search), [search]);

  return (
    <div className="flex flex-row">
      <Button className="flex flex-col justify-end border-t-0 border-secondary rounded-t-none ml-2 w-24 h-[6.3rem] p-0">
        <IconLabel
          imageUri={mapOpen ? getSpaceRockImage((asteroid ?? singletonEntity) as Entity) : buildingImage}
          className="text-2xl scale-125 pt-3 pb-2"
        />
        <div className="bg-base-100 w-full rounded-box rounded-t-none p-1 border-t border-secondary">
          {!mapOpen && (
            <>
              <span className="text-accent">LVL.</span>
              {mainbaseLevel.toString()}
            </>
          )}
          {mapOpen && (
            <div className="flex justify-center items-center gap-1 w-full items-center">
              <IconLabel
                imageUri={ResourceImage.get(EntityType.FleetMoves) ?? ""}
                text={fleetMoves.toString()}
                tooltipText="Fleet Moves"
              />
              <span className="text-accent">LEFT</span>
            </div>
          )}
        </div>
      </Button>
      <div>
        <div className="flex flex-col p-1 bg-opacity-50 bg-neutral backdrop-blur-md rounded-box rounded-l-none rounded-t-none text-sm border border-secondary border-l-0">
          <div className="flex gap-2 items-center justify-center">
            <AccountDisplay player={playerEntity} />
          </div>
          <hr className="border-secondary/50" />
          <div className="flex gap-1 text-right w-full justify-end px-2 border-secondary/50 pt-1">
            {formatEther(wETHBalance)}
            <p className="font-bold text-success">wETH</p>
          </div>
        </div>
        {!linkedAddress?.address && !loading && (
          <Button
            className="btn-xs btn-secondary btn-ghost flex gap-1 m-auto text-accent mt-1"
            onClick={() => {
              console.log("opened string");
              console.log(convertObjToParams({ ...params, tab: "link" }));
              window.open(`/account${convertObjToParams({ ...params, tab: "link" })}`);
            }}
          >
            <FaLink /> LINK ADDRESS
          </Button>
        )}
      </div>
    </div>
  );
};
