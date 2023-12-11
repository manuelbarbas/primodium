import { Entity } from "@latticexyz/recs";
import { EResource } from "contracts/config/enums";
import { useMemo, useState } from "react";
import { Button } from "src/components/core/Button";
import { SecondaryCard } from "src/components/core/Card";
import { useMud } from "src/hooks";
import { useFullResourceCounts } from "src/hooks/useFullResourceCount";
import { components } from "src/network/components";
import { getBlockTypeName } from "src/util/common";
import { EntityType, RESOURCE_SCALE, ResourceEntityLookup, ResourceStorages } from "src/util/constants";
import { createOrder } from "src/util/web3/contractCalls/createOrder";
import { PlayerListings } from "./PlayerListings";

export type UserListing = {
  resource: Entity;
  price: bigint;
  count: bigint;
  seller: Entity;
  id: Entity;
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
    const scaledPrice = (BigInt(price) * BigInt(1e18)) / RESOURCE_SCALE;
    const scaledQuantity = BigInt(quantity) * RESOURCE_SCALE;
    if (selectedResource === "default") return;
    createOrder(selectedResource, scaledQuantity, scaledPrice, network);
  };

  const allListings: UserListing[] = components.MarketplaceOrder.useAll().map((orderEntity) => {
    const order = components.MarketplaceOrder.get(orderEntity)!;
    return {
      resource: ResourceEntityLookup[order.resource as EResource],
      price: order.price,
      count: order.count,
      seller: order.seller as Entity,
      id: orderEntity,
    };
  });

  const resourceCounts = useFullResourceCounts();
  const ordersAvailable = useMemo(
    () => resourceCounts.get(EntityType.MaxOrders)?.resourceCount ?? 0n,
    [resourceCounts]
  );

  const itemListings = useMemo(() => {
    return allListings.filter((listing) => network.playerEntity === listing.seller);
  }, [allListings, network.playerEntity]);

  const availableResources = useMemo(() => {
    const resourcesUsed: Record<Entity, bigint> = {};
    itemListings.forEach((listing) => {
      if (!resourcesUsed[listing.resource]) resourcesUsed[listing.resource] = 0n;
      resourcesUsed[listing.resource] += listing.count / RESOURCE_SCALE;
    });
    resources.forEach((resource) => {
      const resourceCount = resourceCounts.get(resource)?.resourceCount ?? 0n;
      const resourcesToClaim = resourceCounts.get(resource)?.resourcesToClaim ?? 0n;
      const totalResources = resourceCount + resourcesToClaim / RESOURCE_SCALE;
      resourcesUsed[resource] = totalResources - (resourcesUsed[resource] ?? 0n);
    });
    return resourcesUsed;
  }, [resourceCounts, resources, itemListings]);

  return (
    <div className="w-full h-full grid grid-cols-10 flex gap-4">
      <SecondaryCard className="col-span-3 flex flex-col gap-2 overflow-auto scrollbar">
        <p className="text-lg">New Order</p>
        <form className="max-w-lg flex flex-col w-full gap-4">
          <select
            id="resource"
            placeholder="Select Resource"
            value={selectedResource}
            onChange={(e) => setSelectedResource(e.target.value as Entity)}
            className="w-full p-4 bg-white/10 rounded-md focus:ring-secondary focus:border-secondary"
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
          <input
            type="number"
            placeholder="price per unit"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="block w-full p-4 rounded-md bg-transparent border border-bottom-1 border-gray-500 focus:outline-none text-gray-300 focus:ring-secondary focus:border-secondary"
          />
          <input
            min="0"
            step="1"
            type="number"
            placeholder="count"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="block w-full p-4 rounded-md bg-transparent border border-bottom-1 border-gray-500 focus:outline-none text-gray-300 focus:ring-secondary focus:border-secondary"
          />
          <Button
            disabled={
              !price ||
              !quantity ||
              selectedResource == "default" ||
              BigInt(quantity) > availableResources[selectedResource] ||
              ordersAvailable == 0n
            }
            onClick={handleSubmit}
            className="w-full bg-secondary p-4"
          >
            Submit
          </Button>
          {ordersAvailable === 0n && <div className="text-center text-xs text-error">You have no orders available</div>}
          {selectedResource !== "default" && (
            <div
              className={`text-center text-xs ${
                availableResources[selectedResource] == 0n ? "text-error" : "font-gray-500"
              }`}
            >
              {availableResources[selectedResource].toString()} {getBlockTypeName(selectedResource)} available
            </div>
          )}
        </form>
      </SecondaryCard>
      <SecondaryCard className="col-span-7 flex flex-col gap-2 overflow-auto scrollbar">
        <p className="text-lg">Manage Listings</p>
        <PlayerListings listings={itemListings} availableResources={availableResources} />
      </SecondaryCard>
    </div>
  );
};
