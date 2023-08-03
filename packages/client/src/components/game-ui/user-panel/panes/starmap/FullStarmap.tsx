import PortalModal from "src/components/shared/PortalModal";
import { Starmap } from "./Starmap";

export const FullStarmap: React.FC<{ show: boolean; onClose: () => void }> = ({
  show,
  onClose,
}) => {
  return (
    <PortalModal show={show} onClose={onClose} title="Starmap" fullscreen>
      <div className="w-full h-full">
        {show && <Starmap id={"full-starmap"} />}
      </div>
    </PortalModal>
  );
};
