import { Join } from "src/components/core/Join";
import { Tabs } from "src/components/core/Tabs";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { EntityType } from "src/util/constants";
import { formatEther } from "viem";
import { UtilityLabel } from "../resources/utilities/UtilityLabel";
import { CreateOrderForm } from "./CreateOrderForm";
import { TakeOrderForm } from "./TakeOrderForm";

export const Marketplace = () => {
  const { network } = useMud();
  const balance = components.WETHBalance.use(network.playerEntity)?.value ?? 0n;

  return (
    <div className="h-full w-full absolute p-4 bg-neutral">
      <Tabs className="relative h-full flex flex-col items-center">
        <div className="flex gap-2 items-center">
          <Join className="w-fit">
            <Tabs.Button index={0}>Buy</Tabs.Button>
            <Tabs.Button index={1}>Your Orders</Tabs.Button>
          </Join>
          <div className="absolute right-2 margin-auto my-2 flex flex-col items-end justify-center">
            <div className="flex justify-center items-center gap-1 rounded-md p-1 h-full">
              <p className="font-bold">{formatEther(balance)}</p>
              <p className="flex h-fit text-xs bg-warning px-1 rounded-sm font-bold items-center">WETH</p>
            </div>

            <div className="flex items-center justify-center rounded-md p-1 h-full">
              <UtilityLabel name="Orders" resourceId={EntityType.MaxOrders} />
            </div>
          </div>
        </div>
        <Tabs.Pane index={0} className="w-full grow border-none">
          <TakeOrderForm />
        </Tabs.Pane>
        <Tabs.Pane index={1} className="w-full grow border-none">
          <CreateOrderForm />
        </Tabs.Pane>
      </Tabs>
    </div>
  );
};
