import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { FaHandshake, FaHandshakeSlash } from "react-icons/fa";
import { useSettingsStore } from "src/game/stores/SettingsStore";
import { useMud } from "src/hooks";
import { useFleetMoves } from "src/hooks/useFleetMoves";
import { components } from "src/network/components";
import { getBuildingImage } from "src/util/building";
import { EntityType, ResourceImage } from "src/util/constants";
import { getSpaceRockImage } from "src/util/spacerock";
import { Button } from "../core/Button";
import { IconLabel } from "../core/IconLabel";
import { Modal } from "../core/Modal";
import { Tooltip } from "../core/Tooltip";
import { AccountDisplay } from "../shared/AccountDisplay";
import { CurrencyDisplay } from "../shared/CurrencyDisplay";
import { Account } from "../transfer/Account";

export const Profile = () => {
  const {
    playerAccount: { entity: playerEntity, address },
    sessionAccount,
  } = useMud();
  const delegate = components.Delegate.use(playerEntity)?.value;
  const wETHBalance = components.WETHBalance.use(playerEntity)?.value ?? 0n;
  const mainBase = components.Home.use(playerEntity)?.mainBase;
  const asteroid = components.Home.use(playerEntity)?.asteroid;
  const mainbaseLevel = components.Level.use((mainBase ?? singletonEntity) as Entity)?.value ?? 1n;
  const fleetMoves = useFleetMoves();
  const mapOpen = components.MapOpen.use()?.value ?? false;
  const buildingImage = getBuildingImage((mainBase ?? singletonEntity) as Entity);
  const unitDisplay = useSettingsStore((state) => state.unitDisplay);

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
            <></>
            <AccountDisplay player={playerEntity} />{" "}
          </div>
          <hr className="border-secondary/50" />
          <div className="flex gap-1 text-right w-full justify-end items-center px-2 border-secondary/50 pt-1">
            <CurrencyDisplay wei={wETHBalance} className="font-bold text-sm" />
            <p className="font-bold text-success">{unitDisplay === "ether" ? "wETH" : "wGWEI"}</p>
          </div>
        </div>
        <Modal title="account">
          <Modal.Button className="btn-xs btn-ghost flex gap-2 m-auto text-accent mt-1">
            <Tooltip text={`${delegate ? "" : "not"} delegating`} direction="bottom">
              <div>
                {delegate ? (
                  <FaHandshake className="text-success w-4 h-4" />
                ) : (
                  <FaHandshakeSlash className="text-error w-4 h-4" />
                )}
              </div>
            </Tooltip>
            <p>MANAGE ACCOUNT</p>
          </Modal.Button>
          <Modal.Content className="w-[40rem] h-[50rem]">
            <Account />
          </Modal.Content>
        </Modal>
      </div>

      <div className="pointer-events-none text-xs">
        Session Account: {sessionAccount?.address ?? ""} <hr />
        Player Account : {address}
      </div>
    </div>
  );
};
