import { primodium } from "@game/api";
import { Scenes } from "@game/constants";
import { Entity } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { ESendType } from "contracts/config/enums";
import { BiSolidInvader } from "react-icons/bi";
import { FaCrosshairs, FaShieldAlt } from "react-icons/fa";
import { Button } from "src/components/core/Button";
import { components } from "src/network/components";
import { useNow } from "src/util/time";
import { OrbitActionButton } from "./OrbitActionButton";

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

export const LocateButton: React.FC<{
  destination: Entity;
  coord: Coord;
}> = ({ destination, coord }) => {
  return (
    <Button
      className="btn-secondary btn-sm btn-square flex"
      onClick={async () => {
        const mapOpen = components.MapOpen.get(undefined, {
          value: false,
        }).value;

        if (!mapOpen) {
          const { transitionToScene } = primodium.api().scene;

          await transitionToScene(Scenes.Asteroid, Scenes.Starmap);
          components.MapOpen.set({ value: true });
        }

        const { pan, zoomTo } = primodium.api(Scenes.Starmap).camera;

        components.Send.setDestination(destination);

        pan(coord);

        zoomTo(2);
      }}
    >
      <FaCrosshairs />
    </Button>
  );
};

export const Fleet: React.FC<{
  arrivalEntity: Entity;
  arrivalTime: bigint;
  destination: Entity;
  sendType: ESendType;
  outgoing: boolean;
}> = ({ arrivalTime, arrivalEntity, destination, sendType, outgoing }) => {
  const destinationPosition = components.Position.use(destination, {
    x: 0,
    y: 0,
    parent: "0" as Entity,
  });
  const timeRemaining = arrivalTime - useNow();

  return (
    <div className="flex items-center justify-between w-full border rounded-md border-slate-700 bg-slate-800 ">
      <div className="flex gap-1 items-center">
        {sendType === ESendType.Invade && (
          <div className="rounded-md bg-rose-800 gap-1 p-1 mr-2 flex flex-col items-center w-20">
            <BiSolidInvader size={16} />
            <p className="bg-rose-900 border border-rose-500  rounded-md px-1 text-[.6rem]">INVADE</p>
          </div>
        )}
        {sendType === ESendType.Raid && (
          <div className="rounded-md bg-rose-800 gap-1 p-1 mr-2 flex flex-col items-center w-20">
            <BiSolidInvader size={16} />
            <p className="bg-rose-900 border border-rose-500  rounded-md px-1 text-[.6rem]">RAID</p>
          </div>
        )}
        {sendType === ESendType.Reinforce && (
          <div className="rounded-md bg-green-800 gap-1 p-1 mr-2 flex flex-col items-center w-20">
            <FaShieldAlt size={16} />
            <p className="bg-green-900 border border-green-500  rounded-md px-1 text-[.6rem]">REINFORCE</p>
          </div>
        )}
        <LabeledValue label={`${timeRemaining > 0 ? "IN-TRANSIT" : "ORBITING"}`}>
          <p>
            [{destinationPosition.x}, {destinationPosition.y}]
          </p>
        </LabeledValue>
      </div>
      <div className="text-right mr-2">
        {timeRemaining > 0 ? (
          <LabeledValue label="ETA">
            <div className="flex gap-1">
              <p>{timeRemaining.toLocaleString()}</p>
              <span className="opacity-50">SEC</span>
            </div>
          </LabeledValue>
        ) : ESendType.Reinforce === sendType ? (
          <OrbitActionButton arrivalEntity={arrivalEntity} destination={destination} outgoing={outgoing} />
        ) : (
          <LocateButton destination={destination} coord={destinationPosition} />
        )}
      </div>
    </div>
  );
};
