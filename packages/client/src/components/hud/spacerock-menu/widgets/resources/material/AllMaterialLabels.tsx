import { EntityType } from "src/util/constants";
import { MaterialLabel } from "./MaterialLabel";
import { SecondaryCard } from "src/components/core/Card";
import { Tabs } from "src/components/core/Tabs";
import { FaCaretLeft, FaCaretRight } from "react-icons/fa";
import { UtilityLabel } from "../utilities/UtilityLabel";

export const AllMaterialLabels = () => {
  return (
    <div className="flex flex-col items-center m-2">
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
              <MaterialLabel name={"Iron"} resource={EntityType.Iron} />
              <MaterialLabel name={"Copper"} resource={EntityType.Copper} />
              <MaterialLabel name={"Lithium"} resource={EntityType.Lithium} />
              <MaterialLabel name={"Sulfur"} resource={EntityType.Sulfur} />
            </SecondaryCard>
            <div className="flex gap-1 pt-1">
              <div className="rounded-full w-2 h-1 bg-accent" />
              <div className="rounded-full w-1.5 h-1 bg-base-100" />
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
              <MaterialLabel name={"Iron Plate"} resource={EntityType.IronPlate} />
              <MaterialLabel name={"PV Cell"} resource={EntityType.PVCell} />
              <MaterialLabel name={"Alloy"} resource={EntityType.Alloy} />
            </SecondaryCard>
            <div className="flex gap-1 pt-1">
              <div className="rounded-full w-1.5 h-1 bg-base-100" />
              <div className="rounded-full w-2 h-1 bg-accent" />
              <div className="rounded-full w-1.5 h-1 bg-base-100" />
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
              <Tabs.Button index={3} className="btn-ghost btn-xs text-accent">
                <FaCaretRight size={12} />
              </Tabs.Button>
            </div>
            <SecondaryCard className="flex flex-row w-fit gap-1 m-1">
              <MaterialLabel name={"Titanium"} resource={EntityType.Titanium} />
              <MaterialLabel name={"Platinum"} resource={EntityType.Platinum} />
              <MaterialLabel name={"Iridium"} resource={EntityType.Iridium} />
              <MaterialLabel name={"Kimberlite"} resource={EntityType.Kimberlite} />
            </SecondaryCard>
            <div className="flex gap-1 pt-1">
              <div className="rounded-full w-1.5 h-1 bg-base-100" />
              <div className="rounded-full w-1.5 h-1 bg-base-100" />
              <div className="rounded-full w-2 h-1 bg-accent" />
              <div className="rounded-full w-1.5 h-1 bg-base-100" />
            </div>
          </div>
        </Tabs.Pane>
        <Tabs.Pane index={3} fragment className="items-center border-none p-0">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1">
              <Tabs.Button index={1} className="btn-ghost btn-xs text-accent">
                <FaCaretLeft size={12} />
              </Tabs.Button>
              <p className="text-xs opacity-75 font-bold">UNRAIDABLE RESOURCES</p>
              <Tabs.Button index={-1} disabled className="btn-ghost btn-xs text-accent">
                <FaCaretRight size={12} />
              </Tabs.Button>
            </div>
            <SecondaryCard className="flex flex-row w-fit gap-1 m-1">
              <UtilityLabel name={"Unraidable Resources"} resourceId={EntityType.Unraidable} />
              <UtilityLabel name={"Unraidable Motherlode Resources"} resourceId={EntityType.AdvancedUnraidable} />
            </SecondaryCard>
            <div className="flex gap-1 pt-1">
              <div className="rounded-full w-1.5 h-1 bg-base-100" />
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
