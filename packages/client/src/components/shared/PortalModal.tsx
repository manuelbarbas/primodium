import { primodium } from "@game/api";
import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";

interface ModalProps {
  show: boolean;
  fullscreen?: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

const PortalModal: React.FC<ModalProps> = ({ show, onClose, children, title, fullscreen = false }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { enableInput, disableInput } = primodium.api(AsteroidMap.KEY)!.input;

  useEffect(() => {
    const handleEscPress = (event: KeyboardEvent) => {
      if (show && event.key === "Escape") {
        onClose();
      }
    };

    if (show) {
      disableInput();
    } else {
      enableInput();
    }

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
          className="fixed inset-0 flex items-center justify-center z-[1000] bg-black bg-opacity-60 text-white font-mono w-full rounded p-2"
          onClick={handleClickOutside}
        >
          <div
            ref={modalRef}
            className={`bg-slate-900/90 border-4 border-cyan-400 ring ring-cyan-700s max-h-full shadow-2xl flex flex-col rounded-xl overflow-hidden ${
              fullscreen ? "w-full h-full" : ""
            }`}
          >
            <div className="bg-slate-700 flex justify-between items-center px-2 py-2 w-full text-sm bg-gradient-to-b from-transparent to-slate-900/20">
              <div className="flex items-center text-pink-50">&nbsp;{title}</div>
              <div className="flex space-x-1">
                <button className="w-3 h-3 bg-red-400 rounded-full" onClick={onClose} />
              </div>
            </div>

            <div className="w-full overflow-y-auto scrollbar flex-grow">{children}</div>
          </div>
        </div>
      )}
    </>,
    document.getElementById("modal-root")!
  );
};

export default PortalModal;
