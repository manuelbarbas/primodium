import { Entity } from "@primodiumxyz/reactive-tables";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { SecondaryCard } from "@/components/core/Card";
import { Modal } from "@/components/core/Modal";
import { Swap } from "../../../global/modals/Swap";

export const OpenMarket: React.FC<{ building: Entity }> = ({ building }) => {
  return (
    <SecondaryCard className="w-full flex-row items-center justify-center gap-2 relative">
      <div className="absolute top-0 left-0 w-full h-full topographic-background opacity-25 z-0" />
      <Modal title="Swap Resources">
        <Modal.Button className="btn-md w-fit btn-secondary">
          <div className="flex gap-2 items-center z-10">
            <img src={InterfaceIcons.Trade} className="w-8 h-8" />
            <p className="uppercase text-xs font-bold">Swap</p>
          </div>
        </Modal.Button>
        <Modal.Content>
          <Swap marketEntity={building} />
        </Modal.Content>
      </Modal>
    </SecondaryCard>
  );
};
