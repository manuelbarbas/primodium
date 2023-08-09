import PortalModal from "src/components/shared/PortalModal";
import { Starmap } from "./Starmap";
import { StarmapUI } from "src/components/starmap-ui/StarmapUI";

export const FullStarmap: React.FC<{ show: boolean; onClose: () => void }> = ({
  show,
  onClose,
}) => {
  return (
    <PortalModal show={show} onClose={onClose} title="Starmap" fullscreen>
      <div className="relative w-full h-full">
        <Starmap id={"full-starmap"} />
        <StarmapUI />
      </div>
    </PortalModal>
  );
};
