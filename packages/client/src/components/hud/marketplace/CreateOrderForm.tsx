import { Entity } from "@latticexyz/recs";
import { useMemo, useState } from "react";
import { Button } from "src/components/core/Button";
import { SecondaryCard } from "src/components/core/Card";
import { useMud } from "src/hooks";
import { getBlockTypeName } from "src/util/common";
import { RESOURCE_SCALE, ResourceStorages } from "src/util/constants";
import { createOrder } from "src/util/web3/contractCalls/createOrder";

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

  return (
    <div className="w-full h-full grid grid-cols-10 flex justify-center gap-4">
      <SecondaryCard className="col-span-3 flex flex-col items-center gap-2 overflow-auto scrollbar">
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
      <SecondaryCard className="col-span-7 flex flex-col items-center gap-2 overflow-auto scrollbar">
        <p className="text-lg">Manage Orders</p>
      </SecondaryCard>
    </div>
  );
};
