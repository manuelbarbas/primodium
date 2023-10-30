import { Entity } from "@latticexyz/recs";
import { ESendType } from "contracts/config/enums";
import { FaPlus, FaTrash } from "react-icons/fa";
import { Button } from "src/components/core/Button";
import { SecondaryCard } from "src/components/core/Card";
import { Navigator } from "src/components/core/Navigator";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { getBlockTypeName } from "src/util/common";
import { BackgroundImage, toHex32 } from "src/util/constants";
import { toUnitCountArray } from "src/util/send";
import { send } from "src/util/web3/contractCalls/send";
import { Hex } from "viem";

export const SendFleet: React.FC = () => {
  const network = useMud().network;
  const playerEntity = network.playerEntity;
  const sendType = components.Send.get()?.sendType ?? ESendType.Invade;
  const units = components.Send.useUnits();
  const numUnits = Object.keys(units).length;

  const sendFleet = (sendType: ESendType) => {
    const origin = components.Send.get()?.origin;
    const destination = components.Send.get()?.destination;

    if (origin == undefined || destination === undefined) return;

    const originCoord = components.Position.get(origin) ?? { x: 0, y: 0 };
    const destinationCoord = components.Position.get(destination) ?? { x: 0, y: 0 };

    const to = components.OwnedBy.get(destination)?.value as Entity | undefined;

    //TODO: fix arrival units
    send(toUnitCountArray(units), sendType, originCoord, destinationCoord, (to as Hex) ?? toHex32("0"), network);

    components.Send.reset(playerEntity);
  };

  return (
    <Navigator.Screen title="Send" className="">
      <SecondaryCard className="w-full items-center">
        {numUnits !== 0 && (
          <div className="relative grid grid-cols-8 gap-2 items-center justify-center min-h-full w-full p-1">
            {Object.entries(units).map(([rawUnit, value], index) => {
              if (value == 0n) return null;
              const unit = rawUnit as Entity;
              return (
                <Button
                  key={index}
                  className="btn-square inline-flex items-center group hover:scale-110 transition-transform border-secondary"
                  onClick={() => components.Send.removeUnit(unit)}
                >
                  <div className="relative">
                    <img
                      src={BackgroundImage.get(unit)?.at(0) ?? "/img/icons/debugicon.png"}
                      className="w-full h-full"
                    />
                    <p className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 font-bold text-xs bg-slate-900 border-cyan-400/30 px-1 rounded-md border group-hover:opacity-0">
                      {value.toString()}
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
        {numUnits === 0 && (
          <Navigator.NavButton to="UnitSelection" className="btn-secondary w-fit m-4">
            + Add units from hangar
          </Navigator.NavButton>
        )}
      </SecondaryCard>
      <div className="flex gap-2 mt-1">
        {sendType === ESendType.Invade && (
          <Navigator.BackButton className="btn-error border-none" onClick={() => sendFleet(ESendType.Invade)}>
            INVADE
          </Navigator.BackButton>
        )}
        {sendType === ESendType.Reinforce && (
          <Navigator.BackButton className="btn-success border-none" onClick={() => sendFleet(ESendType.Reinforce)}>
            REINFORCE
          </Navigator.BackButton>
        )}
        {sendType === ESendType.Raid && (
          <Navigator.BackButton className="btn-error border-none" onClick={() => sendFleet(ESendType.Raid)}>
            RAID
          </Navigator.BackButton>
        )}
        <Navigator.BackButton />
      </div>
    </Navigator.Screen>
  );
};
