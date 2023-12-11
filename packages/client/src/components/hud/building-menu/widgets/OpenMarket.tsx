import { SecondaryCard } from "src/components/core/Card";
import { Modal } from "src/components/core/Modal";
import { Marketplace } from "../../marketplace/Marketplace";

export const OpenMarket: React.FC = () => {
  return (
    <SecondaryCard className="w-full flex-row items-center justify-center gap-2 relative">
      <div className="absolute top-0 left-0 w-full h-full topographic-background opacity-25 z-0" />
      <Modal title="marketplace">
        <Modal.Button className="btn-md w-fit btn-secondary">
          <div className="flex gap-2 items-center z-10">
            <img src="/img/icons/trade.png" className="w-8 h-8" />
            <p className="uppercase text-xs font-bold">open market</p>
          </div>
        </Modal.Button>
        <Modal.Content className="w-screen h-screen">
          <Marketplace />
        </Modal.Content>
      </Modal>
    </SecondaryCard>
  );
};
