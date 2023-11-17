import { Entity } from "@latticexyz/recs";
import { useState } from "react";
import { IconButton } from "src/components/core/Button";
import { SecondaryCard } from "src/components/core/Card";
import { Join } from "src/components/core/Join";
import { Tabs } from "src/components/core/Tabs";
import { getBlockTypeName } from "src/util/common";
import { ResourceImage, ResourceStorages } from "src/util/constants";

export const Marketplace = () => {
  const [selectedItem, setSelectedItem] = useState<Entity | null>(null);

  return (
    <div className="grid grid-cols-5 gap-2 h-full w-full absolute p-2">
      <SecondaryCard className="col-span-1 overflow-auto scrollbar space-y-2">
        {Array.from(ResourceStorages).map((resource) => (
          <IconButton
            key={resource}
            onClick={() => {
              setSelectedItem(resource);
            }}
            className={`${selectedItem === resource ? "bg-base-300 border-accent" : ""}`}
            imageUri={ResourceImage.get(resource) ?? ""}
            text={getBlockTypeName(resource)}
          />
        ))}
      </SecondaryCard>
      <SecondaryCard className="col-span-4 h-full w-full">
        <Tabs className="h-full flex flex-col items-center">
          <Join className="w-fit">
            <Tabs.Button index={0}>Listings</Tabs.Button>
            <Tabs.Button index={0}>Activity</Tabs.Button>
          </Join>
          <Tabs.Pane index={0} className="w-full grow">
            listings
          </Tabs.Pane>
        </Tabs>
      </SecondaryCard>
    </div>
  );
};
