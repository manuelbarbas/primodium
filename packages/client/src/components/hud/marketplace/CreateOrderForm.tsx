import { Entity } from "@latticexyz/recs";
import { EResource } from "contracts/config/enums";
import { useMemo, useState } from "react";
import { FaArrowDown, FaArrowUp, FaMinus, FaUndo } from "react-icons/fa";
import { Button } from "src/components/core/Button";
import { SecondaryCard } from "src/components/core/Card";
import { IconLabel } from "src/components/core/IconLabel";
import { NumberInput } from "src/components/shared/NumberInput";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { getBlockTypeName } from "src/util/common";
import { RESOURCE_SCALE, ResourceEntityLookup, ResourceImage, ResourceStorages } from "src/util/constants";
import { createOrder } from "src/util/web3/contractCalls/createOrder";
import { cancelOrder, updateOrder } from "src/util/web3/contractCalls/updateOrder";
import { formatEther } from "viem";

type Listing = {
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
    const scaledPrice = BigInt(Number(price) * 1e18) / RESOURCE_SCALE;
    const scaledQuantity = BigInt(quantity) * RESOURCE_SCALE;
    if (selectedResource === "default") return;
    createOrder(selectedResource, scaledQuantity, scaledPrice, network);
  };

  const allListings: Listing[] = components.MarketplaceOrder.useAll().map((orderEntity) => {
    const order = components.MarketplaceOrder.get(orderEntity)!;
    return {
      resource: ResourceEntityLookup[order.resource as EResource],
      price: order.price,
      count: order.count,
      seller: order.seller as Entity,
      id: orderEntity,
    };
  });

  const itemListings = useMemo(() => {
    return allListings.filter((listing) => network.playerEntity === listing.seller);
  }, [allListings, network.playerEntity]);

  return (
    <div className="w-full h-full grid grid-cols-10 flex gap-4">
      <SecondaryCard className="col-span-3 flex flex-col gap-2 overflow-auto scrollbar">
        <p className="text-lg">New Order</p>
        <form className="max-w-lg flex flex-col w-full gap-4">
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
      </SecondaryCard>
      <SecondaryCard className="col-span-7 flex flex-col gap-2 overflow-auto scrollbar">
        <p className="text-lg">Manage Orders</p>
        <ResourceListings listings={itemListings} />
      </SecondaryCard>
    </div>
  );
};

const ResourceListings = ({ listings }: { listings: Listing[] }) => {
  const { network } = useMud();
  const [listingUpdates, setListingUpdates] = useState<{ [key: string]: { newPrice?: bigint; newCount?: bigint } }>({});
  const [sortConfig, setSortConfig] = useState<{ key: keyof Listing | null; direction: "ascending" | "descending" }>({
    key: null,
    direction: "ascending",
  });

  const sortedListings = [...listings].sort((a, b) => {
    if (sortConfig.key === null) return 0;
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? 1 : -1;
    }
    return 0;
  });

  const requestSort = (key: keyof Listing) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };
  const getSortIcon = (key: string) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "ascending" ? <FaArrowDown /> : <FaArrowUp />;
    }
    return <FaMinus />;
  };

  if (listings.length === 0) return <div className="w-full h-full text-center p-20 uppercase bold">No listings</div>;

  return (
    <div className="p-2">
      <table className="min-w-full divide-y divide-accent">
        <thead>
          <tr>
            <th className="sortable-header">
              <div
                onClick={() => requestSort("resource")}
                className="flex gap-2 items-center justify-center cursor-pointer"
              >
                Resource {getSortIcon("resource")}
              </div>
            </th>

            <th className="sortable-header">
              <div
                onClick={() => requestSort("price")}
                className="flex gap-2 justify-center items-center cursor-pointer"
              >
                Price {getSortIcon("price")}
              </div>
            </th>
            <th className="sortable-header">
              <div
                onClick={() => requestSort("count")}
                className="flex gap-2 items-center justify-center cursor-pointer"
              >
                Count {getSortIcon("count")}
              </div>
            </th>
            <th className="sortable-header">Update</th>
            <th className="sortable-header">Delete</th>
          </tr>
        </thead>
        <tbody>
          {sortedListings.map((listing) => {
            const newCount = listingUpdates[listing.id]?.newCount;
            const countDiff = !!newCount && newCount !== listing.count;
            const newPrice = listingUpdates[listing.id]?.newPrice;
            const priceDiff = !!newPrice && newPrice !== listing.price;
            const scaledCount = Number(listing.count) / Number(RESOURCE_SCALE);

            return (
              <tr key={`listing-${listing.id}`}>
                <td className="text-center align-middle">
                  <IconLabel
                    imageUri={ResourceImage.get(listing.resource as Entity) ?? ""}
                    tooltipDirection={"right"}
                    text={""}
                  />
                </td>

                <td className="text-center align-middle py-1">
                  <div className="w-full justify-center flex p-1 gap-1 items-center">
                    <NumberInput
                      toFixed={8}
                      reset={!newPrice}
                      startingValue={Number(formatEther(listing.price * RESOURCE_SCALE))}
                      onChange={function (val: number): void {
                        setListingUpdates({
                          ...listingUpdates,
                          [listing.id]: {
                            ...listingUpdates[listing.id],
                            newPrice: BigInt(val * 1e18) / RESOURCE_SCALE,
                          },
                        });
                      }}
                    />
                    <FaUndo
                      className={`${!priceDiff ? "opacity-25" : ""}`}
                      onClick={() => {
                        setListingUpdates({
                          ...listingUpdates,
                          [listing.id]: { ...listingUpdates[listing.id], newPrice: undefined },
                        });
                      }}
                    />
                  </div>
                </td>
                <td className="text-center align-middle">
                  <div className="flex justify-center w-full p-1 gap-1 items-center">
                    <NumberInput
                      startingValue={scaledCount}
                      toFixed={2}
                      reset={!newCount}
                      onChange={function (val: number): void {
                        setListingUpdates({
                          ...listingUpdates,
                          [listing.id]: {
                            ...listingUpdates[listing.id],
                            newCount: BigInt(val * Number(RESOURCE_SCALE)),
                          },
                        });
                      }}
                    />
                    <FaUndo
                      className={`${!countDiff ? "opacity-25" : ""}`}
                      onClick={() => {
                        setListingUpdates({
                          ...listingUpdates,
                          [listing.id]: { ...listingUpdates[listing.id], newCount: undefined },
                        });
                      }}
                    />
                  </div>
                </td>
                <td className="text-center">
                  <Button
                    disabled={!priceDiff && !countDiff}
                    onClick={() => {
                      updateOrder(
                        listing.id,
                        listing.resource,
                        newPrice || listing.price,
                        newCount || listing.count,
                        network
                      );
                    }}
                  >
                    Update
                  </Button>
                </td>
                <td className="text-center">
                  <Button onClick={() => cancelOrder(listing.id, network)}>Delete</Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
