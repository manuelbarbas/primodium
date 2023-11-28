import { EntityType } from "src/util/constants";
import { OreLabel } from "./OreLabel";
import { SecondaryCard } from "src/components/core/Card";
import { Tabs } from "src/components/core/Tabs";
import { FaCaretLeft, FaCaretRight } from "react-icons/fa";

export const AllOreLabels = () => {
  return (
    <div className="flex flex-col items-center">
      <Tabs>
        <Tabs.Pane index={0} fragment className="items-center border-none p-0">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1">
              <Tabs.Button index={-1} disabled className="btn-ghost btn-xs text-accent">
                <FaCaretLeft size={12} />
              </Tabs.Button>
              <p className="text-xs opacity-75 font-bold">BASIC RESOURCES</p>
              <Tabs.Button index={1} className="btn-ghost btn-xs text-accent">
                <FaCaretRight size={12} />
              </Tabs.Button>
            </div>
            <SecondaryCard className="flex flex-row w-fit gap-1 m-1">
              <OreLabel name={"Iron"} resource={EntityType.Iron} />
              <OreLabel name={"Copper"} resource={EntityType.Copper} />
              <OreLabel name={"Lithium"} resource={EntityType.Lithium} />
              <OreLabel name={"Sulfur"} resource={EntityType.Sulfur} />
            </SecondaryCard>
            <div className="flex gap-1">
              <div className="rounded-full w-2 h-1 bg-accent" />
              <div className="rounded-full w-1.5 h-1 bg-base-100" />
              <div className="rounded-full w-1.5 h-1 bg-base-100" />
            </div>
          </div>
        </Tabs.Pane>
        <Tabs.Pane index={1} fragment className="items-center border-none p-0">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1">
              <Tabs.Button index={0} className="btn-ghost btn-xs text-accent">
                <FaCaretLeft size={12} />
              </Tabs.Button>
              <p className="text-xs opacity-75 font-bold">CRAFTED RESOURCES</p>
              <Tabs.Button index={2} className="btn-ghost btn-xs text-accent">
                <FaCaretRight size={12} />
              </Tabs.Button>
            </div>
            <SecondaryCard className="flex flex-row w-fit gap-1 m-1">
              <OreLabel name={"Iron Plate"} resource={EntityType.IronPlate} />
              <OreLabel name={"PV Cell"} resource={EntityType.PVCell} />
              <OreLabel name={"Alloy"} resource={EntityType.Alloy} />
            </SecondaryCard>
            <div className="flex gap-1">
              <div className="rounded-full w-1.5 h-1 bg-base-100" />
              <div className="rounded-full w-2 h-1 bg-accent" />
              <div className="rounded-full w-1.5 h-1 bg-base-100" />
            </div>
          </div>
        </Tabs.Pane>
        <Tabs.Pane index={2} fragment className="items-center border-none p-0">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1">
              <Tabs.Button index={1} className="btn-ghost btn-xs text-accent">
                <FaCaretLeft size={12} />
              </Tabs.Button>
              <p className="text-xs opacity-75 font-bold">MOTHERLODE RESOURCES</p>
              <Tabs.Button index={-1} disabled className="btn-ghost btn-xs text-accent">
                <FaCaretRight size={12} />
              </Tabs.Button>
            </div>
            <SecondaryCard className="flex flex-row w-fit gap-1 m-1">
              <OreLabel name={"Titanium"} resource={EntityType.Titanium} />
              <OreLabel name={"Platinum"} resource={EntityType.Platinum} />
              <OreLabel name={"Iridium"} resource={EntityType.Iridium} />
              <OreLabel name={"Kimberlite"} resource={EntityType.Kimberlite} />
            </SecondaryCard>
            <div className="flex gap-1">
              <div className="rounded-full w-1.5 h-1 bg-base-100" />
              <div className="rounded-full w-1.5 h-1 bg-base-100" />
              <div className="rounded-full w-2 h-1 bg-accent" />
            </div>
          </div>
        </Tabs.Pane>
      </Tabs>
    </div>
  );
};
