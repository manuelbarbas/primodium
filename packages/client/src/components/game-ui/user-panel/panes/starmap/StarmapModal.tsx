import PortalModal from "src/components/shared/PortalModal";
import { Starmap } from "./Starmap";

export const FullStarmap: React.FC<{ show: boolean; onClose: () => void }> = ({
  show,
  onClose,
}) => {
  return (
    <PortalModal show={show} onClose={onClose}>
      <div className="w-[40rem] h-96">{<Starmap gridSize={16} />}</div>
    </PortalModal>
  );
};
