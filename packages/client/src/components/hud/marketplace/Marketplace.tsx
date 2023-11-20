import { Entity } from "@latticexyz/recs";
import { EResource } from "contracts/config/enums";
import { useMemo, useState } from "react";
import { Badge } from "src/components/core/Badge";
import { Button, IconButton } from "src/components/core/Button";
import { SecondaryCard } from "src/components/core/Card";
import { Join } from "src/components/core/Join";
import { Tabs } from "src/components/core/Tabs";
import { NumberInput } from "src/components/shared/NumberInput";
import { ResourceIconTooltip } from "src/components/shared/ResourceIconTooltip";
import { TransactionQueueMask } from "src/components/shared/TransactionQueueMask";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { ValueSansMetadata } from "src/network/components/customComponents/ExtendedComponent";
import { getBlockTypeName } from "src/util/common";
import {
  RESOURCE_SCALE,
  ResourceEntityLookup,
  ResourceEnumLookup,
  ResourceImage,
  ResourceStorages,
} from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { createOrder } from "src/util/web3/contractCalls/createOrder";
import { takeOrders } from "src/util/web3/contractCalls/takeOrders";
import { formatEther } from "viem";
import { LinkedAddressDisplay } from "../LinkedAddressDisplay";

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

type Listing = ValueSansMetadata<typeof components.MarketplaceOrder.schema> & { id: Entity };

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

