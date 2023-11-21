import { Entity } from "@latticexyz/recs";
import { EResource } from "contracts/config/enums";
import { useMemo, useState } from "react";
import { Badge } from "src/components/core/Badge";
import { Button } from "src/components/core/Button";
import { NumberInput } from "src/components/shared/NumberInput";
import { ResourceIconTooltip } from "src/components/shared/ResourceIconTooltip";
import { TransactionQueueMask } from "src/components/shared/TransactionQueueMask";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { getBlockTypeName } from "src/util/common";
import { RESOURCE_SCALE, ResourceEntityLookup, ResourceEnumLookup, ResourceImage } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { takeOrders } from "src/util/web3/contractCalls/takeOrders";
import { formatEther } from "viem";
import { LinkedAddressDisplay } from "../LinkedAddressDisplay";
import { Listing } from "./Marketplace";

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

const ResourceListings = ({
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
