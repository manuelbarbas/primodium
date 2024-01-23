import { ComponentValue } from "@latticexyz/recs";
import { ESendType } from "contracts/config/enums";
import { BiSolidInvader } from "react-icons/bi";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { entityToAddress } from "src/util/common";

export const LabeledValue: React.FC<{
  label: string;
  children: React.ReactNode;
}> = ({ children, label }) => {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-bold text-cyan-400">{label}</p>
      <div className="flex items-center gap-1">{children}</div>
    </div>
  );
};

export const AttackingFleet: React.FC<{
  fleet: ComponentValue<typeof components.Arrival.schema>;
}> = ({ fleet }) => {
  const {
    playerAccount: { entity: playerEntity },
  } = useMud();
  const { sendType, destination, arrivalTime } = fleet;

  const coord = components.Position.use(destination);

  const isHomeAsteroid = components.Home.get(playerEntity)?.value === destination;

  const time = components.Time.use()?.value ?? 0n;
  const timeRemaining = arrivalTime - time;

  return (
    <div
      className={`flex items-center justify-between w-full p-2 border rounded-md border-slate-700 bg-slate-800 ${
        isHomeAsteroid ? "border-cyan-700" : "border-slate-700"
      } `}
    >
      <div className="flex gap-1 items-center">
        <div className="rounded-md bg-rose-800 gap-1 p-1 mr-2 flex flex-col items-center w-20">
          <BiSolidInvader size={16} />
          <p className="bg-rose-900 border border-rose-500  rounded-md px-1 text-[.6rem]">
            {sendType === ESendType.Invade && "INVADE"}
            {sendType === ESendType.Raid && "RAID"}
          </p>
        </div>
        <LabeledValue label="TARGET">
          {coord && !isHomeAsteroid && (
            <p>
              [{coord.x},{coord.y}]
            </p>
          )}
          {isHomeAsteroid && <p>HOME</p>}
        </LabeledValue>
      </div>
      <div className="text-right">
        {timeRemaining <= 0n && (
          <LabeledValue label="ATTACKER">
            <div className="flex gap-1 text-right w-full">
              <p className="w-full">{entityToAddress(fleet.from, true)}</p>
            </div>
          </LabeledValue>
        )}
        {timeRemaining > 0n && (
          <LabeledValue label="ETA">
            <div className="flex gap-1 text-right w-full">
              <p className="w-full">{Math.max(Number(timeRemaining), 0)} SEC</p>
            </div>
          </LabeledValue>
        )}
      </div>
    </div>
  );
};
