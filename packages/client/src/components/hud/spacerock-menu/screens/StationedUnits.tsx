import { singletonEntity } from "@latticexyz/store-sync/recs";
import { Button } from "src/components/core/Button";
import { SecondaryCard } from "src/components/core/Card";
import { Navigator } from "src/components/core/Navigator";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { getBlockTypeName } from "src/util/common";
import { BackgroundImage } from "src/util/constants";
import { recallAll } from "src/util/web3/contractCalls/recall";

export const StationedUnits: React.FC = () => {
  const network = useMud().network;

  const destination = components.Send.get()?.destination;
  const { units, counts } = components.Hangar.use(destination, {
    units: [],
    counts: [],
  });

  return (
    <Navigator.Screen title="StationedUnits" className="">
      <p className="text-xs opacity-75 mb-1">STATIONED UNITS</p>
      <SecondaryCard className="w-full items-center">
        {units.length !== 0 && (
          <div className="relative grid grid-cols-8 gap-2 items-center justify-center min-h-full w-full p-1">
            {units.map((unit, index) => {
              return (
                <Button
                  key={index}
                  className="btn-square inline-flex items-center group hover:scale-110 transition-transform border-secondary"
                >
                  <div className="relative">
                    <img
                      src={BackgroundImage.get(unit)?.at(0) ?? "/img/icons/debugicon.png"}
                      className="w-full h-full"
                    />
                    <p className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 font-bold text-xs bg-slate-900 border-cyan-400/30 px-1 rounded-md border group-hover:opacity-0">
                      {Number(counts[index])}
                    </p>
                  </div>

                  <p className="opacity-0 absolute -bottom-5 text-xs bg-pink-900 group-hover:opacity-100 whitespace-nowrap transition-opacity rounded-md px-1">
                    {getBlockTypeName(unit)}
                  </p>
                </Button>
              );
            })}
          </div>
        )}
      </SecondaryCard>
      <div className="flex gap-2 mt-1">
        <Navigator.BackButton
          className="btn-secondary border-none"
          onClick={() => recallAll(destination ?? singletonEntity, network)}
        >
          RECALL
        </Navigator.BackButton>

        <Navigator.BackButton />
      </div>
    </Navigator.Screen>
  );
};
