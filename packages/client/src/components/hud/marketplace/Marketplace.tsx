import { Join } from "src/components/core/Join";
import { Tabs } from "src/components/core/Tabs";
import { ResourceIconTooltip } from "src/components/shared/ResourceIconTooltip";
import { useMud } from "src/hooks";
import { useFullResourceCount } from "src/hooks/useFullResourceCount";
import { components } from "src/network/components";
import { EntityType, ResourceImage } from "src/util/constants";
import { CreateOrderForm } from "./CreateOrderForm";
import { TakeOrderForm } from "./TakeOrderForm";
import { CurrencyDisplay } from "src/components/shared/CurrencyDisplay";
import { useSettingsStore } from "src/game/stores/SettingsStore";

export const Marketplace = () => {
  const { network } = useMud();
  const balance = components.WETHBalance.use(network.playerEntity)?.value ?? 0n;
  const { resourceCount } = useFullResourceCount(EntityType.MaxOrders);
  const resourceIcon = ResourceImage.get(EntityType.MaxOrders) ?? "";
  const unitDisplay = useSettingsStore((state) => state.unitDisplay);

  return (
    <div className="h-full w-full p-4 bg-neutral">
      <Tabs className="relative h-full flex flex-col items-center">
        <div className="flex gap-2 items-center">
          <Join className="w-fit border border-secondary/25">
            <Tabs.Button showActive index={0}>
              Buy
            </Tabs.Button>
            <Tabs.Button showActive index={1}>
              Your Orders
            </Tabs.Button>
          </Join>
          <div className="absolute left-2 margin-auto my-2 flex flex-col text-xs">
            <div className="flex justify-center items-center gap-1 mb-1 h-full">
              <CurrencyDisplay wei={balance} className="font-bold" />
              <p className="font-bold text-success">{unitDisplay === "ether" ? "wETH" : "GWEI"}</p>
            </div>
            <hr className="w-full border-secondary/50" />

            <ResourceIconTooltip
              className="mt-1"
              name={"Max Orders"}
              amount={resourceCount}
              resource={EntityType.MaxOrders}
              image={resourceIcon}
              fontSize={"xs"}
            />
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
