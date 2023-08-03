import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";

interface ModalProps {
  show: boolean;
  fullscreen?: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

const PortalModal: React.FC<ModalProps> = ({
  show,
  onClose,
  children,
  title,
  fullscreen = false,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscPress = (event: KeyboardEvent) => {
      if (show && event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscPress);
    return () => {
      window.removeEventListener("keydown", handleEscPress);
    };
  }, [onClose, show]);

  const handleClickOutside = (event: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      onClose();
    }
  };

  return ReactDOM.createPortal(
    <>
      {show && (
        <div
          className="fixed inset-0 flex items-center justify-center z-[10000] bg-black bg-opacity-60 text-white font-mono w-full"
          onClick={handleClickOutside}
        >
          <div
            ref={modalRef}
            className={`bg-slate-900/90 border-4 border-b-8 border-cyan-600 max-h-full shadow-2xl flex flex-col ${
              fullscreen ? "w-full h-full" : ""
            }`}
          >
            <div className="bg-gray-800 flex justify-between items-center px-2 w-full text-sm">
              <div className="flex items-center text-pink-50">
                &nbsp;{title}
              </div>
              <div className="flex space-x-1">
                <button className="w-3 h-3 bg-red-400" onClick={onClose} />
              </div>
            </div>

            <div className="w-full overflow-y-auto scrollbar flex-grow">
              {children}
            </div>
          </div>
        </div>
      )}
    </>,
    document.getElementById("modal-root")!
  );
};

export default PortalModal;
