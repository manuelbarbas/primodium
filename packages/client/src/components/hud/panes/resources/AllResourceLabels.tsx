import { EntityType } from "src/util/constants";
import { ResourceLabel } from "./ResourceLabel";

export const AllResourceLabels = () => {
  return (
    <div className="flex flex-col items-end p-2">
      <div className="flex flex-col gap-2 w-full">
        <div className="flex border-b border-secondary justify-between w-full">
          <p className="text-xs opacity-75 font-bold text-success">BASIC</p>
          <div className="flex gap-1 items-center text-xs text-warning">*</div>
        </div>

        <div className="flex flex-col gap-1">
          <ResourceLabel name={"Iron"} resource={EntityType.Iron} />
          <ResourceLabel name={"Copper"} resource={EntityType.Copper} />
          <ResourceLabel name={"Lithium"} resource={EntityType.Lithium} />
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-2 w-full text-info">
        <div className="flex border-b border-secondary justify-between w-full">
          <p className="text-xs opacity-75 font-bold text-info">ADVANCED</p>
          <div className="flex gap-1 items-center text-xs text-warning">**</div>
        </div>
        <div className="flex flex-col gap-1">
          <ResourceLabel name={"Iron Plate"} resource={EntityType.IronPlate} />
          <ResourceLabel name={"PV Cell"} resource={EntityType.PVCell} />
          <ResourceLabel name={"Alloy"} resource={EntityType.Alloy} />
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-2 w-full">
        <div className="flex border-b border-secondary justify-between w-full">
          <p className="text-xs opacity-75 font-bold text-warning">ELITE</p>
          <div className="flex gap-1 items-center text-xs text-warning">***</div>
        </div>
        <div className="flex flex-col gap-1">
          <ResourceLabel name={"Titanium"} resource={EntityType.Titanium} />
          <ResourceLabel name={"Platinum"} resource={EntityType.Platinum} />
          <ResourceLabel name={"Iridium"} resource={EntityType.Iridium} />
          <ResourceLabel name={"Kimberlite"} resource={EntityType.Kimberlite} />
        </div>
      </div>

      {/* <Tabs>
        <Tabs.Pane index={0} fragment className="items-center border-none p-0">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1">
              <Tabs.Button index={-1} disabled className="btn-ghost btn-xs text-accent">
                <FaCaretLeft size={12} />
              </Tabs.Button>
              
              <Tabs.Button index={1} className="btn-ghost btn-xs text-accent">
                <FaCaretRight size={12} />
              </Tabs.Button>
            </div>
            <SecondaryCard className="flex flex-row w-fit gap-1 m-1">
              
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
              <ResourceLabel name={"Iron Plate"} resource={EntityType.IronPlate} />
              <ResourceLabel name={"PV Cell"} resource={EntityType.PVCell} />
              <ResourceLabel name={"Alloy"} resource={EntityType.Alloy} />
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
              <ResourceLabel name={"Titanium"} resource={EntityType.Titanium} />
              <ResourceLabel name={"Platinum"} resource={EntityType.Platinum} />
              <ResourceLabel name={"Iridium"} resource={EntityType.Iridium} />
              <ResourceLabel name={"Kimberlite"} resource={EntityType.Kimberlite} />
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
              <Tabs.Button index={2} className="btn-ghost btn-xs text-accent">
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
      </Tabs> */}
    </div>
  );
};
