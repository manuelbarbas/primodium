import { EntityID } from "@latticexyz/recs";
import { BiSolidInvader } from "react-icons/bi";
import { FaCrosshairs, FaShieldAlt } from "react-icons/fa";
import {
  BlockNumber,
  MapOpen,
  Send,
} from "src/network/components/clientComponents";
import { ESendType } from "src/util/web3/types";
import { OrbitActionButton } from "./OrbitActionButton";
import { Position } from "src/network/components/chainComponents";
import { Button } from "src/components/core/Button";
import { primodium } from "@game/api";
import { Scenes } from "@game/constants";
import { Coord } from "@latticexyz/utils";

export const LabeledValue: React.FC<{
  label: string;
  children?: React.ReactNode;
}> = ({ children = null, label }) => {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-bold text-cyan-400">{label}</p>
      <div className="flex items-center gap-1">{children}</div>
    </div>
  );
};

export const LocateButton: React.FC<{ coord: Coord }> = ({ coord }) => {
  return (
    <Button
      className="btn-secondary btn-sm btn-square flex"
      onClick={async () => {
        const mapOpen = MapOpen.get(undefined, {
          value: false,
        }).value;

        if (!mapOpen) {
          const { transitionToScene } = primodium.api().scene;

          await transitionToScene(Scenes.Asteroid, Scenes.Starmap);
          MapOpen.set({ value: true });
        }

        const { pan, zoomTo } = primodium.api(Scenes.Starmap).camera;

        Send.setDestination(coord);

        pan(coord);

        zoomTo(2);
      }}
    >
      <FaCrosshairs />
    </Button>
  );
};

export const Fleet: React.FC<{
  arrivalEntity: EntityID;
  arrivalBlock: string;
  destination: EntityID;
  sendType: ESendType;
  outgoing: boolean;
}> = ({ arrivalBlock, arrivalEntity, destination, sendType, outgoing }) => {
  const blockNumber = BlockNumber.use()?.value;

  const destinationPosition = Position.use(destination, {
    x: 0,
    y: 0,
    parent: "0" as EntityID,
  });
  const arrivalTime = Number(arrivalBlock) - (blockNumber ?? 0);

  return (
    <div className="flex items-center justify-between w-full border rounded-md border-slate-700 bg-slate-800 ">
      <div className="flex gap-1 items-center">
        {sendType === ESendType.INVADE && (
          <div className="rounded-md bg-rose-800 gap-1 p-1 mr-2 flex flex-col items-center w-20">
            <BiSolidInvader size={16} />
            <p className="bg-rose-900 border border-rose-500  rounded-md px-1 text-[.6rem]">
              INVADE
            </p>
          </div>
        )}
        {sendType === ESendType.RAID && (
          <div className="rounded-md bg-rose-800 gap-1 p-1 mr-2 flex flex-col items-center w-20">
            <BiSolidInvader size={16} />
            <p className="bg-rose-900 border border-rose-500  rounded-md px-1 text-[.6rem]">
              RAID
            </p>
          </div>
        )}
        {sendType === ESendType.REINFORCE && (
          <div className="rounded-md bg-green-800 gap-1 p-1 mr-2 flex flex-col items-center w-20">
            <FaShieldAlt size={16} />
            <p className="bg-green-900 border border-green-500  rounded-md px-1 text-[.6rem]">
              REINFORCE
            </p>
          </div>
        )}
        <LabeledValue label={`${arrivalTime > 0 ? "IN-TRANSIT" : "ORBITING"}`}>
          <p>
            [{destinationPosition.x}, {destinationPosition.y}]
          </p>
        </LabeledValue>
      </div>
      <div className="text-right mr-2">
        {arrivalTime > 0 ? (
          <LabeledValue label="ETA">
            <div className="flex gap-1">
              <p>{arrivalTime}</p>
              <span className="opacity-50">BLOCKS</span>
            </div>
          </LabeledValue>
        ) : (
          <>
            {ESendType.REINFORCE === sendType ? (
              <OrbitActionButton
                entity={arrivalEntity}
                destination={destination}
                sendType={sendType}
                outgoing={outgoing}
              />
            ) : (
              <LocateButton coord={destinationPosition} />
            )}
          </>
        )}
      </div>
    </div>
  );
};
