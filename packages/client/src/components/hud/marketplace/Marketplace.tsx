import { Entity } from "@latticexyz/recs";
import { EResource } from "contracts/config/enums";
import { useState } from "react";
import { IconButton } from "src/components/core/Button";
import { SecondaryCard } from "src/components/core/Card";
import { Join } from "src/components/core/Join";
import { Tabs } from "src/components/core/Tabs";
import { components } from "src/network/components";
import { ValueSansMetadata } from "src/network/components/customComponents/ExtendedComponent";
import { getBlockTypeName } from "src/util/common";
import { ResourceImage, ResourceStorages } from "src/util/constants";
import { CreateOrderForm } from "./CreateOrderForm";
import { TakeOrderForm } from "./TakeOrderForm";

const dummyListings: (ValueSansMetadata<typeof components.MarketplaceOrder.schema> & { id: Entity })[] = [
  {
    price: 1n,
    resource: EResource.Iron,
    count: 10n,
    seller: "0x1234" as Entity,
    id: "0x12341" as Entity,
  },
  {
    price: 2n,
    resource: EResource.Copper,
    count: 10n,
    seller: "0x1234" as Entity,
    id: "0x12342" as Entity,
  },
  {
    price: 3n,
    resource: EResource.Lithium,
    count: 10n,
    seller: "0x0000000000000000000000001480401012880d5ada228345007b986e6ab68bd2" as Entity,
    id: "0x0000000000000000000000001480401012880d5ada228345007b986e6ab68bd2" as Entity,
  },
  {
    price: 4n,
    resource: EResource.Iron,
    count: 10n,
    seller: "0x1234" as Entity,
    id: "0x12344" as Entity,
  },
  {
    price: 5n,
    resource: EResource.Iron,
    count: 10n,
    seller: "0x1234" as Entity,
    id: "0x12345" as Entity,
  },
  {
    price: 6n,
    resource: EResource.Iron,
    count: 10n,
    seller: "0x1234" as Entity,
    id: "0x12346" as Entity,
  },
  {
    price: 1n,
    resource: EResource.Iron,
    count: 10n,
    seller: "0x1234" as Entity,
    id: "0x12347" as Entity,
  },
  {
    price: 1n,
    resource: EResource.Iron,
    count: 10n,
    seller: "0x1234" as Entity,
    id: "0x12348" as Entity,
  },
  {
    price: 1n,
    resource: EResource.Iron,
    count: 10n,
    seller: "0x1234" as Entity,
    id: "0x12349" as Entity,
  },
];

export type Listing = ValueSansMetadata<typeof components.MarketplaceOrder.schema> & { id: Entity };

export const Marketplace = () => {
  const [selectedItem, setSelectedItem] = useState<Entity>();
  return (
    <div className="grid grid-cols-5 gap-2 h-full w-full absolute p-2">
      <SecondaryCard className="col-span-1 overflow-auto scrollbar space-y-2">
        {Array.from(ResourceStorages).map((resource) => (
          <IconButton
            key={resource}
            onClick={() => {
              selectedItem === resource ? setSelectedItem(undefined) : setSelectedItem(resource);
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
            <Tabs.Button index={1}>Create Order</Tabs.Button>
          </Join>
          <Tabs.Pane index={0} className="w-full grow">
            <TakeOrderForm selectedItem={selectedItem} />
          </Tabs.Pane>
          <Tabs.Pane index={1} className="w-full grow">
            <CreateOrderForm />
          </Tabs.Pane>
        </Tabs>
      </SecondaryCard>
    </div>
  );
};