export const CreateOrderForm = () => {
  const { network } = useMud();
  // State for form fields
  const [selectedResource, setSelectedResource] = useState<Entity | "default">("default");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const resources = useMemo(() => Array.from(ResourceStorages), []);

  // Handle form submission
  const handleSubmit = (e: React.MouseEvent | undefined) => {
    e?.preventDefault();
    const scaledPrice = BigInt(Number(price) * 1e18) / RESOURCE_SCALE;
    const scaledQuantity = BigInt(quantity) * RESOURCE_SCALE;
    console.log("submit", selectedResource, formatEther(scaledPrice), scaledQuantity.toString());
    if (selectedResource === "default") return;
    createOrder(selectedResource, scaledQuantity, scaledPrice, network);
  };

  return (
    <div className="w-full h-full flex justify-center">
      <form className="max-w-lg flex flex-col gap-4">
        <div>
          <label htmlFor="resource" className="block text-sm font-medium text-gray-300">
            Resource
          </label>
          <select
            id="resource"
            placeholder="Select Resource"
            value={selectedResource}
            onChange={(e) => setSelectedResource(e.target.value as Entity)}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-gray-300 rounded-md shadow-sm focus:outline-none text-gray-800 focus:ring-secondary focus:border-secondary"
          >
            <option className="text-gray-300" value="default" disabled hidden>
              Select a resource
            </option>
            {resources.map((resource) => (
              <option key={resource} value={resource}>
                {getBlockTypeName(resource)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 justify-between">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-300">
              Price per unit
            </label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-gray-300 rounded-md shadow-sm focus:outline-none text-gray-800 focus:ring-secondary focus:border-secondary"
            />
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-300">
              Quantity
            </label>
            <input
              min="0"
              step="1"
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-gray-300 rounded-md shadow-sm focus:outline-none text-gray-800 focus:ring-secondary focus:border-secondary"
            />
          </div>
        </div>
        <div>
          <Button
            disabled={!price || !quantity || selectedResource == "default"}
            onClick={handleSubmit}
            className="w-full bg-secondary"
          >
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
};

export const TakeOrderForm = ({ selectedItem }: { selectedItem: Entity | undefined }) => {
  const { network } = useMud();
  const [takenOrders, setTakenOrders] = useState<Record<Entity, bigint>>({});

  const allListings = components.MarketplaceOrder.useAll().map((order) => {
    return { ...components.MarketplaceOrder.get(order)!, id: order };
  });
  // const allListings = dummyListings;

  const takenResources: Record<Entity, bigint> = useMemo(() => {
    return Object.entries(takenOrders).reduce((acc, [id, count]) => {
      const listing = allListings.find((listing) => listing.id === id);
      if (!listing) return acc;
      const resource = ResourceEntityLookup[listing.resource as EResource];
      return { ...acc, [resource]: (acc[resource] ?? 0n) + count };
    }, {} as Record<Entity, bigint>);
  }, [takenOrders, allListings]);

  const itemListings = useMemo(() => {
    if (!selectedItem) return [];
    const resourceEnum = ResourceEnumLookup[selectedItem];
    return allListings.filter(
      (listing) => listing.resource === resourceEnum && network.playerEntity !== listing.seller
    );
  }, [allListings, selectedItem, network.playerEntity]);

  // Update taken orders
  const handleTakeOrderChange = (id: Entity, count: bigint) => {
    if (count === 0n) {
      const newTakenOrders = { ...takenOrders };
      delete newTakenOrders[id];
      setTakenOrders(newTakenOrders);
      return;
    }
    setTakenOrders({ ...takenOrders, [id]: count });
  };
  // Calculate total cost and taken resources
  const totalCost = Object.entries(takenOrders).reduce((acc, [id, count]) => {
    const listing = allListings.find((listing) => listing.id === id);
    if (!listing) return acc;
    console.log("price:", formatEther(listing.price));
    console.log("count:", count);
    return acc + listing.price * count;
  }, 0n);

  // Clear all selections
  const clearSelections = () => {
    setTakenOrders({});
  };
  return (
    <div>
      {selectedItem ? (
        <ResourceListings listings={itemListings} takenOrders={takenOrders} setOrder={handleTakeOrderChange} />
      ) : (
        "Select a resource to view listings"
      )}
      <div className="mt-4 p-4 border-t border-gray-200 text-center">
        <h3 className="text-lg font-semibold">Confirm Order</h3>
        <div className="flex flex-col justify-between items-center gap-2">
          <p className="text-sm">
            Total WETH Spent: <span className="font-medium">{formatEther(totalCost)}</span>
          </p>
          <div className="text-sm">
            Taken Resources:
            <div className="font-medium grid grid-cols-2 w-full">
              {Object.entries(takenResources).map(([resource, count]) => (
                <Badge className="text-xs gap-2" key={`taken-${resource}`}>
                  <ResourceIconTooltip
                    name={getBlockTypeName(resource as Entity)}
                    image={ResourceImage.get(resource as Entity) ?? ""}
                    resource={resource as Entity}
                    playerEntity={network.playerEntity}
                    amount={count}
                    fractionDigits={3}
                  />
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            onClick={clearSelections}
            disabled={Object.keys(takenOrders).length === 0}
          >
            Clear
          </Button>

          <TransactionQueueMask queueItemId={hashEntities(...[network.playerEntity, ...Object.keys(takenOrders)])}>
            <Button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={Object.keys(takenOrders).length === 0}
              onClick={() => {
                takeOrders(takenOrders, network);
              }}
            >
              Submit
            </Button>
          </TransactionQueueMask>
        </div>
      </div>
    </div>
  );
};

export const ResourceListings = ({
  listings,
  takenOrders,
  setOrder,
}: {
  listings: Listing[];
  takenOrders: Record<Entity, bigint>;
  setOrder: (orderId: Entity, count: bigint) => void;
}) => {
  if (listings.length === 0) return <div>No listings</div>;

  return (
    <div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
          </tr>
        </thead>
        <tbody>
          {listings.map((listing) => {
            const scaledCount = Number(listing.count) / Number(RESOURCE_SCALE);
            const startingValue = (takenOrders[listing.id] ?? 0n) / RESOURCE_SCALE;
            return (
              <tr key={`listing-${listing.id}`}>
                <td className="px-6 py-4 whitespace-nowrap">{formatEther(listing.price * RESOURCE_SCALE)}</td>
                <td className="px-6 py-4 whitespace-nowrap">{scaledCount}</td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <LinkedAddressDisplay entity={listing.seller as Entity} />
                </td>
                <td>
                  <NumberInput
                    startingValue={Number(startingValue)}
                    max={scaledCount}
                    onChange={(e) => setOrder(listing.id, BigInt(e) * RESOURCE_SCALE)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
