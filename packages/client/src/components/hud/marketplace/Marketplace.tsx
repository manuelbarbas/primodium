import { Entity } from "@latticexyz/recs";
import { useState } from "react";
import { Join } from "src/components/core/Join";
import { Tabs } from "src/components/core/Tabs";
import { CreateOrderForm } from "./CreateOrderForm";
import { TakeOrderForm } from "./TakeOrderForm";

export const Marketplace = () => {
  const [takenOrders, setTakenOrders] = useState<Record<Entity, bigint>>({});
  return (
    <div className="h-full w-full absolute p-2 bg-neutral">
      <Tabs className="h-full flex flex-col items-center">
        <Join className="w-fit">
          <Tabs.Button index={0}>Buy</Tabs.Button>
          <Tabs.Button index={1}>Sell</Tabs.Button>
        </Join>
        <Tabs.Pane index={0} className="w-full grow border-none">
          <TakeOrderForm orders={[takenOrders, setTakenOrders]} />
        </Tabs.Pane>
        <Tabs.Pane index={1} className="w-full grow border-none">
          <CreateOrderForm />
        </Tabs.Pane>
      </Tabs>
    </div>
  );
};
