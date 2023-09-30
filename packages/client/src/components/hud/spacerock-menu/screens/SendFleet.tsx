import { EntityID } from "@latticexyz/recs";
import { FaPlus, FaTrash } from "react-icons/fa";
import { Button } from "src/components/core/Button";
import { SecondaryCard } from "src/components/core/Card";
import { Navigator } from "src/components/core/Navigator";
import { useMud } from "src/hooks";
import { OwnedBy, Position } from "src/network/components/chainComponents";
import { Account, Send } from "src/network/components/clientComponents";
import { getBlockTypeName } from "src/util/common";
import { BackgroundImage } from "src/util/constants";
import { send } from "src/util/web3/send";
import { ESendType } from "src/util/web3/types";

export const SendFleet: React.FC = () => {
  const network = useMud();
  const sendType = Send.get()?.sendType ?? ESendType.INVADE;
  const units = Send.use()?.units ?? [];
  const count = Send.use()?.count ?? [];

  const sendFleet = (sendType: ESendType) => {
    const account = Account.get()?.value;
    const origin = Send.get()?.origin;
    const destination = Send.get()?.destination;

    if (
      account == undefined ||
      origin == undefined ||
      units === undefined ||
      units.length === 0 ||
      destination === undefined
    )
      return;

    const arrivalUnits = units.map((unit, index) => ({
      unitType: unit,
      count: count?.at(index) ?? 0,
    }));

    const originCoord = Position.get(origin) ?? { x: 0, y: 0 };
    const destinationCoord = Position.get(destination) ?? { x: 0, y: 0 };

    const to = OwnedBy.get(destination)?.value;

    send(
      arrivalUnits,
      sendType,
      originCoord,
      destinationCoord,
      to ?? ("0x00" as EntityID),
      network
    );

    Send.reset();
  };

  return (
    <Navigator.Screen title="Send" className="">
      <SecondaryCard className="w-full items-center">
        {units.length !== 0 && (
          <div className="relative grid grid-cols-8 gap-2 items-center justify-center min-h-full w-full p-1">
            {units.map((unit, index) => {
              return (
                <Button
                  key={index}
                  className="btn-square inline-flex items-center group hover:scale-110 transition-transform border-secondary"
                  onClick={() => Send.removeUnit(unit)}
                >
                  <div className="relative">
                    <img
                      src={
                        BackgroundImage.get(unit)?.at(0) ??
                        "/img/icons/debugicon.png"
                      }
                      className="w-full h-full"
                    />
                    <p className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 font-bold text-xs bg-slate-900 border-cyan-400/30 px-1 rounded-md border group-hover:opacity-0">
                      {Send.getUnitCount(unit)}
                    </p>
                  </div>

                  <FaTrash className="absolute bottom-1/2 left-1/2 -translate-x-1/2 translate-y-1/2 opacity-0 group-hover:opacity-100" />
                  <p className="opacity-0 absolute -bottom-5 text-xs bg-pink-900 group-hover:opacity-100 whitespace-nowrap transition-opacity rounded-md px-1">
                    {getBlockTypeName(unit)}
                  </p>
                </Button>
              );
            })}
            <Navigator.NavButton
              to="UnitSelection"
              className="relative button-square flex flex-col items-center group hover:scale-110 transition-transform hover:z-50"
            >
              <FaPlus size={14} />
            </Navigator.NavButton>
          </div>
        )}
        {units.length === 0 && (
          <Navigator.NavButton
            to="UnitSelection"
            className="btn-secondary w-fit m-4"
          >
            + Add units from hangar
          </Navigator.NavButton>
        )}
      </SecondaryCard>
      <div className="flex gap-2 mt-1">
        {sendType === ESendType.INVADE && (
          <Navigator.BackButton
            className="btn-error border-none"
            onClick={() => sendFleet(ESendType.INVADE)}
          >
            INVADE
          </Navigator.BackButton>
        )}
        {sendType === ESendType.REINFORCE && (
          <Navigator.BackButton
            className="btn-success border-none"
            onClick={() => sendFleet(ESendType.REINFORCE)}
          >
            REINFORCE
          </Navigator.BackButton>
        )}
        {sendType === ESendType.RAID && (
          <Navigator.BackButton
            className="btn-error border-none"
            onClick={() => sendFleet(ESendType.RAID)}
          >
            RAID
          </Navigator.BackButton>
        )}
        <Navigator.BackButton />
      </div>
    </Navigator.Screen>
  );
};
