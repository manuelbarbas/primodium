import { primodium } from "@game/api";
import { Scenes } from "@game/constants";
import { Entity } from "@latticexyz/recs";
import { ESendType, EUnit } from "contracts/config/enums";
import { useMemo } from "react";
import { BiSolidInvader } from "react-icons/bi";
import { FaShieldAlt } from "react-icons/fa";
import { Badge } from "src/components/core/Badge";
import { Button } from "src/components/core/Button";
import { Modal } from "src/components/core/Modal";
import { TransactionQueueMask } from "src/components/shared/TransactionQueueMask";
import { useMud } from "src/hooks";
import { useAccount } from "src/hooks/useAccount";
import { components } from "src/network/components";
import { TransactionQueueType, UnitEntityLookup } from "src/util/constants";
import { decodeEntity, hashEntities } from "src/util/encode";
import { getSpaceRockName } from "src/util/spacerock";
import { getUnitStats } from "src/util/trainUnits";
import { invade } from "src/util/web3/contractCalls/invade";
import { raid } from "src/util/web3/contractCalls/raid";
import { recallArrival } from "src/util/web3/contractCalls/recall";
import { reinforce } from "src/util/web3/contractCalls/reinforce";

export const LabeledValue: React.FC<{
  label: string;
  children?: React.ReactNode;
}> = ({ children = null, label }) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <p className="text-xs font-bold text-cyan-400">{label}</p>
      <div className="flex items-center gap-1">{children}</div>
    </div>
  );
};

export const Fleet: React.FC<{
  arrivalEntity: Entity;
  arrivalTime: bigint;
  destination: Entity;
  sendType: ESendType;
  dontShowButton?: boolean;
  small?: boolean;
}> = ({ arrivalTime, arrivalEntity, destination, sendType, dontShowButton, small }) => {
  const timeRemaining = arrivalTime - (components.Time.use()?.value ?? 0n);

  const owner = components.OwnedBy.use(destination)?.value as Entity | undefined;
  const name = getSpaceRockName(destination);

  const { allianceName, address, linkedAddress } = useAccount(owner);

  const attack = useMemo(() => {
    const units = components.Arrival.getEntity(arrivalEntity);
    if (!units) return 0n;
    return units.unitCounts.reduce((acc, curr, index) => {
      if (curr === 0n) return acc;
      const entity = UnitEntityLookup[(index + 1) as EUnit];
      const unitStats = getUnitStats(entity, units.from).ATK;
      return acc + unitStats * curr;
    });
  }, [arrivalEntity]);

  const onCoordinateClick = async () => {
    const coord = components.Position.get(destination, {
      x: 0,
      y: 0,
      parent: "0" as Entity,
    });

    if (!coord) return;
    const mapOpen = components.MapOpen.get(undefined, {
      value: false,
    }).value;

    if (!mapOpen) {
      const { transitionToScene } = primodium.api().scene;

      await transitionToScene(Scenes.Asteroid, Scenes.Starmap);
    }

    const { pan, zoomTo } = primodium.api(Scenes.Starmap).camera;

    components.MapOpen.set({ value: true });
    components.SelectedBuilding.remove();
    components.SelectedRock.set({ value: destination });

    pan(coord);

    zoomTo(2);
  };

  return (
    <div className="flex items-center justify-between w-full border rounded-box border-slate-700 bg-slate-800 pr-1">
      <div className="flex gap-1 justify-between items-center h-full w-full">
        <div className="flex gap-1 items-center h-full">
          {sendType === ESendType.Invade && (
            <div className="rounded-box bg-rose-800 gap-1 p-1 flex flex-col items-center h-full justify-center items-center">
              <BiSolidInvader size={16} />
              {!small && <p className="bg-rose-900 border border-rose-500 rounded-box px-1 text-[.6rem]">INVADE</p>}
            </div>
          )}
          {sendType === ESendType.Raid && (
            <div className="rounded-box bg-rose-800 gap-1 p-1 flex flex-col items-center h-full justify-center">
              <BiSolidInvader size={16} />
              {!small && <p className="bg-rose-900 border border-rose-500 rounded-box px-1 text-[.6rem]">RAID</p>}
            </div>
          )}
          {sendType === ESendType.Reinforce && (
            <div className="rounded-box bg-green-800 gap-1 p-1 flex flex-col items-center h-full justify-center">
              <FaShieldAlt size={16} />
              {!small && (
                <p className="bg-green-900 border border-green-500  rounded-box px-1 text-[.6rem]">REINFORCE</p>
              )}
            </div>
          )}
          <Badge className="text-xs flex flex-col items-center h-fit bg-transparent border-none">
            <p className="text-lg leading-5">{attack.toLocaleString()}</p> ATK
          </Badge>

          <p className="animate-pulse opacity-80">{timeRemaining > 0 ? "IN TRANSIT" : "ORBITING"}</p>
        </div>
        <div className="flex gap-5 items-center">
          <Modal.CloseButton className="btn-sm" onClick={onCoordinateClick}>
            {owner ? (
              <>
                {allianceName && <span className="font-bold text-accent text-xs">[{allianceName.toUpperCase()}]</span>}
                <p className="text-xs">{linkedAddress?.ensName ?? address}</p>
              </>
            ) : (
              <p className="text-xs">{name}</p>
            )}
          </Modal.CloseButton>
          <div className="text-right">
            {timeRemaining > 0 ? (
              <LabeledValue label="ETA">
                <div className="flex gap-1 text-xs">
                  <p>{timeRemaining.toLocaleString()}</p>
                  <span className="opacity-50">SEC</span>
                </div>
              </LabeledValue>
            ) : (
              !dontShowButton && <OrbitActionButton arrivalEntity={arrivalEntity} sendType={sendType} small={small} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const OrbitActionButton: React.FC<{
  arrivalEntity: Entity;
  sendType: ESendType;
  small?: boolean;
}> = ({ arrivalEntity, sendType, small }) => {
  const network = useMud().network;
  const destination = components.Arrival.getEntity(arrivalEntity)?.destination;
  if (!destination) return <></>;

  const { key } = decodeEntity(components.MapItemArrivals.metadata.keySchema, arrivalEntity);
  const transactionId = hashEntities(TransactionQueueType.Recall, key, destination);

  const action =
    sendType == ESendType.Invade
      ? () => invade(destination, network, key)
      : sendType == ESendType.Raid
      ? () => raid(destination, network, key)
      : () => reinforce(arrivalEntity, network);

  return (
    <TransactionQueueMask queueItemId={transactionId as Entity}>
      <div className={`flex gap-1 ${small ? "flex-col-reverse gap-0" : ""}`}>
        <Button
          className={`${small ? "btn-xs" : "btn-sm"} opacity-75`}
          onClick={() => recallArrival(arrivalEntity, network)}
        >
          RECALL
        </Button>

        <Button
          className={`${small ? "btn-xs" : "btn-sm"} ${
            sendType == ESendType.Reinforce ? "bg-green-800" : "bg-rose-800"
          }`}
          onClick={action}
        >
          {sendType === ESendType.Invade && "INVADE"}
          {sendType === ESendType.Raid && "RAID"}
          {sendType === ESendType.Reinforce && "REINFORCE"}
        </Button>
      </div>
    </TransactionQueueMask>
  );
};
